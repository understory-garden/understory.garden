/* SetupGnome - Gives your gnome new instructions for what to do.

  This request handler will not be authenticated.
  That means it must not accept the data in the request as valid.
  Instead, this function is simply a trigger,
  which then reads the config file directly from the users solid pod.

  For now, we only support one Gnome type: Gates

    workspace/gnomes/gate.ttl
      type: gate
      template: single-page-gate // matches github.com/understory-garden/single-page-gate


  POST /api/setup-gnome
    data {
      gnomeConfigUrl
    }

  -> grab gnomes.ttl file
  -> parse data
  -> setup github
     -> clone template repo over github project, setup if necessary
  -> setup vercel
     -> call vercel api to setup project
     -> call vercel project to set webid env variable
      # add github ops user to vercel team

Recommended links from Michiel on supporting non-public gnomes:
  - https://github.com/solid/web-access-control-tests/blob/main/test/helpers/env.ts#L19
  - https://github.com/solid/solid-auth-fetcher/blob/master/src/obtainAuthHeaders.ts#L57
  - Talk with Jeff Zucker about node auth
  - https://github.com/solid/solid-node-client
*/

import * as base58 from 'micro-base58'
import { getThing, getSolidDataset, getStringNoLocale } from '@inrupt/solid-client'
import * as octokit from '@octokit/request'
import { US } from '../../vocab'
import fetch from 'node-fetch'
import greg from 'greg'
import emptyGitHubCommit from 'make-empty-github-commit'
import { createClient } from '@supabase/supabase-js'

const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG
const GnomesOrg = process.env.GITHUB_GNOMES_ORG
const GithubToken = process.env.GITHUB_TOKEN_UGK
const GithubAuthHeaders = { authorization: `token ${GithubToken}` }
const GnomesIndexRepo = 'index'
const VercelToken = process.env.VERCEL_TOKEN_UGK
const VercelHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VercelToken}` }
const VercelTeam = process.env.VERCEL_TEAM_ID || 'team_Mb1ivhnQAH2uo2nNrPBbDwk4' // Understory's team
const SupabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const SupabaseUrl = process.env.SUPABASE_URL

const supabase = createClient(SupabaseUrl, SupabaseServiceKey)

function templateId(template) {
  return `${TemplateOrg}/${template}`
}

function gnomeId(gnomeConfigURL) {
  return base58.encode(gnomeConfigURL)
}

function gnomeIndexPath(gnomeId) {
  return `/${gnomeId}.json`
}

function randomId() {
  // https://blog.asana.com/2011/09/6-sad-squid-snuggle-softly/
  // should reimplement with our own list of adjectives, nouns, verbs, and adverbs at some point, rather than relying on this greg lib
  return greg.sentence().replace(/\s+/g, '-').toLowerCase()
}

async function loadPublicGnomeConfig(url) {
  const gnomeConfigResource = await getSolidDataset(url)
  const gnomeConfigThing = getThing(gnomeConfigResource, url)
  const gnomeConfig = {
    url,
    type: getStringNoLocale(gnomeConfigThing, US.hasGnomeType),
    template: getStringNoLocale(gnomeConfigThing, US.usesGateTemplate),
    gnomeId: gnomeId(url),
  }
  if (gnomeConfig.type !== "gate") {
    throw new Error(`Only gnomes of type Gate are currently supported.`)
  }
  return gnomeConfig
}

async function findInIndex(config) {
  const { gnomeId } = config
  try {
  let { data, error } = await supabase
    .from('index')
    .select('*')
    .eq('url', config.url)
    console.log('supa find', data)
    return data[0] && data[0].config
  } catch (e) {
    if (e.status === 404) {
      // expected error if gnome does not exist
      return null
    } else {
      throw e
    }
  }
}

async function updateIndex(config) {
  const { gnomeId } = config
  try {
  const { data, error } = await supabase
    .from('index')
    .insert([
      { url: config.url,
        name: config.projectName,
        config: config
      },
    ], { upsert: 'true' })
    console.log('supa update ', data)
    return data[0] && data[0].config
  } catch (e) {
    console.log(e)
    return null
  }
}

async function createGnomesRepo(config) {
  const { gnomeId, template } = config
  const newProjectName = randomId()
  try {
    console.log(`Creating repo: { template_owner: ${TemplateOrg}, template_repo: ${template}, owner: ${GnomesOrg}, name: ${newProjectName}, description: ${templateId(template)} }`)
    const { data } = await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
      headers: GithubAuthHeaders,
      template_owner: TemplateOrg,
      template_repo: template,
      owner: GnomesOrg,
      name: newProjectName,
      private: true,
      mediaType: {
        previews: [
          'baptiste' // TODO: This is apparently an experimental github API feature. Probably shouldn't rely on it but it's the easist for now.
        ]
      }
    })
    config.projectName = newProjectName
    config.githubProjectName = data.full_name
    return await updateIndex(config)
  }
  catch (e) {
    console.log(e)
    return null
  }
}

async function findOrCreateGnomesRepo(config) {
  const { gnomeId, url } = config
  const exists = await findInIndex(config)
  if (exists) {
    console.log(`Found index entry ${exists.gnomeId} for url ${config.url}`)
    return exists
  } else {
    return await createGnomesRepo(config)
  }
}

async function findVercelProject(config) {
  const response = await fetch(`https://api.vercel.com/v1/projects/${config.projectName}?teamId=${VercelTeam}`, {
    headers: VercelHeaders
  })
  if (response.ok) {
    const data = await response.json()
    return data.name
  } else {
    if (response.status !== 404) {
      throw new Error(`Unexpected status from findVercelProject for project: ${config.projectName}`)
    }
    return null
  }
}

async function createAndConfigureVercelProject(config) {
  console.log(`Creating new Vercel project named ${config.projectName} in ${VercelTeam}`)
  const response = await fetch(`https://api.vercel.com/v6/projects/?teamId=${VercelTeam}`, {
    method: 'POST',
    body: JSON.stringify({
        name: config.projectName,
        gitRepository: {
          type: `github`,
          repo: config.githubProjectName
        }
      }),
    headers: VercelHeaders
  })
  const project = await response.json()
  console.log(project)

  console.log(`Configuring GNOME_CONFIG_URL on new Vercel project with id ${project.id} in ${VercelTeam}`)
  const envVarResponse = await fetch(`https://api.vercel.com/v2/projects/${project.id}/env?teamId=${VercelTeam}`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'plain',
      key: 'GNOME_CONFIG_URL',
      value: `${config.url}`,
      target: [
        'development',
        'production',
        'preview'
      ]
    }),
    headers: VercelHeaders
  })
  const evData = await envVarResponse.json()

  console.log(`Configuring framework on new Vercel project with id ${project.id} in ${VercelTeam}`)
  const newProjectResponse = await fetch(`https://api.vercel.com/v2/projects/${project.id}?teamId=${VercelTeam}`, {
    method: 'PATCH',
    body: JSON.stringify({
      framework: 'nextjs',
      publicSource: false,
    }),
    headers: VercelHeaders
  })
  const newProject = await newProjectResponse.json()

  return newProject.id
}

async function findOrCreateVercelProject(config) {
  const exists = await findVercelProject(config)
  if (exists) {
    console.log(`Found project ${exists} for url ${config.url}`)
    return exists
  } else {
    return await createAndConfigureVercelProject(config)
  }
}

async function setupPublicGnome(url) {
  const config = await loadPublicGnomeConfig(url)
  config.name = await findOrCreateGnomesRepo(config)
  config.vercelProjectId = await findOrCreateVercelProject(config)
  const { sha } = await emptyGitHubCommit({
    owner: GnomesOrg,
    repo: config.projectName,
    token: GithubToken,
    message: 'I am Greg',
    branch: 'main'
  })
  config.sha = sha
  return config
}

module.exports = async (req, res) => {
  const { url } = req.body
  try {
    res.json(await setupPublicGnome(url))
  } catch (e) {
    console.log(e.message)
    res.status(500).send(`The Understory Gnome King could not understand your proposal: ${url}`)
  }
};

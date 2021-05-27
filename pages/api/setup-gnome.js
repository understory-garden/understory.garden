/* SetupGnome - Gives your gnome new instructions for what to do.

  This request handler will not be authenticated.
  That means it must not accept the data in the request as valid.
  Instead, this function is simply a trigger,
  which then reads the config file directly from the users solid pod.

  For now, we only support one Gnome type: Gates

    workspace/gnomes.ttl#some-gate-id
      type: gate
      template: single-page-gate // matches github.com/understory-garden/single-page-gate


  POST /api/setup-gnome
    data {
      url // correspondings to the url of a Gnome Thing to deploy
    }
*/

import { getThing, getSolidDataset, getStringNoLocale } from '@inrupt/solid-client'
import * as octokit from '@octokit/request'
import { US } from '../../vocab'
import fetch from 'node-fetch'
import emptyGitHubCommit from 'make-empty-github-commit'
import { createClient } from '@supabase/supabase-js'
import { encodeGnomeUrl, randomReadableId, GnomeStatus } from '../../model/gnomes.jsx'

const MainBranchName = "main"
const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG
const GnomesOrg = process.env.GITHUB_GNOMES_ORG
const GithubToken = process.env.GITHUB_TOKEN_UGK
const GithubAuthHeaders = { authorization: `token ${GithubToken}` }
const VercelToken = process.env.VERCEL_TOKEN_UGK
const VercelHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VercelToken}` }
const VercelTeam = process.env.VERCEL_TEAM_ID || 'team_Mb1ivhnQAH2uo2nNrPBbDwk4' // Understory's team
const SupabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const SupabaseUrl = process.env.SUPABASE_URL

const supabase = createClient(SupabaseUrl, SupabaseServiceKey)

function templateId(template) {
  // TODO: move to model/gnomes?
  return `${TemplateOrg}/${template}`
}

async function loadPublicGnomeConfig(url) {
  const gnomeConfigResource = await getSolidDataset(url)
  const gnomeConfigThing = getThing(gnomeConfigResource, url)
  const gnomeConfig = {
    url,
    type: getStringNoLocale(gnomeConfigThing, US.hasGnomeType),
    template: getStringNoLocale(gnomeConfigThing, US.usesGateTemplate),
    // TODO I don't think this is used any longer, but keepig in for now for good measure.
    // can remove fully after soft launch
    gnomeId: encodeGnomeUrl(url),
    status: GnomeStatus.Requested,
  }
  if (gnomeConfig.type !== "gate") {
    throw new Error(`Only gnomes of type Gate are currently supported.`)
  }
  return gnomeConfig
}

async function findInIndex(config) {
  try {
    let { data, error } = await supabase
      .from('index')
      .select('*')
      .eq('url', config.url)
    const foundConfig = data[0] && data[0].config
    if (foundConfig) {
      console.log('found persistent config ', foundConfig)
    } else {
      console.log('No persisten config found for gnome', config.url)
    }
    return foundConfig
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
  try {
    const { data, error } = await supabase
      .from('index')
      .insert([
        { url: config.url,
          name: config.projectName,
          config: config
        },
      ], { upsert: 'true' })
    const updatedConfig = data[0] && data[0].config
    console.log('updated persistent config ', updatedConfig)
    return updatedConfig
  } catch (e) {
    console.log(e)
    return null
  }
}

async function createGnomesRepo(config) {
  const { template } = config
  const newProjectName = randomReadableId()
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
    const updatedConfig = {
      ...config,
      projectName: newProjectName,
      githubProjectName: data.full_name
    }
    return await updateIndex(updatedConfig)
  }
  catch (e) {
    console.log(e)
    return null
  }
}

async function findOrCreateGnomesRepo(config) {
  const {  url } = config
  const exists = await findInIndex(config)
  if (exists) {
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
    const pageDomain = data.alias && data.alias[0] && data.alias[0].domain
    const updatedConfig = {
      ...config,
      vercelProjectId: data.id,
      pageUrl: pageDomain && `https://${pageDomain}`
    }
    console.log(`Found project ${updatedConfig.vercelProjectId} for url ${updatedConfig.url}`)
    return updatedConfig
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

  const data = await response.json()
  console.log(data)
  const pageDomain = data.alias && data.alias[0] && data.alias[0].domain
  const updatedConfig = {
    ...config,
    vercelProjectId: data.id,
    pageUrl: pageDomain && `https://${pageDomain}`
  }

  console.log(`Configuring GNOME_CONFIG_URL on new Vercel project with id ${data.id} in ${VercelTeam}`)
  const envVarResponse = await fetch(`https://api.vercel.com/v2/projects/${data.id}/env?teamId=${VercelTeam}`, {
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

  console.log(`Configuring framework on new Vercel project with id ${data.id} in ${VercelTeam}`)
  const newProjectResponse = await fetch(`https://api.vercel.com/v2/projects/${data.id}?teamId=${VercelTeam}`, {
    method: 'PATCH',
    body: JSON.stringify({
      framework: 'nextjs',
      publicSource: false,
    }),
    headers: VercelHeaders
  })
  const newProject = await newProjectResponse.json()

  return updatedConfig
}

async function triggerDeploy(config) {
  const main = `heads/${MainBranchName}`

  /* TODO compare the templateMainRef to the gnomesMainRef and maybe pull in changes.
   * I think we need to use actual git for this though, instead of the github api,
   * and I'm not totally sure how to do that in a serverless function. - ianconsolata
  const templateMainRef = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
    owner: TemplateOrg,
    repo: config.template,
    ref: main
  })
  */

  try {
    const gnomesMainRef = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      headers: GithubAuthHeaders,
      owner: GnomesOrg,
      repo: config.projectName,
      ref: main
    })
    let sha = gnomesMainRef.data.object.sha
    console.log("Found main ref", sha)

    const gnomesMainCommit = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
      headers: GithubAuthHeaders,
      owner: GnomesOrg,
      repo: config.projectName,
      commit_sha: gnomesMainRef.data.object.sha
    })
    sha = gnomesMainCommit.data.sha
    console.log("Getting parent commit data ", sha)

    const newGnomesCommit = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
      headers: GithubAuthHeaders,
      owner: GnomesOrg,
      repo: config.projectName,
      message: 'I am Talia, Mother Gnome',
      tree: gnomesMainCommit.data.tree.sha,
      parents: [gnomesMainCommit.data.sha],
    })
    sha = newGnomesCommit.data.sha
    console.log("Creating empty commit ", sha)

    const updatedGnomesMainRef = await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
      headers: GithubAuthHeaders,
      owner: GnomesOrg,
      repo: config.projectName,
      ref: main,
      sha: newGnomesCommit.data.sha,
      force: true // Just clobber the existing template and replace it with current main
    })
    sha = updatedGnomesMainRef.data.object.sha
    console.log("Updated main ref to ", sha)

    return {
      ...config,
      sha: sha
    }
  }
    catch (e) {
      console.log(e)
      return null
    }
}

async function findOrCreateVercelProject(config) {
  const exists = await findVercelProject(config)
  if (exists) {
    return exists
  } else {
    let updatedConfig = await createAndConfigureVercelProject(config)
    return updatedConfig
  }
}

async function setupPublicGnome(url) {
  let config = await loadPublicGnomeConfig(url)
  config = await findOrCreateGnomesRepo(config)
  config = await findOrCreateVercelProject(config)
  config =   {
    ...config,
    status: GnomeStatus.Deployed
  }
  config = await triggerDeploy(config)
  config = await updateIndex(config)
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

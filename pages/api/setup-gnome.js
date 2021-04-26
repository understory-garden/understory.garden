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

const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG
const GnomesOrg = process.env.GITHUB_GNOMES_ORG
const GithubToken = process.env.GITHUB_TOKEN_UGK
const GithubAuthHeaders = { authorization: `token ${GithubToken}` }
const VercelToken = process.env.VERCEL_TOKEN_UGK
const VercelHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VercelToken}` }
const VercelTeam = process.env.VERCEL_TEAM_ID || 'team_Mb1ivhnQAH2uo2nNrPBbDwk4' // Understory's team

function templateId(template) {
  return `${TemplateOrg}/${template}`
}

function repoId(gnomeConfigURL) {
  return base58.encode(gnomeConfigURL)
}

function fullRepoId(gnomeConfigURL) {
  return `${GnomesOrg}/${repoId(gnomeConfigURL)}`
}

function randomId() {
  // https://blog.asana.com/2011/09/6-sad-squid-snuggle-softly/
  // should reimplement with our own list of adjectives, nouns, verbs, and adverbs at some point
  return greg.sentence().replace(/\s+/g, '-').toLowerCase()
}

async function loadPublicGnomeConfig(url) {
  const gnomeConfigResource = await getSolidDataset(url)
  const gnomeConfigThing = getThing(gnomeConfigResource, url)
  const gnomeConfig = {
    url,
    type: getStringNoLocale(gnomeConfigThing, US.hasGnomeType),
    template: getStringNoLocale(gnomeConfigThing, US.usesGateTemplate),
    repo: repoId(url)
  }
  if (gnomeConfig.type !== "gate") {
    throw new Error(`Only gnomes of type Gate are currently supported.`)
  }
  return gnomeConfig
}

async function findGnomesRepo(config) {
  // returns 'org/reponame' of the github repo found
  const { repo, template } = config
  try {
    const { data, status } = await octokit.request('GET /repos/{owner}/{repo}', {
      headers: GithubAuthHeaders,
      owner: GnomesOrg,
      repo: repo
    })
    return data.description
  } catch (e) {
    if (e.status === 404) {
      // expected error if repo does not exist
      return undefined
    } else {
      throw e
    }
  }
}

async function createGnomesRepo(config) {
  // returns 'org/reponame' of the created github repo
  const { repo, template } = config
  try {
    console.log(`Creating repo: { template_owner: ${TemplateOrg}, template_repo: ${template}, owner: ${GnomesOrg}, name: ${repo}, description: ${templateId(template)} }`)
    const { data } = await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
      headers: GithubAuthHeaders,
      template_owner: TemplateOrg,
      template_repo: template,
      owner: GnomesOrg,
      name: repo,
      description: randomId(),
      private: true,
      mediaType: {
        previews: [
          'baptiste' // TODO: This is apparently an experimental github API feature. Probably shouldn't rely on it but it's the easist for now.
        ]
      }
    })
    return data.description
  }
  catch (e) {
    console.log(e)
    return undefined
  }
}

async function findOrCreateGnomesRepo(config) {
  const { repo, url } = config
  const exists = await findGnomesRepo(config)
  if (exists) {
    console.log(`Found repo ${repo} for url ${config.url}`)
    return exists
  } else {
    return await createGnomesRepo(config)
  }
}

async function findVercelProject(config) {
  const response = await fetch(`https://api.vercel.com/v1/projects/${config.name}?teamId=${VercelTeam}`, {
    headers: VercelHeaders
  })
  if (response.ok) {
    const data = await response.json()
    return data.name
  } else {
    if (response.status !== 404) {
      throw new Error(`Unexpected status from findVercelProject for repo: ${config.name}`)
    }
    return undefined
  }
}

async function createAndConfigureVercelProject(config) {
  console.log(`Creating new Vercel project named ${config.name} in ${VercelTeam}`)
  const body = {
    name: config.name,
    gitRepository: {
      type: `github`,
      repo: fullRepoId(config.url)
    }
  }
  const response = await fetch(`https://api.vercel.com/v6/projects/?teamId=${VercelTeam}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: VercelHeaders
  })
  const project = await response.json()

  console.log(`Configuring new Vercel project with id ${project.id} in ${VercelTeam}`)
  const envVarBody = {
    type: 'plain',
    key: 'GNOME_CONFIG_URL',
    value: `${config.url}`,
    target: [
      'development',
      'production',
      'preview'
    ]
  }
  const envVarResponse = await fetch(`https://api.vercel.com/v7/projects/${project.id}/env?teamId=${VercelTeam}`, {
    method: 'POST',
    body: JSON.stringify(envVarBody),
    headers: VercelHeaders
  })
  console.log(envVarResponse)
  const evData = await envVarResponse.json()
  console.log(evData)

  return project.id
}

async function findOrCreateVercelProject(config) {
  const { repo, url } = config
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
    repo: config.repo,
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

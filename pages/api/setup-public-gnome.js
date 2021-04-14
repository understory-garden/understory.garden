/* Update Gnomes- Gives your gnome new instructions for what to do.

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

import { OcktoKit } from "@ocktokit/core"
import * as base58 from 'micro-base58'

const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG || "understory-garden"
const GnomesOrg = process.env.GITHUB_GNOMES_ORG || "understory-gnomes"
const GithubToken = process.env.GITHUB_TOKEN_UGK || ""
const VercelToken = process.env.VERCEL_TOKEN_UGK || ""
const UserAgent = "UnderstoryGnomes v0.0.1"

const octokit = new OctoKit({
  auth: GithubToken,
  userAgent: UserAgent
})

function templateID(template) {
  return `${TemplateOrg}/${template}`
}

function repoID(gnomeConfigURL) {
  return base58.encode(gnomeConfigURL)
}

async function readPublicGnomeConfig(gnomeConfigURL) {
  // await fetch gnomesConfigPath, convert to gnomes js obj
  // returns an onject with a .template property.
  return {
    template: "",
    repo: repoID(gnomeConfigURL)
  }
}

async function findGnomesRepo(repo, template) {
  const repo = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: GnomesOrg,
    repo: repo
  })

  if (repo.description != templateID(template)) {
    throw new Error("Changing the repo template yourself is not yet supported. Please reach out to support@understory.coop and we can update your website manually.")
  }
  return repo
}

async function createGnomesRepo(repo, template) {
  return await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
    template_owner: TemplateOrg,
    template_repo: template,
    owner: GnomesOrg,
    name: repo,
    description: templateID(template), // this is used to check what template was used.
    private: true,
    mediaType: {
      previews: [
        'baptiste' // TODO: This is apparently an experimental github API feature. Probably shouldn't rely on it but it's the easist for now.
      ]
    }
  })
}

async function findOrCreateGnomesRepo(repo, template) {
  const exists = await findGnomesRepo(repo, template)
  if (exists) {
    return exists
  } else {
    return await createGnomesRepo(repo, template)
  }
}

async function setupPublicGnome(gnomeConfigURL) {
  const { template , destinationRepo } = await readPublicGnomeConfig(gnomeConfigURL)
  const gnomesRepo = await findOrCreateGnomesRepo(template, destinationRepo)
}

module.exports = async (req, res) => {
  const { webid } = req.body
  try {
    setupPublicGnome(gnomeConfigURL)
  } catch (e) {
    console.log(e.message)
  }
};

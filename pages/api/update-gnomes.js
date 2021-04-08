/* Update Gnomes- Gives your gnome new instructions for what to do.

  This request handler will not be authenticated.
  That means it must not accept the data in the request as valid.
  Instead, this function is simply a trigger,
  which then reads the config file directly from the users solid pod.

  For now, we only support one Gnome type (WebsiteGnome):

    WebsiteGnome:
      template:  nextjs-swrlit-tailwindcss // maps to github.com/understory-garden/nextjs-swrlit-tailwindcss

  POST /api/update-gnomes

  -> grab gnomes.ttl file
  -> parse data
  -> setup github
     -> clone template repo over github project, setup if necessary
  -> setup vercel
     -> call vercel api to setup project
     -> call vercel project to set webid env variable
      # add github ops user to vercel team


*/

import { OcktoKit } from "@ocktokit/core"

const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG || "understory-garden"
const GnomesOrg = process.env.GITHUB_GNOMES_ORG || "understory-gnomes"
const GnomeKingToken + process.env.GITHUB_TOKEN_UGK || ""

const octokit = new OctoKit({
  auth: GnomeKingToken,
  userAgent: "UnderstoryGnomes v0.0.1",
})

function githubProjectForTemplate(templateName) {
  return TemplateOrg + templateName
}

function githubProjectForWebID(webid) {
  return GnomesOrg + webid // TODO: webid won't work here. Hash or encode somehow?
}

async function readPublicGnomeConfig(webid) {
  const gnomesConfigPath = webid + "/public/gnomes.ttl" // TODO: this probably needs to be fixed
  // await fetch gnomesConfigPath, convert to gnomes js obj
}

async function findGithubProject(webid) {
  return await octokit.request('GET /repos/{owner}/{repo}', {
    owner: GnomesOrg,
    repo: githubProjectForWebID(webid)
  })
}

async function createGithubProjectFromTemplate(webid, template) {
  return await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
    template_owner: TemplateOrg,
    template_repo: template,
    owner: GnomesOrg,
    name: githubProjectForWebID(webid),
    description: TemplateOrg + "/" + template, // TODO: this can be used later to check what template was used
    private: true,
    mediaType: {
      previews: [
        'baptiste' // TODO: This is apparently an experimental github API feature. Probably shouldn't rely on it but it's the easist for now.
      ]
    }
  })
}

async function findOrCreateGithubProjectForWebID(webid, template) {
  const exists = await findGithubProjectForWebID(webid, template)
  if (exists) {
    return exists
  } else {
    return createGithubProjectFromTemplate(webid, template)
  }
}

module.exports = async (req, res) => {
  const { webid } = req.body;
  try {
    await new Promise((resolve, reject) => {
        const err => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  } catch (e) {
    console.log(e.message);
  }
};

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

const TemplateOrg = process.env.GITHUB_TEMPLATE_ORG || 'https://github.com/understory-garden/'
const GnomesOrg = process.env.GITHUB_GNOMES_ORG || 'https://github.com/understory-gnomes/'
const GnomeKingToken + process.env.GITHUB_TOKEN_UGK || ''

function githubProjectForTemplate(templateName) {
  return TemplateOrg + templateName
}

function githubProjectForWebID(webid) {
  return GnomesOrg + webid // TODO: webid won't work here. Hash or encode somehow?
}

module.exports = async (req, res) => {
  const { webid } = req.body;
  try {
    await new Promise((resolve, reject) => {
      pusher.trigger(
        'drawing-events',
        'drawing',
        { x0, x1, y0, y1, color },
        err => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
    res.status(200).end('sent event succesfully');
  } catch (e) {
    console.log(e.message);
  }
};

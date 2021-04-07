/* Update Gnomes- Gives your gnome new instructions for what to do.

  This request handler will not be authenticated.
  That means it must not accept the data in the request as valid.
  Instead, this function is simply a trigger,
  which then reads the config file directly from the users solid pod.

  General overview of Gnome config file (gnomes.ttl):

  For now, we only support one Gnome type (Website)

  WebsiteGnome:
    template:  nextjs-swrlit-tailwindcss // maps to github.com/understory-garden/nextjs-swrlit-tailwindcss
  ensure github project is setup
  call vercel api to set env variable to webid.

  Github Gnome and Vercel Gnome

  What this Gnome type will do is clone the nexts repo from the list below
*/


const projects = {
  {
    template: "nextjs-swrlit-tailwindcss",
    cloneFrom: "https://github.com/understory-garden/nextjs-swrlit-tailwindcss",
  }
}

const {
  APP_ID: appId,
  KEY: key,
  SECRET: secret,
  CLUSTER: cluster,
} = process.env;

const pusher = new Pusher({
  appId,
  key,
  secret,
  cluster,
});

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

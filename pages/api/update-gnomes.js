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
     # generate github ops account we can burn if needed
     # generate github api key for said disposable account
  -> setup vercel
     -> call vercel api to setup project
     -> call vercel project to set webid env variable
      # add github ops user to vercel team


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

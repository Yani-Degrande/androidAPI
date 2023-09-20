const Router = require("@koa/router");

const installUsersRouter = require("./_user");
const installTwoFactorRouter = require("./_twoFactor");

module.exports = (app) => {
  const router = new Router({
    prefix: "/api",
  });

  try {
    installUsersRouter(router);
    installTwoFactorRouter(router);
  } catch (err) {
    console.error(err);
  }

  app.use(router.routes()).use(router.allowedMethods());
};

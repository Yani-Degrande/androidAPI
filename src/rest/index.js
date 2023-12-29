const Router = require("@koa/router");

const installTrainComponentsRouter = require("./_trainComponents");

module.exports = (app) => {
  const router = new Router({
    prefix: "/api",
  });

  try {
    installTrainComponentsRouter(router);
  } catch (err) {
    console.error(err);
  }

  app.use(router.routes()).use(router.allowedMethods());
};

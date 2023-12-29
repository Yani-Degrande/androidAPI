const Router = require("@koa/router");
const trainComponentService = require("../service/_trainComponents");

// === functions ===
const getAllTrainComponents = async (ctx) => {
  const trainComponents = await trainComponentService.getAllTrainComponents();
  ctx.body = trainComponents;
};

const getTrainComponentById = async (ctx) => {
  const trainComponent = await trainComponentService.getTrainComponentById(
    ctx.params.id
  );
  ctx.body = trainComponent;
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/trainComponents",
  });

  router.get("/", getAllTrainComponents);
  router.get("/:id", getTrainComponentById);

  app.use(router.routes()).use(router.allowedMethods());
};

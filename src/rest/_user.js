const Router = require("@koa/router");
const userService = require("../service/_user");

// === functions ===

// - Register user
const registerUser = async (ctx) => {
  const user = await userService.register(ctx.request.body);
  ctx.body = user;
};

// - Login user
const loginUser = async (ctx) => {
  const user = await userService.login(ctx.request.body);
  ctx.body = user;
};

const getUser = async (ctx) => {
  const user = await userService.getUserByEmail(ctx.params.email);
  ctx.body = user;
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/users",
  });

  router.post("/register", registerUser);

  router.post("/login", loginUser);

  router.get("/:email", getUser);

  app.use(router.routes()).use(router.allowedMethods());
};

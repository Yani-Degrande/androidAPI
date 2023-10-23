const Router = require("@koa/router");
const twoFactorService = require("../service/_twoFactor");
const c = require("config");

// === functions ===
const enableTwoFactor = async (ctx) => {
  const secret = await twoFactorService.enableTwoFactor(ctx.request.body);
  ctx.body = secret;
};

const disableTwoFactor = async (ctx) => {
  const secret = await twoFactorService.disableTwoFactor(ctx.request.body);
  ctx.body = secret;
};

const verifyTwoFactorCode = async (ctx) => {
  const secret = await twoFactorService.verifyTwoFactorCode(ctx.request.body);
  ctx.body = secret;
};

const deleteUniqueToken = async (ctx) => {
  const secret = await twoFactorService.deleteUniqueToken(ctx.request.body);
  ctx.body = secret;
};

const verifyTwoFactorCodePasswordReset = async (ctx) => {
  const secret = await twoFactorService.verifyTwoFactorCodePasswordReset(
    ctx.request.body
  );
  ctx.body = secret;
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/2fa",
  });

  router.post("/enable", enableTwoFactor);

  router.post("/disable", disableTwoFactor);

  router.post("/verify", verifyTwoFactorCode);

  router.post("/delete", deleteUniqueToken);

  router.post("/verify-password-reset", verifyTwoFactorCodePasswordReset);

  app.use(router.routes()).use(router.allowedMethods());
};

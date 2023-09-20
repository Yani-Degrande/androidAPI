const Router = require("@koa/router");
const twoFactorService = require("../service/_twoFactor");

// === functions ===
const enableTwoFactor = async (ctx) => {
    const secret = await twoFactorService.enableTwoFactor(ctx.request.body);
    ctx.body = secret;
}
    
const disableTwoFactor = async (ctx) => {
    const secret = await twoFactorService.disableTwoFactor(ctx.request.body);
    ctx.body = secret;
}

module.exports = (app) => {
    const router = new Router({
        prefix: "/2fa",
    });

    router.post(
        "/enable",
        enableTwoFactor
    );

    router.post(
        "/disable",
        disableTwoFactor
    );
    
    app.use(router.routes()).use(router.allowedMethods());
};
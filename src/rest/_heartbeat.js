const Router = require("@koa/router");
const heartbeatService = require("../service/_heartbeat");

// === functions ===

// - Send heartbeat
const sendHeartbeat = async (ctx) => {
    const user = await heartbeatService.sendHeartbeat(ctx.request.body);
    ctx.body = user;
}
    
// - Get heartbeat
const getHeartbeat = async (ctx) => {
    const user = await heartbeatService.getHeartbeat(ctx.request.body);
    ctx.body = user;
}

// - Get heartbeat status
const getHeartbeatStatus = async (ctx) => {
    const user = await heartbeatService.getHeartbeatStatus(ctx.request.body);
    ctx.body = user;
}

module.exports = (app) => {
    const router = new Router({
        prefix: "/heartbeat",
    });

    router.post(
        "/send",
        sendHeartbeat
    );

    router.get(
        "/get",
        getHeartbeat
    );

    router.get(
        "/status",
        getHeartbeatStatus
    );
    
    app.use(router.routes()).use(router.allowedMethods());
};
const { getLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");  

const { getUserByEmail } = require("./_user.js");
const { refreshAccessToken } = require("./_token.js");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// === functions ===
const sendHeartbeat = async (user) => {
    const { email, accessToken, refreshToken } = user; // Assuming you have access to the user's tokens
    debugLog(`sending heartbeat for user ${email}`);

    // Check if the access token is about to expire (e.g., within the next 5 minutes)
    const accessTokenExpiration = jwt.decode(accessToken).exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (accessTokenExpiration - currentTime < 300) { // 300 seconds (5 minutes)
        // Access token is about to expire, refresh it
        const newAccessToken = refreshAccessToken(refreshToken);

        // Update the user's last activity timestamp and send the new access token
        const updatedUser = await getPrisma().user.update({
            where: {
                id: user.id, // Assuming you have the user's ID
            },
            data: {
                lastHeartbeat: new Date(),
            },
        });

        return { updatedUser, newAccessToken };
    }

    // If the access token doesn't need refreshing, only update the last heartbeat timestamp
    const updatedUser = await getPrisma().user.update({
        where: {
            id: user.id,
        },
        data: {
            lastHeartbeat: new Date(),
        },
    });

    return { updatedUser, newAccessToken: null };
};


const getHeartbeat = async (user) => {
    const { email } = user;
    debugLog(`getting heartbeat for user ${email}`);

    const foundUser = await getUserByEmail(email);

    return foundUser.lastHeartbeat;
};

const getHeartbeatStatus = async (user) => {
    const { email } = user;
    debugLog(`getting heartbeat status for user ${email}`);

    const foundUser = await getUserByEmail(email);

    const lastHeartbeat = foundUser.lastHeartbeat;
    const now = new Date();
    const diff = now - lastHeartbeat;
    const diffSeconds = Math.floor(diff / 1000);

    return diffSeconds;
};

module.exports = {
    sendHeartbeat,
    getHeartbeat,
    getHeartbeatStatus,
};
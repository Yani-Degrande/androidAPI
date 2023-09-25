const { getPrisma } = require("../data/index.js");

const { getLogger } = require("./logger.js");
const ServiceError = require("./serviceError");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// Define the cron job to run every minute
const deleteExpiredUniqueTokens = async () => {
  debugLog("Checking for expired uniqueTokens...");

  try {
    // Find and delete expired uniqueTokens
    const currentTime = new Date();
    await getPrisma().twoFactor.updateMany({
      where: {
        expirationTime: {
          lt: currentTime,
        },
      },
      data: {
        expirationTime: null,
        uniqueToken: null,
      },
    });

    await getPrisma().user.updateMany({
      where: {
        expirationTime: {
          lt: currentTime,
        },
      },
      data: {
        expirationTime: null,
        uniqueToken: null,
      },
    });

    debugLog("Expired uniqueTokens deleted successfully.");
  } catch (error) {
    throw new ServiceError("Error deleting expired uniqueTokens:", error);
  }
};

module.exports = deleteExpiredUniqueTokens;

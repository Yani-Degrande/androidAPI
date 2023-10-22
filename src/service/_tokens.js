// - Dependencies
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// - Local dependencies
const { getLogger } = require("../core/logger.js");
const { getPrisma } = require("../data/index.js");
const { generateUniqueToken } = require("./_token.js");
const ServiceError = require("../core/serviceError");

// - Logger
const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// =========== functions =================

// - Create Tokens
const createTokens = async ({ fullname, userId }) => {
  debugLog(`creating ${fullname} tokens for user ${userId}`);

  const uniqueToken = generateUniqueToken(); // Generate a unique token
  const hashedToken = await bcrypt.hash(uniqueToken, 10); // Hash the token

  const tokenPayload = {
    userId: userId,
    token: uniqueToken,
  };

  // Create the token
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.MFA_JWT_EXPIRES_IN,
  });

  // Create the expiration time
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(tokenExpirationTime.getMinutes() + 4);

  try {
    // Store the token in the database
    await getPrisma().tokens.create({
      data: {
        token: hashedToken,
        expirationTime: tokenExpirationTime,
        fullName: fullname,
        userId: userId,
      },
    });

    return token;
  } catch (error) {
    throw new ServiceError(400, "Error creating tokens", error);
  }
};

const deleteTokens = async (userId) => {
  debugLog(`deleting tokens for user ${userId}`);

  try {
    await getPrisma().tokens.deleteMany({
      where: {
        userId: userId,
      },
    });
  } catch (error) {
    throw new ServiceError(400, "Error deleting tokens");
  }
};

module.exports = {
  createTokens,
  deleteTokens,
};

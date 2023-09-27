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
const createTokens = async ({ expirationTime, fullname, userId }) => {
  debugLog(`creating ${fullname} tokens for user ${id}`);

  const uniqueToken = generateUniqueToken(); // Generate a unique token
  const hashedToken = await bcrypt.hash(uniqueToken, 10); // Hash the token

  const tokenPayload = {
    userId: userId,
    token: hashedToken,
  };

  // Create the token
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.MFA_JWT_EXPIRES_IN,
  });

  // Create the expiration time
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(
    tokenExpirationTime.getMinutes() + expirationTime
  );

  try {
    // Store the token in the database
    await getPrisma().token.create({
      data: {
        token,
        expirationTime: tokenExpirationTime,
        fullname,
      },
      connect: {
        user: {
          id: userId,
        },
      },
    });

    return uniqueToken;
  } catch (error) {
    throw new ServiceError(400, "Error creating tokens");
  }
};

module.exports = {
  createTokens,
};

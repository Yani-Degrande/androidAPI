const { getLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");

const { generateAccessToken, generateRefreshToken } = require("./_token.js");
const { checkPassword } = require("../core/auth.js");
const {
  twoFactorEnabled,
  verifyTwoFactorCode,
  generateUniqueToken,
} = require("./_2fa.js");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// === functions ===
const register = async (user) => {
  const { email, password } = user;
  debugLog(`registering user ${email}`);

  const newUser = await getPrisma().user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  return newUser;
};

const getUserByEmail = async (email) => {
  debugLog(`getting user ${email}`);
  const foundUser = await getPrisma().user.findUnique({
    where: {
      email,
    },
    include: {
      twoFactor: true,
    },
  });

  if (!foundUser) {
    throw new ServiceError("User not found", 404);
  }

  return foundUser;
};

const login = async (user) => {
  const { email, password } = user;
  debugLog(`logging in user ${email}`);

  const foundUser = await getUserByEmail(email);

  const isMatch = await checkPassword(password, foundUser.password);

  if (!isMatch) {
    throw new ServiceError("Invalid password", 401);
  }

  if (twoFactorEnabled(foundUser)) {
    // 2FA is enabled for the user,verify the 2FA code

    const uniqueToken = generateUniqueToken(); // Implement a secure token generation function
    const uniqueTokenHash = await bcrypt.hash(uniqueToken, 10); // Hash the token
    const tokenPayload = {
      userId: foundUser.id,
      uniqueToken,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "2m",
    });

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);
    await getPrisma().twoFactor.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        uniqueToken: uniqueTokenHash, // Store the hashed token in the database
        expirationTime: expirationTime, // Set the calculated expiration time
      },
    });

    // Server-side code
    const response = {
      status: 302,
      message: "2FA is required",
      uniqueToken: token, // Include the unique token in the response
    };

    return response;
  }

  const accessToken = generateAccessToken({ userId: foundUser.id });
  const refreshToken = generateRefreshToken({ userId: foundUser.id });

  await getPrisma().user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  register,
  login,
  getUserByEmail,
};

// - Dependencies
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// - Local dependencies
const { getLogger } = require("../core/logger.js");
const { getPrisma } = require("../data/index.js");
const ServiceError = require("../core/serviceError");
const { checkPassword, checkToken } = require("../core/auth.js");
const { createTokens, deleteTokens } = require("./_tokens.js");
const { twoFactorEnabled, generateUniqueToken } = require("./_2fa.js");
const { generateAccessToken, generateRefreshToken } = require("./_token.js");
const {
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendRegisterConfirmationEmail,
} = require("../core/mail.js");

// - Logger
const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// =========== functions =================

// - Register user
const register = async (user) => {
  const { email, password } = user;
  debugLog(`registering user ${email}`);

  try {
    const foundUser = await getUserByEmail(email);
    if (foundUser) {
      throw new ServiceError(400, "User already exists"); // Check if user exists
    }
  } catch (error) {
    if (error.code === 404) {
      // User not found, so we can continue
      try {
        // Create user
        const newUser = await getPrisma().user.create({
          data: {
            email,
            password: await bcrypt.hash(password, 10),
          },
        });

        try {
          await sendRegisterConfirmationEmail(email); // Send confirmation email
        } catch (error) {
          throw new ServiceError(
            400,
            "Email does not exist or error sending confirmation email"
          );
        }

        return newUser;
      } catch (error) {
        throw new ServiceError(400, "Error creating user");
      }
    }
    throw error;
  }
};

// - Get user by email
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
    throw new ServiceError(404, "No user found with that email");
  }

  return foundUser;
};

// - Get user by id
const getUserById = async (id) => {
  debugLog(`getting user ${id}`);

  const foundUser = await getPrisma().user.findUnique({
    where: {
      id,
    },
    include: {
      twoFactor: true,
    },
  });

  if (!foundUser) {
    throw new ServiceError(404, "No user found with that id");
  }

  return foundUser;
};

// - Login user
const login = async (user) => {
  const { email, password } = user;
  debugLog(`logging in user ${email}`);

  try {
    const foundUser = await getUserByEmail(email); // Check if user exists

    // Check password
    const isMatch = await checkPassword(password, foundUser.password);
    debugLog(`password match: ${isMatch}`);
    if (!isMatch) {
      throw new ServiceError(401, "Incorrect email or password");
    }

    // Check if 2FA is enabled
    if (twoFactorEnabled(foundUser)) {
      try {
        const uniqueToken = await createTokens({
          expirationTime: process.env.MFA_JWT_EXPIRES_IN,
          fullname: "2FA",
          userId: foundUser.id,
        });

        return {
          status: 302,
          message: "2FA is required",
          uniqueToken,
        };
      } catch (error) {
        throw error;
      }
    }

    // 2FA is not enabled, so we can generate tokens
    try {
      const { accessToken, refreshToken } = await updateUserTokens(foundUser);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

// - Update user tokens
const updateUserTokens = async (user) => {
  const { id } = user;
  debugLog(`updating tokens for user ${id}`);

  try {
    const foundUser = await getUserById(id); // Check if user exists

    // Generate tokens
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
  } catch (error) {
    if (error.code === 404) {
      throw error;
    }
    throw new ServiceError(400, "Error updating tokens");
  }
};

// - Forgot password
const forgotPassword = async ({ email }) => {
  debugLog(`Forgot password for user ${email}`);

  try {
    const foundUser = await getUserByEmail(email); // Check if user exists

    if (twoFactorEnabled(foundUser)) {
      return { redirectToVerification: true };
    }

    try {
      const token = await createTokens({
        fullname: "Password Reset",
        userId: foundUser.id,
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (error) {
        throw new ServiceError("Error sending password reset email", error);
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (data) => {
  const { token, password, repeatPassword } = data;

  if (password !== repeatPassword) {
    throw new ServiceError("Passwords do not match", 400);
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { userId, token: uniqueToken } = decodedToken;

  const foundUser = await getUserById(userId); // Check if user exists
  if (!foundUser) {
    throw new ServiceError(404, "User not found");
  }

  debugLog(`Reset password for user ${foundUser.email}`);

  const foundToken = await getPrisma().tokens.findFirst({
    where: {
      userId: foundUser.id,
    },
  });

  if (!foundToken) {
    throw new ServiceError(400, "Session expired"); // Check if user Session expired
  }

  const now = new Date();
  if (now > foundToken.expirationTime) {
    throw new ServiceError(400, "Session expired"); // Check if user Session expired
  }

  const isMatch = await checkToken(uniqueToken, foundToken.token); // Check if token matches
  if (!isMatch) {
    throw new ServiceError(400, "Invalid token"); // Check if token matches
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  if (!twoFactorEnabled(foundUser)) {
    // 2FA is not enabled for the user, so we can reset the password

    await getPrisma().user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      await deleteTokens(foundUser.id); // Delete all tokens for the user
    } catch (error) {
      throw new ServiceError(400, "Error deleting tokens");
    }

    try {
      await sendPasswordResetConfirmationEmail(foundUser.email);
    } catch (error) {
      throw new ServiceError(
        400,
        "Error sending password reset confirmation email"
      );
    }
    return {
      message: "Password reset successfully",
    };
  }
  try {
    const uniqueToken = await createTokens({
      fullname: "2FA",
      userId: foundUser.id,
    });

    return {
      status: 302,
      message: "2FA is required",
      uniqueToken,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  getUserByEmail,
  forgotPassword,
  resetPassword,
  getUserById,
};

// - Dependencies
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// - Local dependencies
const { getLogger } = require("../core/logger.js");
const { getPrisma } = require("../data/index.js");
const ServiceError = require("../core/serviceError");
const { checkPassword } = require("../core/auth.js");
const { createTokens } = require("./_tokens.js");
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
    throw new ServiceError(404, "User not found");
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
    throw new ServiceError(404, "User not found");
  }

  return foundUser;
};


// - Login user
const login = async (user) => {
  const { email, password } = user;
  debugLog(`logging in user ${email}`);

  try {
    const foundUser = await getUserByEmail(email); // Check if user exists
    if (!foundUser) {
      throw new ServiceError(404, "User not found");
    }

    // Check password
    const isMatch = await checkPassword(password, foundUser.password);
    if (!isMatch) {
      throw new ServiceError(401, "Invalid password");
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
    if (!foundUser) {
      throw new ServiceError(404, "User not found");
    }

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
    if (!foundUser) {
      throw new ServiceError(404, "User not found");
    }

    try {
        await createTokens({
          expirationTime: process.env.PWR_JWT_EXPIRES_IN,
          fullname: "Password Reset",
          userId: foundUser.id,
        });
      
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${foundUser.tokens.uniqueToken}`;

      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (error) {
        throw new ServiceError("Error sending password reset email", error);
      }

      } catch (error) {
        throw error;
      }
  } catch (error) {

  }

  
  

  // const uniqueToken = generateUniqueToken(); // Implement a secure token generation function
  // const uniqueTokenHash = await bcrypt.hash(uniqueToken, 10); // Hash the token

  // const tokenPayload = {
  //   userId: foundUser.id,
  //   uniqueToken,
  // };

  // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
  //   expiresIn: "4m",
  // });

  // const expirationTime = new Date();
  // expirationTime.setMinutes(expirationTime.getMinutes() + 4);

  // await getPrisma().user.update({
  //   where: {
  //     id: foundUser.id,
  //   },
  //   data: {
  //     uniqueToken: uniqueTokenHash, // Store the hashed token in the database
  //     expirationTime: expirationTime, // Set the calculated expiration time
  //   },
  // });

  // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // try {
  //   await sendPasswordResetEmail(email, resetLink);
  // } catch (error) {
  //   throw new ServiceError("Error sending password reset email", error);
  // }
  // return {
  //   message: "Password reset link sent",

  //   // For testing purposes
  //   resetLink,
  // };
};

const resetPassword = async (data) => {
  const { token, password, repeatPassword } = data;

  if (password !== repeatPassword) {
    throw new ServiceError("Passwords do not match", 400);
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { userId, uniqueToken } = decodedToken;

  const foundUser = await getPrisma().user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!foundUser) {
    throw new ServiceError("User not found", 404);
  }

  if (foundUser.uniqueToken && foundUser.expirationTime) {
    const now = new Date();

    if (now > foundUser.expirationTime) {
      throw new ServiceError("Token expired", 400);
    }
    const isMatch = await bcrypt.compare(uniqueToken, foundUser.uniqueToken);

    if (!isMatch) {
      throw new ServiceError("Invalid token", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!twoFactorEnabled(foundUser)) {
      // 2FA is not enabled for the user, so we can reset the password

      await getPrisma().user.update({
        where: {
          id: foundUser.id,
        },
        data: {
          password: hashedPassword,
          uniqueToken: null,
          expirationTime: null,
        },
      });

      try {
        await sendPasswordResetConfirmationEmail(foundUser.email);
      } catch (error) {
        throw new ServiceError(
          "Error sending password reset confirmation email",
          error
        );
      }

      return {
        message: "Password reset successfully",
      };
    }

    // 2FA is enabled for the user,verify the 2FA code

    const uniqueToken = generateUniqueToken(); // Implement a secure token generation function
    const uniqueTokenHash = await bcrypt.hash(uniqueToken, 10); // Hash the token
    const tokenPayload = {
      userId: foundUser.id,
      uniqueToken,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "4m",
    });

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 4);
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
};

module.exports = {
  register,
  login,
  getUserByEmail,
  forgotPassword,
  resetPassword,
  getUserById,
};

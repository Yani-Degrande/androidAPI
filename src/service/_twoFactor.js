const { getLogger } = require("../core/logger.js");
const { getChildLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
bcrypt = require("bcryptjs");

const { generateSecretKey, backupCodes } = require("./_2fa.js");
const { getUserByEmail } = require("./_user.js");
const { generateAccessToken, generateRefreshToken } = require("./_token.js");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// === functions ===
const enableTwoFactor = async (emailUser) => {
  const { email } = emailUser;
  debugLog(`enabling 2FA for user ${email}`);

  // Check if the user already has a TwoFactor entry
  const existingTwoFactor = await getPrisma().twoFactor.findFirst({
    where: {
      user: {
        email,
      },
    },
  });

  if (existingTwoFactor) {
    // If there is an existing TwoFactor entry, you may want to return an error
    // or handle the update logic if necessary.
    // For simplicity, this example does nothing if an entry already exists.
    return { message: "2FA is already enabled for this user" };
  }

  // If no existing entry, generate secret and create a new TwoFactor entry
  const secret = await generateSecretKey();
  const recoveryCodes = await backupCodes();

  await getPrisma().twoFactor.create({
    data: {
      user: {
        connect: {
          email,
        },
      },
      secretKey: secret.base32,
      twoFactorQRCode: "QR code data",
      isEnabled: true,
      recoveryCodes: recoveryCodes.base32,
    },
  });

  return secret.base32;
};

const disableTwoFactor = async (emailUser) => {
  const { email } = emailUser;
  debugLog(`disabling 2FA for user ${email}`);

  const user = await getUserByEmail(email);

  // Check if the user exists and if they have TwoFactor enabled
  if (user && user.twoFactor) {
    // Delete the TwoFactor entry
    await getPrisma().twoFactor.delete({
      where: {
        id: user.twoFactor.id,
      },
    });
  }

  // Return an indication of whether 2FA was disabled or not
  return { disabled: !!user?.twoFactor };
};

const verifyTwoFactorCode = async ({ code, jwtToken }) => {
  try {
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { userId, uniqueToken } = decodedToken;

    const foundUser = await getPrisma().user.findUnique({
      where: {
        id: userId,
      },
    });

    debugLog(`verifying 2FA code for user ${foundUser.id}`);

    if (!foundUser) {
      throw new ServiceError("User not found", 404);
    }

    const twoFa = await getPrisma().twoFactor.findUnique({
      where: {
        userId: foundUser.id,
      },
    });

    debugLog(`2FA ${twoFa.secretKey}`);
    if (!twoFa) {
      throw new ServiceError("2FA not enabled", 404);
    }

    if (!twoFa.uniqueToken) {
      throw new ServiceError("Invalid url", 401);
    }
    const isMatch = bcrypt.compare(uniqueToken, twoFa.uniqueToken);

    if (!isMatch) {
      throw new ServiceError("Invalid unique token", 401);
    }

    const { secretKey } = twoFa;

    const verified = speakeasy.totp.verify({
      secret: secretKey,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      throw new ServiceError("Invalid 2FA code", 401);
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

    await getPrisma().twoFactor.update({
      where: {
        id: twoFa.id,
      },
      data: {
        uniqueToken: null,
        expirationTime: null,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ServiceError("Incorrect url", 401);
  }
};

const deleteUniqueToken = async ({ jwtToken }) => {
  debugLog(`deleting uniqueToken ${jwtToken}`);

  try {
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { userId } = decodedToken;

    await getPrisma().twoFactor.update({
      where: {
        userId,
      },
      data: {
        uniqueToken: null,
        expirationTime: null,
      },
    });
  } catch (error) {
    throw new ServiceError("Url no longer exists", 401);
  }
  return { deleted: true };
};

module.exports = {
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactorCode,
  deleteUniqueToken,
};

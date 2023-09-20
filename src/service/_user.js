const { getLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");

const { generateAccessToken, generateRefreshToken } = require("./_token.js");
const { checkPassword } = require("../core/auth.js");
const {twoFactorEnabled, verifyTwoFactorCode} = require("./_2fa.js"); 
const bcrypt  = require("bcryptjs");   

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
    const { email, password, twoFACode } = user;
    debugLog(`logging in user ${email}`);

    const foundUser = await getUserByEmail(email);

    if (!checkPassword(password, foundUser.password)) {
        throw new ServiceError("Invalid password", 401);
    }

    if (twoFactorEnabled(foundUser)) {
        // 2FA is enabled for the user,verify the 2FA code
        if (!verifyTwoFactorCode(foundUser, twoFACode)) {
            throw new ServiceError("Invalid 2FA code", 401);
        }
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
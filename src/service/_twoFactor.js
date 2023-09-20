const { getLogger } = require("../core/logger.js");
const { getChildLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");
   
const { generateSecretKey, backupCodes } = require("./_2fa.js");
const { getUserByEmail } = require("./_user.js");

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
        return { message: '2FA is already enabled for this user' };
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
            twoFactorQRCode: 'QR code data',
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


module.exports = {
    enableTwoFactor,
    disableTwoFactor,
};
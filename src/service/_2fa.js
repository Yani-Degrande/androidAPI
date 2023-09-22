const speakeasy = require('speakeasy');
const { getLogger } = require("../core/logger.js");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

const generateSecretKey = async () => {
    debugLog(`generating secret key`);
    return speakeasy.generateSecret({ length: 20 });
}


const qrCodeUrl = async (email) => {
    debugLog(`generating QR code URL for ${email}`);

    const secret = generateSecretKey();
    speakeasy.otpauthURL({
        secret: secret.base32,
        label: email,
        issuer: '2FA Demo',
        encoding: 'base32',
    })
};

const backupCodes = async () => {
    debugLog(`generating backup codes`);
    return speakeasy.generateSecret({
        length: 10,
        name: '2FA Demo',
        symbols: true,
        google_auth_qr: true,
    });
};

const twoFactorEnabled = (user) => {
    debugLog(`checking if 2FA is enabled for user ${user.email}`);
    return user.twoFactor?.isEnabled;
};

const verifyTwoFactorCode = (user, code, uniqueToken) => {
    debugLog(`verifying 2FA code for user ${user.email}`);
    const { secretKey } = user.twoFactor;

    if (user.twoFactor.uniqueToken === uniqueToken ) {
            const verified = speakeasy.totp.verify({
            secret: secretKey,
            encoding: 'base32',
            token: code,
        });

        return verified;
    };
    return false;
};

const crypto = require('crypto');

// Function to generate a random unique token
function generateUniqueToken() {
  // Generate a random 32-byte (256-bit) token
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}




module.exports = {
    generateSecretKey,
    qrCodeUrl,
    backupCodes,
    twoFactorEnabled,
    verifyTwoFactorCode,
    generateUniqueToken
};



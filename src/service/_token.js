const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "20m",
    });
}

const refreshAccessToken = (refreshToken) => {
    try {
        // Verify the refresh token and decode its payload
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // You can perform additional checks here, such as checking for token validity

        // Generate a new access token with a new expiration time
        const newAccessToken = jwt.sign(
            { userId: decoded.userId }, // Payload with user information
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } // Adjust the expiration time as needed
        );

        return newAccessToken;
    } catch (error) {
        // Handle token verification or generation errors here
        console.error('Error refreshing access token:', error);
        throw new Error('Access token refresh failed');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken,
};
const jwt = require('jsonwebtoken');
const { setAuthCookies } = require('../utils/cookieutil');

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.jwt_refresh_secret);
        const accessToken = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role || "user" },
            process.env.jwt_secret,
            { expiresIn: process.env.jwt_expire }
        );

        setAuthCookies(res, accessToken, refreshToken);

        return res.json({
            success: true,
            token: accessToken
        });
    } catch (err) {
        console.log("Error refreshing token:", err.message);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};

module.exports = { refreshAccessToken };
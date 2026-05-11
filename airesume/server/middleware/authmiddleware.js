const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
    const token = req.cookies?.authToken;
    if (!token) return res.status(401).json({ message: "No token" });
    
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret)
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log("error occurred in middleware ", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}


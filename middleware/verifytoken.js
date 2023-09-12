const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        req.user = decoded; // Store the decoded token payload for future use
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = verifyToken;
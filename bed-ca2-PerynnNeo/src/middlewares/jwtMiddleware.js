//////////////////////////////////////////////////////
// REQUIRE DOTENV MODULE
//////////////////////////////////////////////////////
require("dotenv").config();
//////////////////////////////////////////////////////
// REQUIRE JWT MODULE
//////////////////////////////////////////////////////
const jwt = require("jsonwebtoken");

//////////////////////////////////////////////////////
// SET JWT CONFIGURATION
//////////////////////////////////////////////////////
const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;


//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR GENERATING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.generateToken = (req, res, next) => {
    const payload = {
        userId: res.locals.userId, // Ensure this is set correctly in previous middleware
        timestamp: Date.now() // Use a proper timestamp format
    };

    const options = {
        algorithm: tokenAlgorithm, // Ensure this variable is defined (e.g., 'HS256')
        expiresIn: tokenDuration   // Ensure this variable is defined (e.g., '2h')
    };

    try {
        // Synchronously generate the token
        const token = jwt.sign(payload, secretKey, options);
        res.locals.token = token; // Store the token in res.locals
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};


//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR SENDING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.sendToken = (req, res, next) => {
    res.status(200).json({message: res.locals.message, token: res.locals.token});
};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR VERIFYING JWT TOKEN
//////////////////////////////////////////////////////
module.exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'No token provided'});
    }

    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({error: 'No token provided'});
    }

    const callback = (err, decoded) => {
        if (err) {
            return res.status(401).json({error: 'Invalid token'});
        }

        res.locals.userId = decoded.userId;
        res.locals.tokenTimestamp = decoded.timestamp;
        console.log("Decoded token:", decoded);
        console.log("Extracted userId:", decoded.userId);


        next();
    }

    jwt.verify(token, secretKey, callback);
};

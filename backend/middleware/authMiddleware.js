/**
 * Authentication Middleware
 * Verifies Firebase Authentication tokens
 */

const { admin } = require('../config/firebaseConfig');

/**
 * Middleware to verify Firebase Auth token
 */
async function verifyFirebaseToken(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            phone: decodedToken.phone_number || null
        };

        next();

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                phone: decodedToken.phone_number || null
            };
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
}

module.exports = {
    verifyFirebaseToken,
    optionalAuth
};


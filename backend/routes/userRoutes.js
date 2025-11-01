/**
 * User Routes
 * Handles user-related endpoints
 */

const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseConfig');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

/**
 * GET /getUserReports
 * Fetches all health reports for the authenticated user
 */
router.get('/getUserReports', verifyFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Get user's reports subcollection
        const reportsRef = db.collection('users').doc(userId).collection('reports');
        const snapshot = await reportsRef.orderBy('timestamp', 'desc').get();

        const reports = [];
        snapshot.forEach(doc => {
            reports.push({
                reportId: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            count: reports.length,
            reports: reports,
            userId: userId
        });

    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports',
            message: error.message
        });
    }
});

/**
 * POST /updateUserProfile
 * Updates user profile information
 */
router.post('/updateUserProfile', verifyFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { name, phone, location, preferredLanguage } = req.body;

        const userRef = db.collection('users').doc(userId);
        
        const updateData = {
            updatedAt: new Date().toISOString()
        };

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (location) updateData.location = location;
        if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;

        await userRef.set(updateData, { merge: true });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            userId: userId
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            message: error.message
        });
    }
});

/**
 * GET /getUserProfile
 * Gets user profile information
 */
router.get('/getUserProfile', verifyFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.json({
                success: true,
                profile: null,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile: {
                userId: userId,
                ...userDoc.data()
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
});

module.exports = router;


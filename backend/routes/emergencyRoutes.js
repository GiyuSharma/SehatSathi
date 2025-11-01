/**
 * Emergency Routes
 * Handles emergency alerts and SMS notifications
 */

const express = require('express');
const router = express.Router();
const { sendEmergencyAlert, makeEmergencyCall } = require('../services/smsService');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/authMiddleware');

/**
 * POST /sendEmergencyAlert
 * Sends emergency SMS alert with location and condition
 */
router.post('/sendEmergencyAlert', optionalAuth, async (req, res) => {
    try {
        const { phoneNumber, name, condition, symptoms, location, language = 'en' } = req.body;

        // Validation
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        if (!condition || !['RED', 'YELLOW', 'GREEN'].includes(condition)) {
            return res.status(400).json({
                success: false,
                error: 'Valid condition level (RED, YELLOW, GREEN) is required'
            });
        }

        // Construct emergency data
        const emergencyData = {
            name: name || 'Unknown',
            condition: condition,
            symptoms: symptoms || 'Not described',
            location: location || null
        };

        // Send emergency alert
        const result = await sendEmergencyAlert(phoneNumber, emergencyData, language);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Emergency alert sent successfully',
            ...result
        });

    } catch (error) {
        console.error('Error sending emergency alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send emergency alert',
            message: error.message
        });
    }
});

/**
 * POST /makeEmergencyCall
 * Initiates an emergency voice call
 */
router.post('/makeEmergencyCall', optionalAuth, async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const defaultMessage = message || 
            'This is an emergency health alert. Please respond immediately if you receive this call.';

        const result = await makeEmergencyCall(phoneNumber, defaultMessage);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Emergency call initiated',
            ...result
        });

    } catch (error) {
        console.error('Error making emergency call:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate emergency call',
            message: error.message
        });
    }
});

module.exports = router;


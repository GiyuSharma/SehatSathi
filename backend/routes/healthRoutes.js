/**
 * Health Routes
 * Handles symptom analysis and report generation
 */

const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../services/geminiService');
const { getNearbyHospitals } = require('../services/mapsService');
const { generateHealthReportPDF } = require('../utils/pdfGenerator');
const { db } = require('../config/firebaseConfig');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/authMiddleware');

/**
 * POST /analyzeSymptoms
 * Analyzes symptoms and returns diagnosis result
 */
router.post('/analyzeSymptoms', optionalAuth, async (req, res) => {
    try {
        const { symptomsText, additionalData = {}, language = 'en' } = req.body;

        if (!symptomsText || symptomsText.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Symptoms text is required'
            });
        }

        // Analyze symptoms using Gemini AI
        const diagnosis = await analyzeSymptoms(symptomsText, additionalData, language);

        // Save report to Firestore if user is authenticated
        let reportId = null;
        if (req.user && req.user.uid) {
            try {
                const reportData = {
                    symptoms: symptomsText,
                    additionalData: additionalData,
                    diagnosis: diagnosis.explanation || '',
                    conditionLevel: diagnosis.conditionLevel,
                    advice: diagnosis.advice,
                    recommendations: diagnosis.recommendations || [],
                    confidence: diagnosis.confidence || 0.7,
                    timestamp: new Date().toISOString(),
                    language: language
                };

                const userRef = db.collection('users').doc(req.user.uid);
                const reportsRef = userRef.collection('reports');
                const newReport = await reportsRef.add(reportData);

                reportId = newReport.id;

                // Update user profile if needed
                const userDoc = await userRef.get();
                if (!userDoc.exists) {
                    await userRef.set({
                        name: additionalData.name || 'User',
                        phone: req.user.phone || additionalData.phone || null,
                        location: additionalData.location || null,
                        preferredLanguage: language,
                        createdAt: new Date().toISOString()
                    });
                }

            } catch (dbError) {
                console.error('Error saving report to database:', dbError);
                // Continue even if database save fails
            }
        }

        res.json({
            success: true,
            ...diagnosis,
            reportId: reportId
        });

    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze symptoms',
            message: error.message
        });
    }
});

/**
 * GET /getNearbyHospitals
 * Fetches nearby hospitals using Google Maps API
 */
router.get('/getNearbyHospitals', optionalAuth, async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000, language = 'en' } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const searchRadius = parseInt(radius);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid latitude or longitude values'
            });
        }

        const result = await getNearbyHospitals(lat, lng, searchRadius, language);

        res.json(result);

    } catch (error) {
        console.error('Error fetching nearby hospitals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nearby hospitals',
            message: error.message
        });
    }
});

/**
 * POST /generateReport
 * Generates and returns health report as PDF
 */
router.post('/generateReport', verifyFirebaseToken, async (req, res) => {
    try {
        const { reportId } = req.body;
        const userId = req.user.uid;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                error: 'Report ID is required'
            });
        }

        // Fetch report from Firestore
        const reportDoc = await db.collection('users')
            .doc(userId)
            .collection('reports')
            .doc(reportId)
            .get();

        if (!reportDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        const reportData = reportDoc.data();
        
        // Get user profile for name
        const userDoc = await db.collection('users').doc(userId).get();
        const userName = userDoc.exists ? (userDoc.data().name || 'User') : 'User';

        // Generate PDF
        const pdfBuffer = await generateHealthReportPDF({
            reportId: reportId,
            userName: userName,
            symptoms: reportData.symptoms || '',
            diagnosis: reportData.diagnosis || '',
            conditionLevel: reportData.conditionLevel || 'UNKNOWN',
            advice: reportData.advice || '',
            recommendations: reportData.recommendations || [],
            timestamp: reportData.timestamp || new Date().toISOString()
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="health-report-${reportId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report',
            message: error.message
        });
    }
});

/**
 * GET /getReport/:reportId
 * Gets a specific report by ID
 */
router.get('/getReport/:reportId', verifyFirebaseToken, async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user.uid;

        const reportDoc = await db.collection('users')
            .doc(userId)
            .collection('reports')
            .doc(reportId)
            .get();

        if (!reportDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        res.json({
            success: true,
            report: {
                reportId: reportDoc.id,
                ...reportDoc.data()
            }
        });

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch report',
            message: error.message
        });
    }
});

module.exports = router;


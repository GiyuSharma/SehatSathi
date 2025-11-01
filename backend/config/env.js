/**
 * Environment Configuration
 * Validates and exports environment variables
 */

require('dotenv').config();

/**
 * Validates required environment variables
 */
function validateEnv() {
    const required = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'GEMINI_API_KEY',
        'TWILIO_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'GOOGLE_MAPS_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
        console.warn('Some features may not work properly.');
    }
}

// Validate on load
validateEnv();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    
    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    },
    
    // Gemini
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    },
    
    // Twilio
    twilio: {
        accountSid: process.env.TWILIO_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },
    
    // Google Maps
    googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_KEY
    },
    
    // Google Translate
    googleTranslate: {
        apiKey: process.env.GOOGLE_TRANSLATE_API_KEY
    }
};


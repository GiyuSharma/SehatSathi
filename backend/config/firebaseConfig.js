/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK for authentication and Firestore
 */

const admin = require('firebase-admin');
const env = require('./env');

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            return admin.app();
        }

        // Initialize Firebase Admin
        const serviceAccount = {
            projectId: env.firebase.projectId,
            clientEmail: env.firebase.clientEmail,
            privateKey: env.firebase.privateKey
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: env.firebase.databaseURL
        });

        console.log('✅ Firebase Admin initialized successfully');
        return admin.app();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw new Error('Failed to initialize Firebase');
    }
}

// Initialize on module load
const app = initializeFirebase();

// Export Firebase Admin services
module.exports = {
    admin,
    auth: admin.auth(),
    firestore: admin.firestore(),
    db: admin.firestore()
};


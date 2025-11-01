/**
 * SMS Service using Twilio
 * Handles sending emergency alerts via SMS
 */

const twilio = require('twilio');
const env = require('../config/env');

/**
 * Initialize Twilio client
 */
const twilioClient = twilio(env.twilio.accountSid, env.twilio.authToken);

/**
 * Sends emergency alert SMS to specified phone number
 * @param {string} phoneNumber - Recipient's phone number (with country code)
 * @param {Object} emergencyData - Emergency information
 * @param {string} emergencyData.name - Patient name
 * @param {string} emergencyData.condition - Condition level (RED, YELLOW, GREEN)
 * @param {string} emergencyData.symptoms - Symptom description
 * @param {Object} emergencyData.location - GPS coordinates {lat, lng}
 * @param {string} language - Language for SMS (en, hi)
 * @returns {Promise<Object>} SMS sending result
 */
async function sendEmergencyAlert(phoneNumber, emergencyData, language = 'en') {
    try {
        // Construct emergency message
        const message = constructEmergencyMessage(emergencyData, language);

        // Send SMS via Twilio
        const messageResponse = await twilioClient.messages.create({
            body: message,
            from: env.twilio.phoneNumber,
            to: phoneNumber
        });

        console.log(`✅ Emergency SMS sent to ${phoneNumber}. SID: ${messageResponse.sid}`);

        return {
            success: true,
            messageId: messageResponse.sid,
            status: messageResponse.status,
            to: phoneNumber,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Twilio SMS Error:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Makes an emergency voice call using Twilio
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Text to speak during call
 * @returns {Promise<Object>} Call result
 */
async function makeEmergencyCall(phoneNumber, message = 'Emergency health alert. Please respond immediately.') {
    try {
        const call = await twilioClient.calls.create({
            twiml: `<Response><Say voice="alice">${message}</Say></Response>`,
            from: env.twilio.phoneNumber,
            to: phoneNumber
        });

        console.log(`✅ Emergency call initiated to ${phoneNumber}. SID: ${call.sid}`);

        return {
            success: true,
            callId: call.sid,
            status: call.status,
            to: phoneNumber,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Twilio Call Error:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Constructs emergency message based on language
 */
function constructEmergencyMessage(emergencyData, language = 'en') {
    const { name, condition, symptoms, location } = emergencyData;
    
    let message = '';
    const locationUrl = location ? 
        `https://www.google.com/maps?q=${location.lat},${location.lng}` : 
        'Location not available';

    if (language === 'hi') {
        // Hindi message
        message = `🚨 आपातकालीन स्वास्थ्य अलर्ट 🚨
        
नाम: ${name || 'अज्ञात'}
स्थिति: ${getConditionTextHindi(condition)}
लक्षण: ${symptoms || 'विवरण नहीं दिया गया'}
स्थान: ${locationUrl}

कृपया तुरंत कार्रवाई करें।`;
    } else {
        // English message
        message = `🚨 EMERGENCY HEALTH ALERT 🚨

Name: ${name || 'Unknown'}
Condition: ${condition} - ${getConditionText(condition)}
Symptoms: ${symptoms || 'Not described'}
Location: ${locationUrl}

Please take immediate action.`;
    }

    return message;
}

/**
 * Gets condition level text in English
 */
function getConditionText(condition) {
    switch (condition) {
        case 'RED':
            return 'Critical - Immediate Medical Attention Required';
        case 'YELLOW':
            return 'Moderate - Doctor Visit Recommended';
        case 'GREEN':
            return 'Normal - Monitor Symptoms';
        default:
            return 'Unknown Condition';
    }
}

/**
 * Gets condition level text in Hindi
 */
function getConditionTextHindi(condition) {
    switch (condition) {
        case 'RED':
            return 'गंभीर - तत्काल चिकित्सा सहायता आवश्यक';
        case 'YELLOW':
            return 'मध्यम - डॉक्टर से परामर्श करें';
        case 'GREEN':
            return 'सामान्य - लक्षणों पर नजर रखें';
        default:
            return 'अज्ञात स्थिति';
    }
}

module.exports = {
    sendEmergencyAlert,
    makeEmergencyCall
};


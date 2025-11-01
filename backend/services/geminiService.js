/**
 * Gemini AI Service
 * Handles symptom analysis using Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

/**
 * Initialize Gemini AI
 */
const genAI = new GoogleGenerativeAI(env.gemini.apiKey);

/**
 * Analyzes symptoms and returns diagnosis with condition level and advice
 * @param {string} symptomsText - User's symptom description
 * @param {Object} additionalData - Additional patient information (age, gender, etc.)
 * @param {string} language - Target language for response (en, hi, etc.)
 * @returns {Promise<Object>} Diagnosis result with condition level and advice
 */
async function analyzeSymptoms(symptomsText, additionalData = {}, language = 'en') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Construct prompt for Gemini
        const prompt = `You are a medical AI assistant for rural India. Analyze the following symptoms and provide:
1. Condition Level: GREEN (normal/mild), YELLOW (moderate - see doctor soon), or RED (critical - immediate medical attention)
2. Health Advice: Provide specific guidance - either "Ayurvedic/Home Remedy", "Doctor Visit", or "Emergency Call"
3. Brief explanation of the assessment
4. Specific actionable recommendations

Patient Information:
- Symptoms: ${symptomsText}
- Age: ${additionalData.age || 'Not provided'}
- Gender: ${additionalData.gender || 'Not provided'}
- Duration: ${additionalData.duration || 'Not provided'}
- Severity (1-10): ${additionalData.severity || 'Not provided'}
- Medical History: ${additionalData.history || 'None mentioned'}

IMPORTANT: Respond in JSON format only:
{
    "conditionLevel": "GREEN|YELLOW|RED",
    "advice": "Ayurvedic/Home Remedy|Doctor Visit|Emergency Call",
    "confidence": 0.0-1.0,
    "explanation": "Brief explanation",
    "recommendations": ["recommendation1", "recommendation2", ...]
}

Be conservative with RED level - only use for genuinely critical situations like chest pain, difficulty breathing, severe trauma, loss of consciousness.
For YELLOW, recommend doctor visit within 24-48 hours.
For GREEN, suggest home remedies and self-care.

Respond ONLY in valid JSON format.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Clean up the response (remove markdown code blocks if present)
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        let diagnosis;
        try {
            diagnosis = JSON.parse(text);
        } catch (parseError) {
            // If JSON parsing fails, extract information manually
            console.warn('Failed to parse Gemini JSON response, extracting manually');
            diagnosis = extractDiagnosisFromText(text);
        }

        // Ensure all required fields are present
        if (!diagnosis.conditionLevel) {
            diagnosis.conditionLevel = 'YELLOW'; // Default to moderate if unclear
        }

        if (!diagnosis.advice) {
            diagnosis.advice = diagnosis.conditionLevel === 'RED' ? 'Emergency Call' : 
                             diagnosis.conditionLevel === 'YELLOW' ? 'Doctor Visit' : 'Ayurvedic/Home Remedy';
        }

        // Translate response if needed
        if (language !== 'en' && env.googleTranslate?.apiKey) {
            diagnosis = await translateDiagnosis(diagnosis, language);
        }

        return {
            success: true,
            ...diagnosis,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Fallback to rule-based assessment
        return fallbackDiagnosis(symptomsText, additionalData);
    }
}

/**
 * Extracts diagnosis from text response if JSON parsing fails
 */
function extractDiagnosisFromText(text) {
    const upperText = text.toUpperCase();
    
    let conditionLevel = 'YELLOW';
    if (upperText.includes('RED') || upperText.includes('CRITICAL') || upperText.includes('EMERGENCY')) {
        conditionLevel = 'RED';
    } else if (upperText.includes('GREEN') || upperText.includes('MILD') || upperText.includes('NORMAL')) {
        conditionLevel = 'GREEN';
    }

    let advice = 'Doctor Visit';
    if (conditionLevel === 'RED') {
        advice = 'Emergency Call';
    } else if (conditionLevel === 'GREEN') {
        advice = 'Ayurvedic/Home Remedy';
    }

    return {
        conditionLevel,
        advice,
        confidence: 0.7,
        explanation: text.substring(0, 200),
        recommendations: ['Monitor symptoms', 'Seek professional advice if symptoms worsen']
    };
}

/**
 * Translates diagnosis result to target language
 */
async function translateDiagnosis(diagnosis, targetLanguage) {
    // This would use Google Translate API
    // For now, return as-is (can be implemented with @google-cloud/translate)
    return diagnosis;
}

/**
 * Fallback rule-based diagnosis when Gemini API fails
 */
function fallbackDiagnosis(symptomsText, additionalData) {
    const symptoms = symptomsText.toLowerCase();
    const severity = parseInt(additionalData.severity?.split('-')[0]) || 5;

    let conditionLevel = 'GREEN';
    let advice = 'Ayurvedic/Home Remedy';
    let confidence = 0.6;

    // Critical symptoms
    if (symptoms.includes('chest pain') || 
        symptoms.includes('difficulty breathing') ||
        symptoms.includes('breathing problem') ||
        symptoms.includes('severe headache') ||
        symptoms.includes('unconscious') ||
        symptoms.includes('severe bleeding') ||
        severity >= 8) {
        conditionLevel = 'RED';
        advice = 'Emergency Call';
        confidence = 0.85;
    }
    // Moderate symptoms
    else if (symptoms.includes('fever') ||
             symptoms.includes('vomiting') ||
             symptoms.includes('severe pain') ||
             symptoms.includes('dizziness') ||
             symptoms.includes('abdominal pain') ||
             severity >= 5) {
        conditionLevel = 'YELLOW';
        advice = 'Doctor Visit';
        confidence = 0.75;
    }

    return {
        success: true,
        conditionLevel,
        advice,
        confidence,
        explanation: `Based on symptom analysis: ${conditionLevel} level condition detected. ${advice} is recommended.`,
        recommendations: getRecommendations(conditionLevel),
        timestamp: new Date().toISOString()
    };
}

/**
 * Get recommendations based on condition level
 */
function getRecommendations(level) {
    switch (level) {
        case 'RED':
            return [
                'Seek immediate medical attention',
                'Call emergency services if symptoms worsen',
                'Do not drive yourself to hospital',
                'Stay with someone if possible'
            ];
        case 'YELLOW':
            return [
                'Consult a doctor within 24-48 hours',
                'Monitor symptoms closely',
                'Rest and stay hydrated',
                'Keep a record of symptom progression'
            ];
        case 'GREEN':
        default:
            return [
                'Self-care measures recommended',
                'Get adequate rest',
                'Stay hydrated',
                'Monitor symptoms - consult doctor if they persist or worsen'
            ];
    }
}

module.exports = {
    analyzeSymptoms
};


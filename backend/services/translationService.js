/**
 * Translation Service
 * Handles multilingual support using Google Translate API
 */

const axios = require('axios');
const env = require('../config/env');

/**
 * Translates text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (hi, en, etc.)
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLanguage = 'hi', sourceLanguage = 'en') {
    try {
        // If target language is same as source, return original
        if (targetLanguage === sourceLanguage) {
            return text;
        }

        // Check if Google Translate API key is configured
        if (!env.googleTranslate?.apiKey) {
            console.warn('Google Translate API key not configured. Returning original text.');
            return text;
        }

        // Use Google Translate API (free tier available)
        const url = 'https://translation.googleapis.com/language/translate/v2';
        
        const params = {
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            key: env.googleTranslate.apiKey,
            format: 'text'
        };

        const response = await axios.post(url, null, { params });

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        const translatedText = response.data.data.translations[0].translatedText;
        
        return translatedText;

    } catch (error) {
        console.error('Translation Error:', error);
        // Return original text on error
        return text;
    }
}

/**
 * Translates an object's string values
 * @param {Object} obj - Object to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Object>} Translated object
 */
async function translateObject(obj, targetLanguage = 'hi') {
    try {
        const translatedObj = { ...obj };

        // Translate string values
        for (const key in translatedObj) {
            if (typeof translatedObj[key] === 'string') {
                translatedObj[key] = await translateText(translatedObj[key], targetLanguage);
            } else if (Array.isArray(translatedObj[key])) {
                // Translate array of strings
                translatedObj[key] = await Promise.all(
                    translatedObj[key].map(item => 
                        typeof item === 'string' ? translateText(item, targetLanguage) : item
                    )
                );
            }
        }

        return translatedObj;

    } catch (error) {
        console.error('Object Translation Error:', error);
        return obj;
    }
}

/**
 * Supported languages
 */
const supportedLanguages = {
    'en': 'English',
    'hi': 'Hindi',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'gu': 'Gujarati',
    'pa': 'Punjabi',
    'bn': 'Bengali',
    'or': 'Odia',
    'as': 'Assamese',
    'ne': 'Nepali',
    'ur': 'Urdu'
};

/**
 * Gets list of supported languages
 */
function getSupportedLanguages() {
    return supportedLanguages;
}

/**
 * Validates if language is supported
 */
function isLanguageSupported(langCode) {
    return langCode in supportedLanguages;
}

module.exports = {
    translateText,
    translateObject,
    getSupportedLanguages,
    isLanguageSupported
};


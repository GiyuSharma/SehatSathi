/**
 * Google Maps Service
 * Handles fetching nearby hospitals and clinics
 */

const axios = require('axios');
const env = require('../config/env');

/**
 * Finds nearby hospitals/clinics using Google Places API
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in meters (default: 5000m = 5km)
 * @param {string} language - Response language (default: 'en')
 * @returns {Promise<Object>} List of nearby hospitals with details
 */
async function getNearbyHospitals(latitude, longitude, radius = 5000, language = 'en') {
    try {
        const apiKey = env.googleMaps.apiKey;
        
        if (!apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        // Google Places API - Nearby Search
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        
        const params = {
            location: `${latitude},${longitude}`,
            radius: radius,
            type: 'hospital',
            keyword: 'hospital clinic medical center emergency',
            key: apiKey,
            language: language
        };

        const response = await axios.get(url, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        // Process results
        const hospitals = response.data.results.map(place => ({
            placeId: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address,
            rating: place.rating || null,
            userRatingsTotal: place.user_ratings_total || 0,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            distance: calculateDistance(
                latitude, 
                longitude, 
                place.geometry.location.lat, 
                place.geometry.location.lng
            ),
            types: place.types || [],
            isOpen: place.opening_hours?.open_now || null,
            photos: place.photos ? place.photos.map(photo => ({
                reference: photo.photo_reference,
                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
            })) : []
        }));

        // Sort by distance
        hospitals.sort((a, b) => a.distance - b.distance);

        // Get detailed information for top 5 hospitals
        const detailedHospitals = await Promise.all(
            hospitals.slice(0, 5).map(hospital => getPlaceDetails(hospital.placeId, language))
        );

        return {
            success: true,
            count: hospitals.length,
            hospitals: detailedHospitals,
            userLocation: { lat: latitude, lng: longitude },
            searchRadius: radius,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Google Maps API Error:', error);
        return {
            success: false,
            error: error.message,
            hospitals: [],
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Gets detailed information about a specific place
 */
async function getPlaceDetails(placeId, language = 'en') {
    try {
        const url = 'https://maps.googleapis.com/maps/api/place/details/json';
        const params = {
            place_id: placeId,
            fields: 'name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,geometry,website',
            key: env.googleMaps.apiKey,
            language: language
        };

        const response = await axios.get(url, { params });

        if (response.data.status !== 'OK') {
            throw new Error(`Place details error: ${response.data.status}`);
        }

        const place = response.data.result;

        return {
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            rating: place.rating || null,
            userRatingsTotal: place.user_ratings_total || 0,
            openingHours: place.opening_hours?.weekday_text || null,
            isOpen: place.opening_hours?.open_now || null,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            }
        };

    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2));
}

/**
 * Gets directions from user location to hospital
 */
async function getDirections(originLat, originLng, destinationPlaceId, mode = 'driving') {
    try {
        const url = 'https://maps.googleapis.com/maps/api/directions/json';
        const params = {
            origin: `${originLat},${originLng}`,
            destination: `place_id:${destinationPlaceId}`,
            mode: mode,
            key: env.googleMaps.apiKey
        };

        const response = await axios.get(url, { params });

        if (response.data.status !== 'OK') {
            throw new Error(`Directions API error: ${response.data.status}`);
        }

        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
            success: true,
            distance: leg.distance.text,
            distanceMeters: leg.distance.value,
            duration: leg.duration.text,
            durationSeconds: leg.duration.value,
            steps: leg.steps.map(step => ({
                instruction: step.html_instructions,
                distance: step.distance.text,
                duration: step.duration.text
            }))
        };

    } catch (error) {
        console.error('Directions API Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    getNearbyHospitals,
    getPlaceDetails,
    getDirections
};


# Sehat Sathi Backend API

Complete backend API for SehatSathi - AI-powered health assistant designed for rural India.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Database Structure](#database-structure)
- [Deployment](#deployment)

## ✨ Features

- ✅ **Firebase Authentication** - Secure user authentication
- ✅ **Symptom Analysis** - AI-powered symptom analysis using Google Gemini
- ✅ **Emergency Alerts** - SMS and voice alerts via Twilio
- ✅ **Hospital Finder** - Nearby hospital search using Google Maps API
- ✅ **Multilingual Support** - Google Translate integration
- ✅ **PDF Reports** - Health report generation and download
- ✅ **Firestore Database** - Secure data storage

## 🛠 Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase** - Authentication & Firestore database
- **Google Gemini AI** - Symptom analysis
- **Twilio** - SMS & Voice alerts
- **Google Maps API** - Hospital finder
- **PDFKit** - PDF generation
- **Google Translate** - Multilingual support

## 📦 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled
- API keys for:
  - Google Gemini AI
  - Twilio (for SMS)
  - Google Maps API
  - Google Translate API (optional)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** (Email/Password and Phone)
4. Enable **Firestore Database**
5. Go to Project Settings → Service Accounts
6. Generate a new private key (JSON file)
7. Copy the following from the JSON file:
   - `project_id`
   - `client_email`
   - `private_key`

### 3. Get API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

#### Twilio API
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from dashboard
3. Get a phone number from Twilio

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API and Maps JavaScript API
3. Create API key

#### Google Translate API (Optional)
1. Enable Cloud Translation API in Google Cloud Console
2. Create API key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all the values in `.env`:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

   # Gemini API
   GEMINI_API_KEY=your-gemini-api-key

   # Twilio API
   TWILIO_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890

   # Google Maps API
   GOOGLE_MAPS_KEY=your-google-maps-api-key

   # Google Translate API (Optional)
   GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5500
   ```

   **Important Notes:**
   - For `FIREBASE_PRIVATE_KEY`, replace `\n` with actual newlines or keep as `\\n` (the code handles this)
   - For Twilio phone number, include country code (e.g., `+919876543210`)

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### User Routes (`/api/user`)

#### Get User Reports
```
GET /api/user/getUserReports
Headers: Authorization: Bearer <firebase-token>
```
Fetches all health reports for authenticated user.

#### Update User Profile
```
POST /api/user/updateUserProfile
Headers: Authorization: Bearer <firebase-token>
Body: {
  "name": "John Doe",
  "phone": "+919876543210",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "preferredLanguage": "hi"
}
```

#### Get User Profile
```
GET /api/user/getUserProfile
Headers: Authorization: Bearer <firebase-token>
```

### Health Routes (`/api/health`)

#### Analyze Symptoms
```
POST /api/health/analyzeSymptoms
Headers: Authorization: Bearer <firebase-token> (optional)
Body: {
  "symptomsText": "I have fever and headache",
  "additionalData": {
    "age": "30",
    "gender": "Male",
    "duration": "2 days",
    "severity": "5-6 (Moderate)",
    "history": "No existing conditions"
  },
  "language": "en"
}
Response: {
  "success": true,
  "conditionLevel": "YELLOW",
  "advice": "Doctor Visit",
  "confidence": 0.85,
  "explanation": "...",
  "recommendations": [...],
  "reportId": "abc123"
}
```

#### Get Nearby Hospitals
```
GET /api/health/getNearbyHospitals?latitude=28.6139&longitude=77.2090&radius=5000&language=en
```

#### Generate Report PDF
```
POST /api/health/generateReport
Headers: Authorization: Bearer <firebase-token>
Body: {
  "reportId": "abc123"
}
Returns: PDF file
```

#### Get Report
```
GET /api/health/getReport/:reportId
Headers: Authorization: Bearer <firebase-token>
```

### Emergency Routes (`/api/emergency`)

#### Send Emergency Alert
```
POST /api/emergency/sendEmergencyAlert
Body: {
  "phoneNumber": "+919876543210",
  "name": "John Doe",
  "condition": "RED",
  "symptoms": "Severe chest pain",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "language": "en"
}
```

#### Make Emergency Call
```
POST /api/emergency/makeEmergencyCall
Body: {
  "phoneNumber": "+919876543210",
  "message": "Emergency health alert..."
}
```

## 🔐 Authentication

All protected routes require Firebase Authentication token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

To get the token from frontend:
```javascript
// Using Firebase SDK
import { getAuth } from 'firebase/auth';
const auth = getAuth();
const token = await auth.currentUser.getIdToken();
```

## 📊 Database Structure

### Firestore Collections

```
users (collection)
  └── {userId} (document)
      ├── name: string
      ├── phone: string
      ├── location: {lat: number, lng: number}
      ├── preferredLanguage: string
      ├── createdAt: timestamp
      └── reports (subcollection)
          └── {reportId} (document)
              ├── symptoms: string
              ├── additionalData: object
              ├── diagnosis: string
              ├── conditionLevel: "GREEN" | "YELLOW" | "RED"
              ├── advice: string
              ├── recommendations: array
              ├── confidence: number
              └── timestamp: timestamp
```

## 🚢 Deployment

### Option 1: Firebase Functions

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```

3. Deploy:
   ```bash
   firebase deploy --only functions
   ```

### Option 2: Render / Railway / Heroku

1. Set environment variables in your hosting platform
2. Update `package.json` scripts if needed
3. Deploy using Git or CLI

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔗 Frontend Integration

Example API call from frontend:

```javascript
// Analyze symptoms
const response = await fetch('http://localhost:3000/api/health/analyzeSymptoms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}` // if authenticated
  },
  body: JSON.stringify({
    symptomsText: 'I have fever and headache',
    additionalData: {
      age: '30',
      gender: 'Male'
    },
    language: 'en'
  })
});

const result = await response.json();
console.log(result);
```

## 🐛 Troubleshooting

### Firebase Errors
- Ensure Firebase Admin SDK credentials are correct
- Check that Firestore is enabled in Firebase Console
- Verify authentication rules in Firestore

### API Key Errors
- Verify all API keys are correctly set in `.env`
- Check API key permissions and quotas
- Ensure billing is enabled for Google Cloud services

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Ensure frontend includes proper headers in requests

## 📝 License

ISC

## 👥 Support

For issues and questions, please check the documentation or contact the development team.

---

**Built with ❤️ for rural healthcare in India**


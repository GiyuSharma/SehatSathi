# 🩺 SehatSaathi – AI-Powered Health Assistant for Rural India

**SehatSaathi** is an AI-powered health assistant built especially for **rural and semi-urban India**.  
It helps users **understand their symptoms**, **take safe actions**, and **connect instantly with nearby health workers or hospitals** — all in their **own language**.

---

## 💡 Problem Statement

In many **rural and semi-urban areas of India**, people face serious — and often life-threatening — problems because they can’t identify whether their health issue is **minor** or **urgent**.  
Even though smartphones have reached villages, **medical awareness remains very low**.

People often rely on **guesswork** or **local beliefs**:
- Someone may ignore chest pain thinking it’s just gas.  
- Someone else might rush to a hospital for a mild fever.

Both cases cause harm — one delays treatment, the other causes panic and expense.

During emergencies:
- People **don’t know whom to contact**.  
- Villages **lack nearby doctors**.  
- **Ambulance delays** worsen the situation.

👉 Result: Precious time is lost, leading to **avoidable health emergencies, higher costs, and even loss of lives**.

---

## 🤖 Proposed Solution

**SehatSaathi** is a **Smart AI Health Bot** designed for rural India.

It acts like a **friendly digital companion** that understands the user’s **language and voice**.  
The user simply **speaks or types** their symptoms (e.g., *“Mujhe bukhar aur sar dard hai”*).

Then, SehatSaathi:
- Asks simple yes/no questions — like a doctor would.  
- Analyzes symptoms using **AI and rule-based triage**.  
- Instantly classifies the case into:

| Level | Meaning | Action |
|-------|----------|--------|
| 🟢 **Green** | Mild | Home & Ayurvedic Remedies |
| 🟡 **Yellow** | Moderate | Visit Nearby Doctor |
| 🔴 **Red** | Critical | Auto-call & SMS to Health Worker |

### ✅ Real-Time Action:
- **Auto-call + SMS alert** with live GPS location to nearest ASHA/ANM.
- If unanswered, **SMS sent automatically**.
- **First-aid guidance** given while help is on the way.
- All in **< 1 minute**.

SehatSaathi bridges **awareness and action** — turning smartphones into life-saving tools.

---

## 🌟 Core Features

1. **🩺 Symptom-Based Assessment** – User speaks or types symptoms for AI analysis.  
2. **🚦 Smart Triage System** – Categorizes health condition into Green, Yellow, or Red.  
3. **🗣 Voice & Multilingual Support** – Hindi, English, Bhojpuri, Awadhi, Braj, Bundelkhandi, etc.  
4. **📞 Emergency Auto Call & SMS Alert** – Contacts nearest health worker instantly.  
5. **🏥 Hospital Finder** – Shows nearby clinics and hospitals with one-tap call and navigation.  
6. **🌿 Ayurvedic & Home Remedies** – Provides safe, local, home-based solutions.  
7. **📑 Health Report Generation** – Creates digital reports for doctors or health workers.  
8. **👥 Real-Time Human Connectivity** – Goes beyond automation — connects with real people.

---

## 💎 Unique Selling Proposition (USP)

SehatSaathi is **not just a chatbot**, it’s a **human-like health companion** that:

- Understands and speaks local languages.
- **Acts instantly** during emergencies (not just gives advice).
- Bridges **modern AI with Indian wellness** (Ayurveda + AI).
- Is **lightweight, affordable, scalable**, and ready for **integration with government missions**.
- Promotes **digital health awareness** in the simplest way possible.

---

## 🌍 Impact

- Reduces avoidable deaths by faster symptom recognition.  
- Minimizes unnecessary hospital visits — saving time and cost.  
- Increases rural awareness and confidence in digital health.  
- Strengthens connection between people and local health workers.  
- Supports **Ayushman Bharat Digital Mission** and **Smart Village** initiatives.

---

## 🛠 Technology Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React Native |
| **Backend** | Node.js + Express.js |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **AI Engine** | Google Gemini API |
| **Voice Support** | Web Speech API |
| **Language Translation** | i18next + Google Translate API |
| **Maps & Location** | Google Maps API |
| **Alerts (Calls/SMS)** | Twilio API |
| **PDF Reports** | PDFKit |
| **Deployment** | Firebase Functions / Render / Railway |

---

## ⚙️ Backend API Overview

A complete backend built using **Node.js + Express** with **Firebase integration** for authentication and data, and **Google Gemini AI** for symptom analysis.

### Features
- Firebase Authentication  
- AI Symptom Analysis  
- Emergency Alerts via Twilio  
- Hospital Finder (Google Maps API)  
- Multilingual Translation  
- PDF Report Generation  
- Firestore-based Data Storage

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Firebase Setup
1. Create project in Firebase Console.  
2. Enable **Authentication (Email/Phone)** and **Firestore**.  
3. Download service account key (JSON).  
4. Copy `project_id`, `client_email`, and `private_key` to `.env`.

### 3. Get API Keys
- [Google Gemini API](https://makersuite.google.com/app/apikey)
- [Twilio](https://www.twilio.com/)
- [Google Maps API](https://console.cloud.google.com/)
- [Google Translate API (Optional)](https://console.cloud.google.com/)

### 4. Configure Environment
```bash
cp .env.example .env
```
Fill details:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
GEMINI_API_KEY=your-gemini-api-key
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth
GOOGLE_MAPS_KEY=your-google-maps-key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
```

### 5. Start Server
```bash
npm run dev
# or
npm start
```

Server: `http://localhost:3000`

---

## 📡 API Endpoints

### 🔍 Health Check
`GET /health` – Returns server status.

### 👤 User Routes (`/api/user`)
- **Get User Reports:** `GET /api/user/getUserReports`  
- **Update Profile:** `POST /api/user/updateUserProfile`  
- **Get Profile:** `GET /api/user/getUserProfile`

### 🩺 Health Routes (`/api/health`)
- **Analyze Symptoms:** `POST /api/health/analyzeSymptoms`  
- **Get Nearby Hospitals:** `GET /api/health/getNearbyHospitals?latitude=...&longitude=...`  
- **Generate PDF Report:** `POST /api/health/generateReport`  
- **Get Report:** `GET /api/health/getReport/:reportId`

### 🚨 Emergency Routes (`/api/emergency`)
- **Send Alert:** `POST /api/emergency/sendEmergencyAlert`  
- **Make Emergency Call:** `POST /api/emergency/makeEmergencyCall`

---

## 🔐 Authentication

Protected routes use Firebase ID Token:

```bash
Authorization: Bearer <firebase-id-token>
```

---

## 🧾 Database Structure

```
users
 └── {userId}
      ├── name
      ├── phone
      ├── location
      ├── preferredLanguage
      ├── createdAt
      └── reports
          └── {reportId}
              ├── symptoms
              ├── diagnosis
              ├── conditionLevel
              ├── advice
              ├── recommendations
              ├── confidence
              └── timestamp
```

---

## ☁️ Deployment

### Option 1: Firebase Functions
```bash
npm install -g firebase-tools
firebase init functions
firebase deploy --only functions
```

### Option 2: Render / Railway / Heroku
- Add `.env` variables  
- Push repo to hosting platform  

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔗 Frontend Integration

```javascript
const response = await fetch('http://localhost:3000/api/health/analyzeSymptoms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    symptomsText: 'I have fever and headache',
    language: 'en'
  })
});
const result = await response.json();
console.log(result);
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|--------|------|
| Firebase Error | Check credentials and Firestore rules |
| API Key Error | Verify all keys in `.env` |
| CORS Error | Update `CORS_ORIGIN` with correct frontend URL |

---

## 📝 License

**ISC License** – Free to use and modify with attribution.

---

## 👥 Support

For queries or contributions, contact the **SehatSaathi Development Team**  
💌 Email: ganeshdutt20092005@gmail.com

---

**Built with ❤️ for Rural Healthcare in India**  
*Empowering every village with digital health awareness.*

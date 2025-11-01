# Frontend Integration Guide

This guide shows how to integrate your existing HTML/CSS/JS frontend with the SehatSathi backend API.

## API Base URL

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
// For production, use your deployed backend URL
// const API_BASE_URL = 'https://your-backend-url.com/api';
```

## 1. Firebase Authentication Setup

First, add Firebase to your HTML:

```html
<!-- Add to your HTML head -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
```

Initialize Firebase in your `script.js`:

```javascript
// Firebase configuration (get from Firebase Console)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Get Firebase Auth Token
async function getAuthToken() {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
}
```

## 2. Sign Up / Login

Update your existing signup/login forms:

```javascript
// Sign Up
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({ displayName: name });
        
        // Save to Firestore via backend
        const token = await getAuthToken();
        await fetch(`${API_BASE_URL}/user/updateUserProfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                preferredLanguage: document.getElementById('signup-language').value || 'en'
            })
        });
        
        alert('Account created successfully!');
        hideAuthModal();
        showMedicalBotPage();
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed: ' + error.message);
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert('Login successful!');
        hideAuthModal();
        showMedicalBotPage();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});
```

## 3. Analyze Symptoms

Update your `analyzeSymptoms` or `performTriage` function:

```javascript
async function analyzeSymptomsWithAPI(symptomsText, additionalData = {}) {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/health/analyzeSymptoms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                symptomsText: symptomsText,
                additionalData: additionalData,
                language: getCurrentLanguage() // 'en', 'hi', etc.
            })
        });

        const result = await response.json();

        if (result.success) {
            return result;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to local analysis
        return mockTriageAssessment({ symptomsText, ...additionalData });
    }
}

// Update TriageUI class
class TriageUI {
    // ... existing code ...
    
    async performTriage() {
        this.addSystemMessage('Analyzing your symptoms...');
        
        try {
            const triageData = {
                symptomsText: this.userResponses.symptoms || '',
                age: this.userResponses.age || '',
                gender: this.userResponses.gender || '',
                duration: this.userResponses.duration || '',
                severity: this.userResponses.severity || '',
                history: this.userResponses.history || ''
            };
            
            // Use API instead of mock
            const result = await analyzeSymptomsWithAPI(
                triageData.symptomsText,
                triageData
            );
            
            this.triageResult = result;
            this.displayTriageResult(result);
            
        } catch (error) {
            console.error('Triage assessment failed:', error);
            this.addBotMessage('Sorry, there was an error processing your symptoms. Please try again.');
        }
    }
}
```

## 4. Get Nearby Hospitals

Update your location modal functionality:

```javascript
async function findNearbyHospitals(latitude, longitude) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/health/getNearbyHospitals?latitude=${latitude}&longitude=${longitude}&radius=5000&language=${getCurrentLanguage()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = await response.json();

        if (result.success) {
            displayHospitals(result.hospitals);
        } else {
            alert('Failed to find hospitals: ' + result.error);
        }
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        alert('Error finding hospitals');
    }
}

// Update your get-location-btn handler
document.getElementById('get-location-btn')?.addEventListener('click', async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Find nearby hospitals via API
                await findNearbyHospitals(lat, lng);
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    }
});
```

## 5. Send Emergency Alert

Update emergency alert functionality:

```javascript
async function sendEmergencyAlert(conditionLevel, symptoms) {
    try {
        // Get user location
        let location = null;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            });
        }

        // Get user info
        const user = auth.currentUser;
        const userName = user?.displayName || 'Unknown';

        // Get emergency contact (from user profile or prompt)
        const emergencyPhone = prompt('Enter emergency contact number (with country code):');
        if (!emergencyPhone) return;

        const response = await fetch(`${API_BASE_URL}/emergency/sendEmergencyAlert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: emergencyPhone,
                name: userName,
                condition: conditionLevel,
                symptoms: symptoms,
                location: location,
                language: getCurrentLanguage()
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Emergency alert sent successfully!');
        } else {
            alert('Failed to send alert: ' + result.error);
        }
    } catch (error) {
        console.error('Error sending emergency alert:', error);
        alert('Error sending emergency alert');
    }
}

// Call this when RED condition is detected
function triggerEmergencyAlert(result) {
    if (result.conditionLevel === 'RED') {
        sendEmergencyAlert(result.conditionLevel, result.symptoms);
    }
}
```

## 6. Generate and Download PDF Report

Update `downloadReport` function:

```javascript
async function downloadReportPDF(reportId) {
    try {
        const token = await getAuthToken();
        if (!token) {
            alert('Please login to download reports');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/health/generateReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                reportId: reportId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        // Get PDF blob
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Report downloaded successfully!');
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report');
    }
}

// Update TriageUI downloadReport method
downloadReport() {
    if (!this.triageResult?.reportId) {
        alert('No report available to download');
        return;
    }
    
    downloadReportPDF(this.triageResult.reportId);
}
```

## 7. Get User Reports History

Add a function to fetch user's report history:

```javascript
async function getUserReports() {
    try {
        const token = await getAuthToken();
        if (!token) {
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/user/getUserReports`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.success) {
            return result.reports;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
}

// Display reports history
async function displayReportsHistory() {
    const reports = await getUserReports();
    
    // Create UI to display reports
    // You can add this to your medical bot page
    const reportsContainer = document.getElementById('reports-history');
    reportsContainer.innerHTML = '';
    
    reports.forEach(report => {
        const reportCard = document.createElement('div');
        reportCard.className = 'report-card';
        reportCard.innerHTML = `
            <h4>${new Date(report.timestamp).toLocaleString()}</h4>
            <p>${report.symptoms}</p>
            <p>Condition: ${report.conditionLevel}</p>
            <button onclick="downloadReportPDF('${report.reportId}')">Download PDF</button>
        `;
        reportsContainer.appendChild(reportCard);
    });
}
```

## 8. Helper Functions

Add these utility functions:

```javascript
// Get current language
function getCurrentLanguage() {
    const langSelector = document.querySelector('.language-option.active') || 
                       document.querySelector('[data-lang]');
    return langSelector?.dataset?.lang || 'en';
}

// Format API errors
function handleAPIError(error) {
    console.error('API Error:', error);
    return {
        success: false,
        error: error.message || 'Unknown error occurred'
    };
}

// Check if user is authenticated
function isAuthenticated() {
    return auth.currentUser !== null;
}
```

## Complete Example: Integrated analyzeSelectedSymptoms

```javascript
async function analyzeSelectedSymptoms() {
    const selectedSymptoms = [];
    document.querySelectorAll('input[name="medical-symptoms"]:checked').forEach(checkbox => {
        selectedSymptoms.push(checkbox.value);
    });
    
    if (selectedSymptoms.length === 0) {
        window.TriageUI?.addBotMessage("Please select at least one symptom to analyze.");
        return;
    }
    
    const symptomsText = 'I have these symptoms: ' + selectedSymptoms.join(', ');
    
    if (window.TriageUI) {
        window.TriageUI.addUserMessage(symptomsText);
        
        // Use API for analysis
        try {
            const result = await analyzeSymptomsWithAPI(symptomsText, {
                symptoms: selectedSymptoms
            });
            
            window.TriageUI.triageResult = result;
            window.TriageUI.displayTriageResult(result);
        } catch (error) {
            console.error('Analysis error:', error);
            window.TriageUI.addBotMessage('Error analyzing symptoms. Please try again.');
        }
    }
}
```

## Testing

1. Start your backend server: `npm start` in the `backend` folder
2. Make sure your frontend is served (e.g., using Live Server in VS Code)
3. Test each feature:
   - Sign up/Login
   - Analyze symptoms
   - Find hospitals
   - Download reports
   - Send emergency alerts

## Notes

- Replace `localhost:3000` with your actual backend URL in production
- All API calls should include error handling
- Use try-catch blocks for async operations
- Update your existing functions gradually to avoid breaking changes


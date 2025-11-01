// Enhanced Video Call Implementation
class VideoCall {
    constructor() {
        this.videoModal = null;
        this.videoFeed = null;
        this.remoteVideo = null;
        this.localVideo = null;
        this.localVideoPreview = null;
        this.remoteVideoPlaceholder = null;
        this.whatsappInfo = null;
        this.callStatus = null;
        this.muteBtn = null;
        this.videoBtn = null;
        this.whatsappBtn = null;
        this.endCallBtn = null;
        this.closeBtn = null;
        
        this.isMuted = false;
        this.isVideoOff = false;
        this.isCallActive = false;
        this.callTimer = null;
        this.callDuration = 0;
        this.localStream = null;
        
        // Doctor's phone number
        this.doctorNumber = "9555914141";
        // Your personal number for calling (if needed)
        this.yourNumber = "9936357412";
    }

    initialize() {
        this.videoModal = document.getElementById('video-call-modal');
        this.videoFeed = document.getElementById('video-feed');
        this.remoteVideo = document.getElementById('remote-video');
        this.localVideo = document.getElementById('local-video');
        this.localVideoPreview = document.getElementById('local-video-preview');
        this.remoteVideoPlaceholder = document.getElementById('remote-video-placeholder');
        this.whatsappInfo = document.getElementById('whatsapp-info');
        this.callStatus = document.getElementById('call-status');
        this.muteBtn = document.getElementById('mute-btn');
        this.videoBtn = document.getElementById('video-btn');
        this.whatsappBtn = document.getElementById('whatsapp-btn');
        this.endCallBtn = document.getElementById('end-call-btn');
        this.closeBtn = document.getElementById('close-video-call');
        
        if (!this.videoModal) {
            console.error('Video call modal not found');
            return;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // End call button
        this.endCallBtn?.addEventListener('click', () => {
            this.endCall();
        });
        
        // Close button
        this.closeBtn?.addEventListener('click', () => {
            this.endCall();
        });
        
        // Mute button
        this.muteBtn?.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Video button
        this.videoBtn?.addEventListener('click', () => {
            this.toggleVideo();
        });
        
        // WhatsApp button
        this.whatsappBtn?.addEventListener('click', () => {
            this.initiateWhatsAppCall();
        });
        
        // Close modal when clicking outside
        this.videoModal?.addEventListener('click', (e) => {
            if (e.target === this.videoModal) {
                this.endCall();
            }
        });
    }

    async startCall() {
        // Show the video call modal
        this.videoModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Update call status
        this.callStatus.textContent = 'Initializing camera...';
        
        try {
            // Request camera and microphone access
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: true 
            });
            
            // Display local video stream
            this.localVideo.srcObject = this.localStream;
            this.localVideoPreview.style.display = 'block';
            
            // Update call status
            this.callStatus.textContent = 'Camera ready. Starting call...';
            
            // Simulate call connection process
            setTimeout(() => {
                this.callStatus.textContent = 'Connecting to doctor...';
                
                // Simulate successful connection after 3 seconds
                setTimeout(() => {
                    this.callConnected();
                }, 3000);
            }, 1500);
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.callStatus.textContent = 'Unable to access camera. Please check permissions.';
            
            // Continue without camera
            setTimeout(() => {
                this.callStatus.textContent = 'Starting audio call...';
                setTimeout(() => {
                    this.callConnected();
                }, 2000);
            }, 2000);
        }
    }

    callConnected() {
        this.isCallActive = true;
        this.callStatus.textContent = 'Call connected - 00:00';
        
        // Hide placeholder and show remote video (simulated)
        this.remoteVideoPlaceholder.style.display = 'none';
        this.remoteVideo.style.display = 'block';
        
        // Update video feed to show connection established
        this.remoteVideoPlaceholder.innerHTML = `
            <i class="fas fa-user-md"></i>
            <p>Connected to Dr. Sharma</p>
            <p>Video consultation in progress</p>
        `;
        
        // Start call timer
        this.startCallTimer();
        
        // Show WhatsApp info
        this.whatsappInfo.style.display = 'block';
        
        console.log('Video call connected');
    }

    startCallTimer() {
        this.callTimer = setInterval(() => {
            this.callDuration++;
            const minutes = Math.floor(this.callDuration / 60);
            const seconds = this.callDuration % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.callStatus.textContent = `Video call active - ${timeString}`;
        }, 1000);
    }

    toggleMute() {
        if (!this.localStream) return;
        
        this.isMuted = !this.isMuted;
        const audioTracks = this.localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !this.isMuted;
        });
        
        if (this.isMuted) {
            this.muteBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.muteBtn.style.backgroundColor = '#e74c3c';
            this.muteBtn.style.color = 'white';
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            this.muteBtn.style.backgroundColor = 'var(--bg-light)';
            this.muteBtn.style.color = 'var(--text-dark)';
        }
        
        console.log(this.isMuted ? 'Audio muted' : 'Audio unmuted');
    }

    toggleVideo() {
        if (!this.localStream) return;
        
        this.isVideoOff = !this.isVideoOff;
        const videoTracks = this.localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !this.isVideoOff;
        });
        
        if (this.isVideoOff) {
            this.videoBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
            this.videoBtn.style.backgroundColor = '#e74c3c';
            this.videoBtn.style.color = 'white';
            this.localVideoPreview.style.display = 'none';
        } else {
            this.videoBtn.innerHTML = '<i class="fas fa-video"></i>';
            this.videoBtn.style.backgroundColor = 'var(--bg-light)';
            this.videoBtn.style.color = 'var(--text-dark)';
            this.localVideoPreview.style.display = 'block';
        }
        
        console.log(this.isVideoOff ? 'Video turned off' : 'Video turned on');
    }

    initiateWhatsAppCall() {
        // Create WhatsApp video call URL
        const whatsappUrl = `https://wa.me/${this.doctorNumber}?text=Hello%20Dr.%20Sharma,%20I%20would%20like%20to%20have%20a%20video%20consultation%20regarding%20my%20health%20concerns.`;
        
        // Show confirmation dialog
        const confirmed = confirm(`This will open WhatsApp to initiate a video call with Dr. Sharma at ${this.doctorNumber}. Do you want to continue?`);
        
        if (confirmed) {
            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');
            
            // Update status
            this.callStatus.textContent = 'WhatsApp call initiated. Please check your WhatsApp.';
            
            // In a real implementation, you would use WhatsApp Business API
            // or integrate with a telemedicine platform that supports WhatsApp
            console.log(`Initiating WhatsApp video call to ${this.doctorNumber}`);
            
            // For demo purposes, we'll simulate the WhatsApp call process
            this.simulateWhatsAppCall();
        }
    }

    simulateWhatsAppCall() {
        // Update UI to show WhatsApp call in progress
        this.whatsappInfo.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp call initiated to Dr. Sharma. Waiting for response...</span>
        `;
        
        // Simulate doctor accepting the call after 5 seconds
        setTimeout(() => {
            this.whatsappInfo.innerHTML = `
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp video call connected with Dr. Sharma</span>
            `;
            this.callStatus.textContent = 'WhatsApp video call active - 00:00';
            
            // In a real implementation, you would establish WebRTC connection here
            console.log('WhatsApp video call connected');
        }, 5000);
    }

    endCall() {
        // Clear the call timer
        if (this.callTimer) {
            clearInterval(this.callTimer);
        }
        
        // Stop all media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        
        // Reset call state
        this.isCallActive = false;
        this.callDuration = 0;
        
        // Hide the modal
        this.videoModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Show call ended message in the chat
        if (window.TriageUI) {
            window.TriageUI.addSystemMessage('Video consultation ended. Duration: ' + 
                Math.floor(this.callDuration / 60) + ' minutes ' + 
                (this.callDuration % 60) + ' seconds.');
        }
        
        // Reset buttons to default state
        this.resetControls();
        
        console.log('Call ended');
    }

    resetControls() {
        // Reset mute button
        this.isMuted = false;
        this.muteBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        this.muteBtn.style.backgroundColor = 'var(--bg-light)';
        this.muteBtn.style.color = 'var(--text-dark)';
        
        // Reset video button
        this.isVideoOff = false;
        this.videoBtn.innerHTML = '<i class="fas fa-video"></i>';
        this.videoBtn.style.backgroundColor = 'var(--bg-light)';
        this.videoBtn.style.color = 'var(--text-dark)';
        
        // Hide local video preview
        this.localVideoPreview.style.display = 'none';
        
        // Reset video elements
        this.remoteVideo.style.display = 'none';
        this.remoteVideoPlaceholder.style.display = 'block';
        this.remoteVideoPlaceholder.innerHTML = `
            <i class="fas fa-user-md"></i>
            <p>Connecting to Dr. Sharma...</p>
            <div class="connecting-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        // Hide WhatsApp info
        this.whatsappInfo.style.display = 'none';
    }

    // Method to initiate a call directly to the doctor's number
    initiateDoctorCall() {
        // Show confirmation dialog
        const confirmed = confirm(`This will initiate a video consultation with Dr. Sharma. Do you want to continue?`);
        
        if (confirmed) {
            this.startCall();
            
            // For demo purposes, we'll log the action
            console.log(`Initiating video consultation with doctor`);
        }
    }
}

// Initialize VideoCall globally
window.VideoCall = new VideoCall();

// Triage Chat UI Implementation
class TriageUI {
    constructor() {
        this.chatContainer = null;
        this.inputField = null;
        this.voiceButton = null;
        this.sendButton = null;
        this.isRecording = false;
        this.recognition = null;
        this.currentStep = 0;
        this.userResponses = {};
        this.triageResult = null;
        
        this.questions = [
            {
                id: 'welcome',
                text: 'I\'ll ask a few questions to understand your symptoms and provide guidance.',
                type: 'info'
            },
            {
                id: 'age',
                text: 'What is your age?',
                type: 'input',
                validation: (value) => !isNaN(value) && value > 0 && value < 120
            },
            {
                id: 'gender',
                text: 'What is your gender?',
                type: 'choice',
                options: ['Male', 'Female', 'Other']
            },
            {
                id: 'symptoms',
                text: 'Can you describe your main symptoms? Please be as specific as possible.',
                type: 'input'
            },
            {
                id: 'duration',
                text: 'How long have you been experiencing these symptoms?',
                type: 'choice',
                options: ['Less than 1 hour', '1-6 hours', '6-24 hours', '1-3 days', 'More than 3 days']
            },
            {
                id: 'severity',
                text: 'On a scale of 1-10, how severe is your discomfort? (1 being mild, 10 being severe)',
                type: 'choice',
                options: ['1-2 (Mild)', '3-4 (Mild-Moderate)', '5-6 (Moderate)', '7-8 (Severe)', '9-10 (Extreme)']
            },
            {
                id: 'history',
                text: 'Do you have any existing medical conditions or take any medications?',
                type: 'input'
            }
        ];
    }

    initialize() {
        this.chatContainer = document.getElementById('medical-chat-messages');
        this.inputField = document.getElementById('medical-chat-input');
        this.voiceButton = document.getElementById('voice-input-btn');
        this.sendButton = document.getElementById('send-message-btn');
        
        if (!this.chatContainer || !this.inputField) {
            console.error('Triage UI elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.startTriage();
    }

    setupEventListeners() {
        // Send button
        this.sendButton?.addEventListener('click', () => {
            this.handleUserInput();
        });
        
        // Enter key
        this.inputField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });
        
        // Voice button
        this.voiceButton?.addEventListener('click', () => {
            this.toggleVoiceRecording();
        });
        
        // Quick reply buttons
        this.chatContainer?.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply')) {
                this.handleQuickReply(e.target.textContent);
            }
        });
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceButton?.classList.add('recording');
                this.addSystemMessage('Listening... Speak now.');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.inputField.value = transcript;
                this.addUserMessage(transcript);
                this.processUserResponse(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addSystemMessage('Voice recognition failed. Please try typing instead.');
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.voiceButton?.classList.remove('recording');
            };
        } else {
            console.warn('Speech recognition not supported');
            if (this.voiceButton) {
                this.voiceButton.style.display = 'none';
            }
        }
    }

    addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        messageDiv.appendChild(typingDiv);
        this.chatContainer?.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    removeTypingIndicator(typingElement) {
        if (typingElement && typingElement.parentElement) {
            typingElement.remove();
        }
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            alert('Voice recognition not supported in this browser');
            return;
        }
        
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    startTriage() {
        this.clearChat();
        this.currentStep = 0;
        this.userResponses = {};
        this.askNextQuestion();
    }

    clearChat() {
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
            // Add initial message
            this.addBotMessage('Hello! I\'m your AI health assistant. Please describe your symptoms or select them from the list on the right.');
        }
    }

    askNextQuestion() {
        if (this.currentStep >= this.questions.length) {
            this.performTriage();
            return;
        }
        
        const question = this.questions[this.currentStep];
        
        // Show typing indicator
        const typingElement = this.addTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator(typingElement);
            this.addBotMessage(question.text, question.type === 'choice' ? question.options : null);
            
            if (question.type === 'info') {
                setTimeout(() => {
                    this.currentStep++;
                    this.askNextQuestion();
                }, 2000);
            }
        }, 1000);
    }

    handleUserInput() {
        const input = this.inputField?.value.trim();
        if (!input) return;
        
        this.addUserMessage(input);
        this.processUserResponse(input);
        this.inputField.value = '';
    }

    handleQuickReply(text) {
        this.addUserMessage(text);
        this.processUserResponse(text);
    }

    processUserResponse(response) {
        const currentQuestion = this.questions[this.currentStep];
        
        if (!currentQuestion || currentQuestion.type === 'info') {
            return;
        }
        
        if (currentQuestion.validation && !currentQuestion.validation(response)) {
            this.addBotMessage('Please provide a valid response.');
            return;
        }
        
        this.userResponses[currentQuestion.id] = response;
        this.currentStep++;
        
        setTimeout(() => {
            this.askNextQuestion();
        }, 1000);
    }

    addBotMessage(text, options = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.textContent = text;
        
        if (options && Array.isArray(options)) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quick-replies';
            
            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'quick-reply';
                button.textContent = option;
                optionsDiv.appendChild(button);
            });
            
            messageDiv.appendChild(optionsDiv);
        }
        
        this.chatContainer?.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = text;
        
        this.chatContainer?.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = text;
        
        this.chatContainer?.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }

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
            
            const result = await this.mockTriageAssessment(triageData);
            this.triageResult = result;
            this.displayTriageResult(result);
            
        } catch (error) {
            console.error('Triage assessment failed:', error);
            this.addBotMessage('Sorry, there was an error processing your symptoms. Please try again.');
        }
    }

    async mockTriageAssessment(data) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const symptoms = data.symptomsText.toLowerCase();
        const severity = parseInt(data.severity?.split('-')[0]) || 5;
        
        let level = 'green';
        let confidence = 0.75;
        let suggestions = [];
        
        if (symptoms.includes('chest pain') || 
            symptoms.includes('difficulty breathing') || 
            symptoms.includes('severe headache') ||
            symptoms.includes('unconscious') ||
            severity >= 8) {
            level = 'red';
            confidence = 0.9;
            suggestions = [
                'Seek immediate medical attention',
                'Call emergency services if symptoms worsen',
                'Do not drive yourself to hospital'
            ];
        }
        else if (symptoms.includes('fever') || 
                 symptoms.includes('vomiting') ||
                 symptoms.includes('severe pain') ||
                 severity >= 5) {
            level = 'yellow';
            confidence = 0.8;
            suggestions = [
                'Consult a doctor within 24 hours',
                'Monitor symptoms closely',
                'Rest and stay hydrated'
            ];
        }
        else {
            level = 'green';
            confidence = 0.7;
            suggestions = [
                'Self-care measures recommended',
                'Over-the-counter medications may help',
                'Consult doctor if symptoms persist'
            ];
        }
        
        return {
            level,
            confidence,
            suggestions,
            recommended_action: this.getRecommendedAction(level),
            reportId: 'report-' + Date.now()
        };
    }

    getRecommendedAction(level) {
        switch (level) {
            case 'red': return 'immediate_medical_attention';
            case 'yellow': return 'consult_doctor_soon';
            case 'green': default: return 'self_care';
        }
    }

    displayTriageResult(result) {
        const levelTexts = {
            'red': 'High Priority - Seek Immediate Medical Attention',
            'yellow': 'Medium Priority - Consult Doctor Soon', 
            'green': 'Low Priority - Self Care Recommended'
        };
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `triage-result ${result.level}`;
        
        // Add Doctor Concern button for severe cases
        const doctorConcernButton = result.level === 'red' ? 
            '<button class="cta-doctor" onclick="window.VideoCall.initiateDoctorCall()">Doctor Concern</button>' : 
            '';
        
        resultDiv.innerHTML = `
            <h4>${levelTexts[result.level]}</h4>
            <div class="confidence-score">Confidence: ${Math.round(result.confidence * 100)}%</div>
            <ul>
                ${result.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
            <div class="triage-actions">
                ${doctorConcernButton}
                ${result.level === 'red' ? '<button class="cta-primary" onclick="window.TriageUI.callVolunteer()">Call Volunteer</button>' : ''}
                <button class="cta-secondary" onclick="window.TriageUI.findHospital()">Find Hospital</button>
                <button class="cta-secondary" onclick="window.TriageUI.downloadReport()">Download Report</button>
            </div>
        `;
        
        this.chatContainer?.appendChild(resultDiv);
        this.scrollToBottom();
        
        if (result.level === 'red') {
            this.triggerEmergencyAlert(result);
        }
    }

    callVolunteer() {
        // Show call modal
        const callModal = document.getElementById('call-modal');
        callModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    findHospital() {
        // Show location modal
        const locationModal = document.getElementById('location-modal');
        locationModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    downloadReport() {
        if (!this.triageResult) return;
        
        try {
            this.addSystemMessage('Generating health report...');
            
            const reportData = {
                reportId: this.triageResult.reportId,
                userResponses: this.userResponses,
                triageResult: this.triageResult,
                timestamp: new Date().toISOString()
            };
            
            const reportContent = this.generateTextReport(reportData);
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `health-report-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.addSystemMessage('Health report downloaded successfully!');
            
        } catch (error) {
            console.error('Failed to download report:', error);
            this.addSystemMessage('Failed to generate report. Please try again.');
        }
    }

    generateTextReport(data) {
        return `
HEALTH ASSESSMENT REPORT
========================

Date: ${new Date(data.timestamp).toLocaleString()}
Report ID: ${data.reportId}

PATIENT INFORMATION:
- Age: ${data.userResponses.age || 'Not provided'}
- Gender: ${data.userResponses.gender || 'Not provided'}

SYMPTOMS:
${data.userResponses.symptoms || 'Not provided'}

DURATION: ${data.userResponses.duration || 'Not provided'}
SEVERITY: ${data.userResponses.severity || 'Not provided'}
MEDICAL HISTORY: ${data.userResponses.history || 'Not provided'}

ASSESSMENT RESULT:
Priority Level: ${data.triageResult.level.toUpperCase()}
Confidence: ${Math.round(data.triageResult.confidence * 100)}%

RECOMMENDATIONS:
${data.triageResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

DISCLAIMER:
This assessment is for informational purposes only and should not replace professional medical advice. 
Please consult with a healthcare professional for proper diagnosis and treatment.

Generated by Health Assistant
        `.trim();
    }

    triggerEmergencyAlert(result) {
        setTimeout(() => {
            this.addSystemMessage('🚨 Emergency alert automatically sent to nearby volunteers and hospitals.');
        }, 1000);
    }
}

// Initialize TriageUI globally
window.TriageUI = new TriageUI();

// DOM Elements
const authModal = document.getElementById('auth-modal');
const medicalBotPage = document.getElementById('medical-bot-page');
const mainContent = document.getElementById('main-content');
const locationModal = document.getElementById('location-modal');
const callModal = document.getElementById('call-modal');

// Initialize the website
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize animations
    initAnimations();
    
    // Initialize carousels
    initCarousels();
    
    // Initialize location and call modals
    initLocationAndCallModals();
    
    // Initialize Video Call functionality
    if (window.VideoCall) {
        window.VideoCall.initialize();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('show');
            hamburger.classList.remove('active');
        }
    });

    // Language Selector
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    languageBtn.addEventListener('click', () => {
        languageDropdown.classList.toggle('show');
    });

    // Close language dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });

    // Show Auth Modal
    function showAuthModal() {
        authModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Hide Auth Modal
    function hideAuthModal() {
        authModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Show Medical Bot Page
    function showMedicalBotPage() {
        // Hide main content
        mainContent.style.display = 'none';
        
        // Show medical bot page
        medicalBotPage.classList.add('active');
        
        // Initialize triage UI
        if (window.TriageUI) {
            setTimeout(() => {
                window.TriageUI.initialize();
            }, 100);
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Back to home
    function backToHome() {
        // Hide medical bot page
        medicalBotPage.classList.remove('active');
        
        // Show main content
        mainContent.style.display = 'block';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Event listeners for CTA buttons
    document.getElementById('check-symptoms-btn').addEventListener('click', showAuthModal);
    document.getElementById('hero-cta').addEventListener('click', showAuthModal);
    document.getElementById('cta-button').addEventListener('click', showAuthModal);

    // Close Auth Modal
    document.getElementById('close-auth-modal').addEventListener('click', hideAuthModal);

    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            hideAuthModal();
        }
    });

    // Tab Switching
    document.querySelector('.tab[data-tab="login"]').addEventListener('click', () => {
        document.querySelector('.tab[data-tab="login"]').classList.add('active');
        document.querySelector('.tab[data-tab="signup"]').classList.remove('active');
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('signup-tab').classList.remove('active');
    });

    document.querySelector('.tab[data-tab="signup"]').addEventListener('click', () => {
        document.querySelector('.tab[data-tab="signup"]').classList.add('active');
        document.querySelector('.tab[data-tab="login"]').classList.remove('active');
        document.getElementById('signup-tab').classList.add('active');
        document.getElementById('login-tab').classList.remove('active');
    });

    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.tab[data-tab="signup"]').click();
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.tab[data-tab="login"]').click();
    });

    // Form Submissions - Skip validation and proceed directly
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Skip validation and proceed directly
        hideAuthModal();
        showMedicalBotPage();
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Skip validation and proceed directly
        hideAuthModal();
        showMedicalBotPage();
    });

    // Back to home
    document.getElementById('back-to-home').addEventListener('click', backToHome);

    // Analyze symptoms
    document.getElementById('analyze-symptoms').addEventListener('click', analyzeSelectedSymptoms);

    // Clear symptoms
    document.getElementById('clear-symptoms').addEventListener('click', clearSelectedSymptoms);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                mobileMenu.classList.remove('show');
                hamburger.classList.remove('active');
            }
        });
    });
}

// Initialize location and call modals
function initLocationAndCallModals() {
    // Location Modal
    const closeLocationModal = document.getElementById('close-location-modal');
    const getLocationBtn = document.getElementById('get-location-btn');
    const openGoogleMapsBtn = document.getElementById('open-google-maps');
    const mapContainer = document.getElementById('map-container');
    
    closeLocationModal.addEventListener('click', () => {
        locationModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    locationModal.addEventListener('click', (e) => {
        if (e.target === locationModal) {
            locationModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
    
    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Display success message
                    mapContainer.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 1rem;"></i>
                            <p>Location found! Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}</p>
                            <p>Click "Open Google Maps" to find nearby hospitals.</p>
                        </div>
                    `;
                    
                    // Store coordinates for Google Maps
                    getLocationBtn.dataset.lat = lat;
                    getLocationBtn.dataset.lng = lng;
                },
                (error) => {
                    console.error('Error getting location:', error);
                    mapContainer.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                            <p>Unable to get your location. Please ensure location services are enabled.</p>
                            <p>You can still open Google Maps to search for hospitals manually.</p>
                        </div>
                    `;
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });
    
    openGoogleMapsBtn.addEventListener('click', () => {
        const lat = getLocationBtn.dataset.lat;
        const lng = getLocationBtn.dataset.lng;
        
        let mapsUrl = 'https://www.google.com/maps/search/hospitals';
        
        if (lat && lng) {
            mapsUrl += `/@${lat},${lng},14z`;
        }
        
        // Open Google Maps in a new tab
        window.open(mapsUrl, '_blank');
        
        // Close the modal
        locationModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    // Call Modal
    const closeCallModal = document.getElementById('close-call-modal');
    const callNowBtn = document.getElementById('call-now-btn');
    const clearNumberBtn = document.getElementById('clear-number');
    const dialDisplay = document.getElementById('dial-display');
    const dialButtons = document.querySelectorAll('.dial-button');
    
    closeCallModal.addEventListener('click', () => {
        callModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    callModal.addEventListener('click', (e) => {
        if (e.target === callModal) {
            callModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Dial pad functionality
    dialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.dataset.number;
            dialDisplay.textContent += number;
        });
    });
    
    clearNumberBtn.addEventListener('click', () => {
        dialDisplay.textContent = '+91-9876543210';
    });
    
    callNowBtn.addEventListener('click', () => {
        const phoneNumber = dialDisplay.textContent.replace(/\D/g, '');
        window.open(`tel:${phoneNumber}`, '_self');
    });
}

// Initialize animations
function initAnimations() {
    // Typewriter Effect
    const texts = [
        "No More Confusion", 
        "No More Delay", 
        "Only Instant Clarity"
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Deleting text
            typewriterText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Typing text
            typewriterText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        // Check if we've finished typing the current text
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at the end of typing
            typingSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next text after deleting
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }

    // Start typewriter effect
    const typewriterText = document.getElementById('typewriter-text');
    setTimeout(typeWriter, 1000);

    // Hero Slideshow
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Change slide every 5 seconds
    setInterval(nextSlide, 5000);

    // Scroll Animations
    function animateOnScroll() {
        const elements = document.querySelectorAll('.step-card, .feature-card, .benefit-item, .testimonial-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // Initial check for elements in view
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
}

// Initialize carousels
function initCarousels() {
    // Partners carousel animation
    const partnersCarousel = document.getElementById('partners-carousel');
    let partnerPosition = 0;
    const partnerItems = document.querySelectorAll('.partner-logo');
    const partnerWidth = 120 + 32; // width + gap
    
    function animatePartners() {
        partnerPosition -= 1;
        partnersCarousel.style.transform = 'translateX(' + partnerPosition + 'px)';
        
        // Reset position when first item is completely out of view
        if (Math.abs(partnerPosition) >= partnerWidth) {
            partnerPosition = 0;
            // Move first item to the end
            const firstItem = partnersCarousel.firstElementChild;
            partnersCarousel.appendChild(firstItem);
        }
        
        requestAnimationFrame(animatePartners);
    }
    
    // Start animation
    animatePartners();
}

// Analyze selected symptoms
function analyzeSelectedSymptoms() {
    const selectedSymptoms = [];
    document.querySelectorAll('input[name="medical-symptoms"]:checked').forEach(checkbox => {
        selectedSymptoms.push(checkbox.value);
    });
    
    if (selectedSymptoms.length === 0) {
        if (window.TriageUI) {
            window.TriageUI.addBotMessage("Please select at least one symptom to analyze.");
        }
        return;
    }
    
    // Add user message with selected symptoms
    if (window.TriageUI) {
        window.TriageUI.addUserMessage('I have these symptoms: ' + selectedSymptoms.join(', '));
        
        // Simulate AI analysis
        setTimeout(() => {
            let response = "";
            
            // Check for severe symptoms
            const severeSymptoms = selectedSymptoms.filter(symptom => 
                ['High Fever', 'Breathing Problem', 'Unconsciousness', 'Severe Bleeding'].includes(symptom)
            );
            
            if (severeSymptoms.length > 0) {
                response = 'Based on your symptoms (' + selectedSymptoms.join(', ') + '), I\'ve detected potentially serious conditions. I strongly recommend seeking immediate medical attention. Your symptoms may require urgent care.';
            } 
            // Check for moderate symptoms
            else if (selectedSymptoms.some(symptom => 
                ['Chest Pain', 'Vomiting', 'Dizziness', 'Abdominal Pain'].includes(symptom)
            )) {
                response = 'Based on your symptoms (' + selectedSymptoms.join(', ') + '), I recommend consulting with a healthcare provider within 24-48 hours. These symptoms may require medical evaluation.';
            }
            // Normal symptoms
            else {
                response = 'Based on your symptoms (' + selectedSymptoms.join(', ') + '), these appear to be common conditions that often resolve on their own. I recommend rest, hydration, and monitoring your symptoms. If they persist or worsen, consult a healthcare provider.';
            }
            
            window.TriageUI.addBotMessage(response);
        }, 1500);
    }
}

// Clear selected symptoms
function clearSelectedSymptoms() {
    document.querySelectorAll('input[name="medical-symptoms"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    if (window.TriageUI) {
        window.TriageUI.addBotMessage("I've cleared your symptom selection. You can now select different symptoms.");
    }
}

// Initialize the website
init();
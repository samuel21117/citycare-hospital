// Rule-based chatbot logic
function toggleChatbot() {
    const windowEl = document.getElementById('chatbotWindow');
    windowEl.classList.toggle('active');
}

function sendMessage() {
    const inputEl = document.getElementById('chatbotInput');
    const message = inputEl.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    inputEl.value = '';

    // Simulate small delay
    setTimeout(() => {
        const response = getChatbotResponse(message.toLowerCase());
        addMessage(response, 'bot');
    }, 500);
}

function addMessage(text, sender) {
    const messagesEl = document.getElementById('chatbotMessages');
    const div = document.createElement('div');
    div.style.padding = '10px';
    div.style.borderRadius = '8px';
    div.style.maxWidth = '80%';
    div.style.marginBottom = '10px';
    
    if (sender === 'user') {
        div.style.background = '#e0e7ff';
        div.style.color = '#3730a3';
        div.style.alignSelf = 'flex-end';
        div.style.marginLeft = 'auto';
    } else {
        div.style.background = '#f1f5f9';
        div.style.color = '#0f172a';
        div.style.alignSelf = 'flex-start';
    }
    
    div.innerHTML = text; // allow safe HTML like links
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function getChatbotResponse(msg) {
    if (msg.includes('headache')) {
        return "I'm sorry to hear you have a headache. Please rest and drink plenty of water. If it persists, I recommend you <a href='patient-dashboard.html' style='color:#2563eb;'>book an appointment</a> with a doctor.";
    }
    if (msg.includes('appointment') || msg.includes('book')) {
        return "You can easily book an appointment by logging into your patient dashboard. Just click 'Log In' on the main page, then go to the Book Appointment section.";
    }
    if (msg.includes('prescription') || msg.includes('medicine')) {
        return "Your prescriptions are available in your patient dashboard. Once a doctor issues one, you can download it or order the medicine directly from our pharmacy.";
    }
    if (msg.includes('fever') || msg.includes('cough')) {
        return "Symptoms like fever and cough should be evaluated by a professional. Please <a href='patient-dashboard.html' style='color:#2563eb;'>book an appointment</a> to consult a doctor as soon as possible.";
    }
    return "I'm a basic health assistant. I can help guide you on how to use the system or answer basic queries. For medical advice, please book a consultation with our doctors.";
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('chatbotInput');
    if(inputEl) {
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

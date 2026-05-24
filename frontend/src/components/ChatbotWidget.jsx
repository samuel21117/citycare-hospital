import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Hello! How can I help you today?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const toggleChatbot = () => setIsOpen(!isOpen);

    const getResponse = (msg) => {
        const text = msg.toLowerCase();
        if (text.includes('headache')) return "I'm sorry you have a headache. Please rest and drink water. If it persists, book an appointment.";
        if (text.includes('appointment') || text.includes('book')) return "You can book an appointment by logging into your patient dashboard.";
        if (text.includes('prescription') || text.includes('medicine')) return "Your prescriptions are available in your patient dashboard.";
        if (text.includes('fever') || text.includes('cough')) return "Please book an appointment to consult a doctor as soon as possible.";
        return "I'm a basic health assistant. For medical advice, please book a consultation with our doctors.";
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages(prev => [...prev, { text: input, sender: 'user' }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, { text: getResponse(input), sender: 'bot' }]);
        }, 500);
    };

    return (
        <div className="chatbot-widget">
            <div className={`chatbot-window ${isOpen ? 'active' : ''}`}>
                <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Health Assistant
                    <X size={20} style={{ cursor: 'pointer' }} onClick={toggleChatbot} />
                </div>
                <div className="chatbot-messages" style={{ display: 'flex', flexDirection: 'column' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            padding: '10px',
                            borderRadius: '8px',
                            maxWidth: '80%',
                            marginBottom: '10px',
                            background: msg.sender === 'user' ? '#e0e7ff' : '#f1f5f9',
                            color: msg.sender === 'user' ? '#3730a3' : '#0f172a',
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form className="chatbot-input-area" onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>Send</button>
                </form>
            </div>
            
            {!isOpen && (
                <div className="chatbot-toggle" onClick={toggleChatbot}>
                    <MessageCircle size={28} />
                </div>
            )}
        </div>
    );
}

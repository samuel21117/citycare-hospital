import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Hello! How can I help you today?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChatbot = () => setIsOpen(!isOpen);

    const getResponse = async (msg) => {
        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            if (res.ok) {
                return data.text;
            } else {
                console.error("AI Error:", data.error);
                return "I'm experiencing some technical difficulties. Please try again later.";
            }
        } catch (err) {
            console.error("Chat error:", err);
            return "Unable to reach the health assistant server.";
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInput('');
        
        setIsLoading(true);
        const aiText = await getResponse(userMsg);
        setIsLoading(false);
        setMessages(prev => [...prev, { text: aiText, sender: 'bot' }]);
    };

    return (
        <div className="chatbot-widget">
            <div className={`chatbot-window ${isOpen ? 'active' : ''}`}>
                <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={20} />
                        Health Assistant
                    </div>
                    <button 
                        onClick={toggleChatbot}
                        style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            border: 'none', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: '32px', 
                            height: '32px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        aria-label="Close chat"
                        title="Close chat"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="chatbot-messages" style={{ display: 'flex', flexDirection: 'column' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            maxWidth: '85%',
                            marginBottom: '10px',
                            background: msg.sender === 'user' ? '#e0e7ff' : '#f1f5f9',
                            color: msg.sender === 'user' ? '#3730a3' : '#0f172a',
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                        }}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            maxWidth: '85%',
                            marginBottom: '10px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            alignSelf: 'flex-start',
                            fontSize: '0.9rem',
                            fontStyle: 'italic'
                        }}>
                            CityCare AI is typing...
                        </div>
                    )}
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

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config';
import { X } from 'lucide-react';

export default function VideoConsultation({ appointmentId, onClose }) {
    const { profile } = useAuth();
    
    // Generate a unique, consistent room name for this specific appointment
    const roomName = `${APP_CONFIG.shortName.replace(/[^a-zA-Z0-9]/g, '')}-Consultation-${appointmentId}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                padding: '12px 24px',
                background: '#111',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {APP_CONFIG.shortName} Secure Telehealth
                </div>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#ef4444'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <X size={18} /> Leave Call
                </button>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '12px', margin: 0 }}>Ready to join?</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '32px', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
                    To bypass the 5-minute demo restriction, your secure video consultation will open in a new tab.
                </p>
                <a 
                    href={`https://meet.jit.si/${roomName}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={onClose}
                    style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        padding: '14px 36px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'inline-block'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                    }}
                >
                    Launch Video Room
                </a>
                <button 
                    onClick={onClose}
                    style={{
                        marginTop: '24px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        textDecoration: 'underline'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
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
            
            <div style={{ flex: 1 }}>
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        prejoinPageEnabled: true
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                    }}
                    userInfo={{
                        displayName: profile?.name || 'Guest'
                    }}
                    onApiReady={(externalApi) => {
                        // We can attach event listeners here if needed
                        externalApi.addListener('videoConferenceLeft', () => {
                            onClose();
                        });
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                        iframeRef.style.width = '100%';
                        iframeRef.style.border = 'none';
                    }}
                />
            </div>
        </div>
    );
}

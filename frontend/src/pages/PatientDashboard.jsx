import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { logout } from '../services/auth';
import { jsPDF } from 'jspdf';
import { LayoutDashboard, Calendar, FileText, Pill, MessageCircle, HeadphonesIcon, ChevronDown, Activity, ChevronLeft, ChevronRight, Video, LogOut } from 'lucide-react';
import { APP_CONFIG } from '../config';
import VideoConsultation from '../components/VideoConsultation';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
    const { profile } = useAuth();
    const [activeSection, setActiveSection] = useState('appointments');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [activeCallId, setActiveCallId] = useState(null);

    // Chatbot state
    const [chatMessages, setChatMessages] = useState([
        { text: 'Hello! How can I help you today?', sender: 'bot' }
    ]);
    const [chatInput, setChatInput] = useState('');

    // Booking form state
    const [docSelect, setDocSelect] = useState('');
    const [appDate, setAppDate] = useState('');
    const [appTime, setAppTime] = useState('');
    const [appType, setAppType] = useState('online');

    const timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
        "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
    ];

    useEffect(() => {
        loadDoctors();
        loadHistory();
    }, []);

    const loadDoctors = async () => {
        try {
            const data = await fetchAPI('/users/doctors');
            setDoctors(data);
            if (data.length > 0) setDocSelect(data[0].id);
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    };

    const loadHistory = async () => {
        try {
            const [apps, pres] = await Promise.all([
                fetchAPI('/appointments'),
                fetchAPI('/prescriptions')
            ]);
            setAppointments(apps);
            setPrescriptions(pres);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!appDate || !appTime) {
            toast.error("Please select a date and time slot.");
            return;
        }

        try {
            const newApp = await fetchAPI('/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    doctor_id: docSelect,
                    appointment_date: appDate,
                    appointment_time: appTime,
                    type: appType
                })
            });
            
            setAppointments([...appointments, newApp]);
            toast.success('Appointment booked successfully!');
            setAppDate('');
            setAppTime('');
            loadHistory();
            setActiveSection('dashboard');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDownloadPDF = (app, pres) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(0, 128, 128);
        doc.text(APP_CONFIG.hospitalName, 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('E-Prescription', 20, 30);
        
        doc.setFontSize(12);
        doc.text(`Patient: ${profile?.name}`, 20, 45);
        doc.text(`Doctor: Dr. ${app.doctor?.name}`, 20, 52);
        doc.text(`Date: ${app.appointment_date}`, 20, 59);
        
        doc.setLineWidth(0.5);
        doc.line(20, 65, 190, 65);
        
        doc.setFontSize(14);
        doc.text('Medicines:', 20, 75);
        
        doc.setFontSize(11);
        let yPos = 85;
        if (pres.medicines && Array.isArray(pres.medicines)) {
            pres.medicines.forEach((m, idx) => {
                doc.text(`${idx + 1}. ${m.medicine_name || 'Medicine'} - ${m.dosage}`, 25, yPos);
                yPos += 10;
            });
        }
        
        doc.setFontSize(10);
        doc.text('Instructions:', 20, yPos + 10);
        doc.text(pres.instructions || 'Please complete the full course as prescribed.', 20, yPos + 18);
        
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a digitally generated e-prescription.', 20, 280);
        
        doc.save(`Prescription_PAT${app.patient_id.substring(0,6).toUpperCase()}_${app.appointment_date}.pdf`);
    };

    const getBotResponse = (msg) => {
        const text = msg.toLowerCase();
        if (text.includes('headache')) return "I'm sorry you have a headache. Please rest and drink water. If it persists, book an appointment.";
        if (text.includes('appointment') || text.includes('book')) return "You can book an appointment from the 'Appointments' tab.";
        if (text.includes('prescription') || text.includes('medicine')) return "Your prescriptions are available in your 'Prescriptions' tab.";
        if (text.includes('fever') || text.includes('cough')) return "Please book an appointment to consult a doctor as soon as possible.";
        return "I'm a basic health assistant. For medical advice, please book a consultation with our doctors.";
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setChatMessages(prev => [...prev, { text: chatInput, sender: 'user' }]);
        setChatInput('');

        setTimeout(() => {
            setChatMessages(prev => [...prev, { text: getBotResponse(chatInput), sender: 'bot' }]);
        }, 500);
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            className={`sidebar-btn ${activeSection === id ? 'active' : ''}`}
            onClick={() => setActiveSection(id)}
            style={{ marginBottom: '8px' }}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="dashboard-layout">
            <div className="sidebar" style={{ justifyContent: 'space-between' }}>
                <div>
                    <div className="sidebar-logo">
                        <Activity size={28} />
                        {APP_CONFIG.shortName}
                        <div style={{ fontSize: '0.6rem', color: 'var(--slate-400)', position: 'absolute', top: '50px', left: '60px' }}>Your Health, Our Priority</div>
                    </div>
                    
                    <div className="sidebar-nav" style={{ marginTop: '30px' }}>
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="appointments" icon={Calendar} label="Appointments" />
                        <SidebarItem id="prescriptions" icon={FileText} label="Prescriptions" />
                        <SidebarItem id="pharmacy" icon={Pill} label="Pharmacy" />
                        <SidebarItem id="chat" icon={MessageCircle} label="Chat" />
                    </div>
                    
                    <div className="sidebar-nav" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button className="sidebar-btn" onClick={async () => { await logout(); }} style={{ color: '#ef4444' }}>
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </div>
                </div>

                <div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <HeadphonesIcon size={24} color="var(--teal-primary)" />
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>Need Help?</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Our support team is here to help you.</div>
                            <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('chat'); }} style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}>Chat with us</a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--slate-800)' }}>
                            {profile?.name}
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content" style={{ background: '#fff' }}>
                {activeSection === 'appointments' && (
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '4px' }}>Book an Appointment</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '24px' }}>Choose your preferred department, doctor and time slot.</p>
                        
                        <form onSubmit={handleBookAppointment}>
                            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                                <div className="grid-3" style={{ alignItems: 'end' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Department</label>
                                        <select className="form-control" defaultValue="Cardiology">
                                            <option>Cardiology</option>
                                            <option>Neurology</option>
                                            <option>General Medicine</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Doctor</label>
                                        <select className="form-control" value={docSelect} onChange={e => setDocSelect(e.target.value)} required>
                                            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Appointment Type</label>
                                        <div style={{ display: 'flex', gap: '20px', height: '45px', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input type="radio" name="type" value="online" checked={appType === 'online'} onChange={() => setAppType('online')} />
                                                Online (Video Consultation)
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input type="radio" name="type" value="in-person" checked={appType === 'in-person'} onChange={() => setAppType('in-person')} />
                                                In-person (At Hospital)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Date</label>
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <ChevronLeft size={20} style={{ cursor: 'pointer', color: 'var(--slate-400)' }} />
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>May 2026</div>
                                            <ChevronRight size={20} style={{ cursor: 'pointer', color: 'var(--slate-400)' }} />
                                        </div>
                                        <input type="date" className="form-control" value={appDate} onChange={e => setAppDate(e.target.value)} required style={{ border: 'none', background: '#f8fafc' }} />
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--slate-500)', justifyContent: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal-primary)' }}></div> Available</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div> Limited Availability</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 2 }}>
                                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Time Slot</label>
                                    <div className="grid-4" style={{ gap: '12px' }}>
                                        {timeSlots.map(time => (
                                            <div 
                                                key={time} 
                                                onClick={() => setAppTime(time)}
                                                style={{ 
                                                    padding: '10px 0', 
                                                    textAlign: 'center', 
                                                    border: appTime === time ? '2px solid var(--teal-primary)' : '1px solid var(--border-color)', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.85rem', 
                                                    color: appTime === time ? 'var(--teal-primary)' : 'var(--slate-500)',
                                                    fontWeight: appTime === time ? 600 : 500,
                                                    cursor: 'pointer',
                                                    background: appTime === time ? 'var(--teal-light)' : '#fff'
                                                }}
                                            >
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Activity size={12} /> All times are shown in your local timezone.
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', padding: '16px' }}>
                                <button type="submit" className="btn btn-primary" style={{ width: '300px', padding: '14px', fontSize: '1rem' }}>
                                    <Calendar size={18} /> Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === 'chat' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '80vh', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', background: 'var(--teal-primary)', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MessageCircle size={24} /> Health Assistant
                        </div>
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                            {chatMessages.map((msg, i) => (
                                <div key={i} style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    maxWidth: '75%',
                                    marginBottom: '12px',
                                    background: msg.sender === 'user' ? 'var(--teal-primary)' : '#e2e8f0',
                                    color: msg.sender === 'user' ? '#fff' : '#0f172a',
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    lineHeight: '1.4',
                                    fontSize: '0.95rem'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '16px', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Type your message here..." 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                style={{ flex: 1, marginRight: '12px' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>Send</button>
                        </form>
                    </div>
                )}

                {/* Dashboard and History views are merged for simplicity or could be fleshed out similar to the booking flow */}
                {(activeSection !== 'appointments' && activeSection !== 'chat') && (
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '4px' }}>My Records</h2>
                        <div style={{ marginTop: '20px' }}>
                            {appointments.length === 0 ? <p>No records found.</p> : appointments.map(app => {
                                const pres = prescriptions.find(p => p.appointment_id === app.id);
                                return (
                                    <div key={app.id} style={{ border: '1px solid var(--border-color)', padding: '16px', marginBottom: '12px', borderRadius: '8px', background: 'var(--surface-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0 }}>Dr. {app.doctor?.name || 'Unknown'}</h4>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {app.type === 'online' && app.status === 'scheduled' && (
                                                    <button 
                                                        className="btn btn-primary" 
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#3b82f6' }}
                                                        onClick={() => setActiveCallId(app.id)}
                                                    >
                                                        <Video size={14} /> Join Call
                                                    </button>
                                                )}
                                                <span className={`badge badge-${app.status}`}>{app.status.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {app.appointment_date} at {app.appointment_time} ({app.type})
                                        </p>
                                        
                                        {pres && (
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                                                    <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                    Prescription available
                                                </div>
                                                <button 
                                                    className="btn btn-outline" 
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--teal-primary)', borderColor: 'var(--teal-primary)' }}
                                                    onClick={() => handleDownloadPDF(app, pres)}
                                                >
                                                    Download PDF
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            
            {activeCallId && (
                <VideoConsultation 
                    appointmentId={activeCallId} 
                    onClose={() => setActiveCallId(null)} 
                />
            )}
        </div>
    );
}

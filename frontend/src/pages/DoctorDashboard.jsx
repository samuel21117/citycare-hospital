import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { logout } from '../services/auth';
import { Activity, Calendar, History, FileText, LogOut, Menu, Bell, Trash2, Plus, Video, Loader } from 'lucide-react';
import { APP_CONFIG } from '../config';
import VideoConsultation from '../components/VideoConsultation';
import toast from 'react-hot-toast';

const SidebarItem = ({ id, icon: Icon, label, activeSection, setActiveSection }) => (
    <button 
        className={`sidebar-btn ${activeSection === id ? 'active' : ''}`}
        onClick={() => setActiveSection(id)}
        style={{ marginBottom: '8px', color: '#fff' }}
    >
        <Icon size={20} />
        {label}
    </button>
);

export default function DoctorDashboard() {
    const { profile } = useAuth();
    const [activeSection, setActiveSection] = useState('patients');
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [activeCallId, setActiveCallId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Selected Patient State
    const [selectedApp, setSelectedApp] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [selectedMeds, setSelectedMeds] = useState([]);
    
    const [medSelect, setMedSelect] = useState('');
    const [medDosage] = useState('1 Tablet');
    const [medFreq] = useState('Twice daily');
    const [medDuration] = useState('5 days');


    const loadQueue = async () => {
        try {
            const data = await fetchAPI('/appointments');
            setAppointments(data);
            const scheduled = data.filter(a => a.status === 'scheduled');
            if(scheduled.length > 0) setSelectedApp(scheduled[0]);
        } catch (error) {
            console.error('Error loading queue:', error);
        }
    };

    const loadMedicines = async () => {
        try {
            const data = await fetchAPI('/pharmacy/medicines');
            setMedicines(data);
            if (data.length > 0) setMedSelect(data[0].id);
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    };

    useEffect(() => {
        // Add theme class to body for specific CSS variables
        document.body.classList.add('theme-doctor');
        
        const init = async () => {
            setIsLoading(true);
            await Promise.all([loadQueue(), loadMedicines()]);
            setIsLoading(false);
        };
        init();
        
        return () => document.body.classList.remove('theme-doctor');
    }, []);

    const pendingAppointments = appointments.filter(a => a.status === 'scheduled');

    const handleAddMedicine = () => {
        if (!medSelect) return;
        const medInfo = medicines.find(m => m.id === medSelect);
        
        let freqMultiplier = 1;
        if (medFreq === 'Twice daily') freqMultiplier = 2;
        if (medFreq === 'Thrice daily') freqMultiplier = 3;
        
        let durationDays = parseInt(medDuration.split(' ')[0]) || 5;
        let dosageUnits = parseFloat(medDosage.split(' ')[0]) || 1;
        
        let calcQuantity = Math.ceil(dosageUnits * freqMultiplier * durationDays);
        if (medDosage.includes('ml')) {
             calcQuantity = 1; // e.g. 1 bottle for liquids
        }

        setSelectedMeds([...selectedMeds, { 
            medicine_id: medSelect, 
            name: medInfo.name, 
            dosage: medDosage, 
            frequency: medFreq,
            duration: medDuration,
            quantity: calcQuantity
        }]);
    };

    const handleRemoveMedicine = (idx) => {
        setSelectedMeds(selectedMeds.filter((_, i) => i !== idx));
    };

    const handlePrescribe = async () => {
        if (!selectedApp) return;
        if (selectedMeds.length === 0) {
            toast.error('Please add at least one medicine.');
            return;
        }

        try {
            await fetchAPI('/prescriptions', {
                method: 'POST',
                body: JSON.stringify({
                    appointment_id: selectedApp.id,
                    patient_id: selectedApp.patient_id,
                    instructions: instructions,
                    medicines: selectedMeds.map(m => ({ medicine_id: m.medicine_id, dosage: `${m.dosage} ${m.frequency} for ${m.duration}`, quantity: m.quantity }))
                })
            });
            toast.success('Prescription saved and sent to pharmacy!');
            setInstructions('');
            setSelectedMeds([]);
            loadQueue();
        } catch (error) {
            toast.error(error.message);
        }
    };



    return (
        <div className="dashboard-layout">
            <div className="sidebar" style={{ background: 'var(--teal-dark)', color: '#fff', borderRight: 'none' }}>
                <div className="sidebar-logo" style={{ color: '#fff', justifyContent: 'center' }}>
                    <Activity size={28} />
                    {APP_CONFIG.hospitalName}
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', color: 'var(--teal-dark)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                        {profile?.name?.charAt(0) || 'D'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dr. {profile?.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>MBBS, MD (Physician)</div>
                </div>

                <div className="sidebar-nav">
                    <SidebarItem id="patients" icon={Calendar} label="Today's Patients" activeSection={activeSection} setActiveSection={setActiveSection} />
                    <SidebarItem id="history" icon={History} label="History" activeSection={activeSection} setActiveSection={setActiveSection} />
                    <SidebarItem id="prescriptions" icon={FileText} label="Prescriptions" activeSection={activeSection} setActiveSection={setActiveSection} />
                </div>

                <button className="sidebar-btn" onClick={async () => { await logout(); }} style={{ color: '#fff', marginTop: 'auto' }}>
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>

            <div className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 600, fontSize: '1.1rem' }}>
                        <Menu size={20} />
                        Dashboard
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        <div>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <Bell size={18} />
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {profile?.name?.charAt(0) || 'D'}
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '32px', background: 'var(--slate-50)' }}>
                    {isLoading ? (
                        <div className="loading-container">
                            <Loader className="spinner" size={48} color="var(--teal-primary)" />
                            <div style={{ fontWeight: 500 }}>Loading patient queue...</div>
                        </div>
                    ) : (
                        <>
                            {activeSection === 'patients' && (
                                <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
                            {/* Left Column: Queue */}
                            <div className="glass-card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Patient Queue</h3>
                                    <span style={{ fontSize: '0.75rem', background: 'var(--slate-100)', padding: '4px 8px', borderRadius: '12px', color: 'var(--slate-600)' }}>{pendingAppointments.length} Total Patients</span>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {pendingAppointments.map((app, idx) => (
                                        <div 
                                            key={app.id} 
                                            onClick={() => setSelectedApp(app)}
                                            style={{ 
                                                padding: '16px 20px', 
                                                borderBottom: '1px solid var(--border-color)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px',
                                                cursor: 'pointer',
                                                background: selectedApp?.id === app.id ? 'var(--teal-light)' : 'transparent'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.9rem', color: 'var(--slate-400)', width: '20px' }}>{idx + 1}</div>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--slate-200)' }}></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)' }}>{app.patient?.name || 'Unknown Patient'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.type}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-800)' }}>{app.appointment_time}</div>
                                                <div style={{ fontSize: '0.7rem', color: idx === 0 ? 'var(--teal-primary)' : 'var(--slate-500)', fontWeight: idx === 0 ? 600 : 400 }}>{idx === 0 ? 'Current' : 'Upcoming'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}>View All Appointments &gt;</a>
                                </div>
                            </div>

                            {/* Right Column: Details & Prescription */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {selectedApp ? (
                                    <>
                                        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--slate-200)' }}></div>
                                                <div>
                                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--slate-800)' }}>{selectedApp.patient?.name || 'Unknown Patient'}</h2>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>ID: PAT-{selectedApp.patient_id.substring(0,6).toUpperCase()} • {selectedApp.type === 'online' ? 'Online Consultation' : 'In-Person'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {selectedApp.type === 'online' && (
                                                    <button 
                                                        className="btn btn-primary" 
                                                        style={{ background: '#3b82f6' }}
                                                        onClick={() => setActiveCallId(selectedApp.id)}
                                                    >
                                                        <Video size={16} /> Join Video Call
                                                    </button>
                                                )}
                                                <button className="btn btn-outline" style={{ color: 'var(--teal-primary)', borderColor: 'var(--teal-primary)' }}>View History</button>
                                            </div>
                                        </div>

                                        <div className="grid-2">
                                            <div className="glass-card">
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Symptoms</h4>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                                                    <ul style={{ paddingLeft: '20px' }}>
                                                        {selectedApp.symptoms ? selectedApp.symptoms.split(',').map((sym, i) => <li key={i}>{sym.trim()}</li>) : <li>No symptoms reported prior to visit.</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="glass-card">
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Clinical Notes</h4>
                                                <textarea 
                                                    className="form-control" 
                                                    style={{ height: '100px', fontSize: '0.85rem', border: 'none', background: 'var(--slate-50)' }} 
                                                    placeholder="Enter clinical notes here..."
                                                    value={instructions}
                                                    onChange={e => setInstructions(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="glass-card" style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>E-Prescription</h4>
                                            </div>

                                            <table className="data-table" style={{ marginBottom: '16px' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Medicine</th>
                                                        <th>Dosage</th>
                                                        <th>Frequency</th>
                                                        <th>Duration</th>
                                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedMeds.map((med, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontSize: '0.9rem', fontWeight: 500 }}>{med.name}</td>
                                                            <td><select className="form-control" style={{ padding: '6px' }} value={med.dosage} onChange={e => {
                                                                const newMeds = [...selectedMeds]; newMeds[idx].dosage = e.target.value; setSelectedMeds(newMeds);
                                                            }}>
                                                                <option>1 Tablet</option><option>2 Tablets</option><option>10 ml</option>
                                                            </select></td>
                                                            <td><select className="form-control" style={{ padding: '6px' }} value={med.frequency} onChange={e => {
                                                                const newMeds = [...selectedMeds]; newMeds[idx].frequency = e.target.value; setSelectedMeds(newMeds);
                                                            }}>
                                                                <option>Once daily</option><option>Twice daily</option><option>Thrice daily</option>
                                                            </select></td>
                                                            <td><select className="form-control" style={{ padding: '6px' }} value={med.duration} onChange={e => {
                                                                const newMeds = [...selectedMeds]; newMeds[idx].duration = e.target.value; setSelectedMeds(newMeds);
                                                            }}>
                                                                <option>3 days</option><option>5 days</option><option>7 days</option>
                                                            </select></td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <Trash2 size={18} color="var(--error-color)" style={{ cursor: 'pointer' }} onClick={() => handleRemoveMedicine(idx)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <td colSpan="5" style={{ border: 'none', padding: '12px 0 0' }}>
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <select className="form-control" value={medSelect} onChange={e => setMedSelect(e.target.value)} style={{ flex: 1 }}>
                                                                    <option value="" disabled>Select Medicine to Add...</option>
                                                                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                                </select>
                                                                <button type="button" className="btn btn-outline" style={{ color: 'var(--teal-primary)', borderColor: 'var(--teal-primary)' }} onClick={handleAddMedicine}>
                                                                    <Plus size={16} /> Add Medicine
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div style={{ background: 'var(--teal-light)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--teal-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Note: Please take medicines after food. Complete the full course.</span>
                                                <button className="btn btn-primary" onClick={handlePrescribe}>Save Prescription</button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
                                        No patients in queue.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </>
                    )}
                </div>
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

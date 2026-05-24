import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { logout } from '../services/auth';
import { Activity, LayoutDashboard, Users, Calendar, UserCheck, Pill, CreditCard, BarChart2, Package, MessageSquare, Settings, Search, Bell, Filter, Download, Plus, Shield, List, ActivitySquare, MoreVertical, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { APP_CONFIG } from '../config';

export default function AdminDashboard() {
    const { profile } = useAuth();
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        prescriptions: 0
    });

    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        document.body.classList.add('theme-admin');
        loadData();
        return () => document.body.classList.remove('theme-admin');
    }, []);

    const loadData = async () => {
        try {
            const [usersData, appsData, presData] = await Promise.all([
                fetchAPI('/users'),
                fetchAPI('/appointments'),
                fetchAPI('/prescriptions')
            ]);

            setUsers(usersData);
            setAppointments(appsData);
            setPrescriptions(presData);
            setStats({
                patients: usersData.filter(u => u.role === 'patient').length,
                doctors: usersData.filter(u => u.role === 'doctor').length,
                appointments: appsData.length,
                prescriptions: presData.length
            });
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveSection(id)}
            className={`sidebar-btn ${activeSection === id ? 'active' : ''}`}
            style={{ 
                marginBottom: '4px', 
                color: activeSection === id ? '#fff' : 'var(--slate-400)',
                background: activeSection === id ? 'var(--sky-blue)' : 'transparent',
                padding: '12px 20px',
                borderRadius: '8px'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }) => (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={28} />
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 500, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: trendUp ? 'var(--success-color)' : 'var(--error-color)', marginTop: '8px', fontWeight: 500 }}>
                    {trendUp ? '↑' : '↓'} {trend} <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>from last month</span>
                </div>
            </div>
        </div>
    );

    const ActionButton = ({ icon: Icon, label, color }) => (
        <button style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', border: `1px solid ${color}40`, borderRadius: '8px', background: '#fff', color: color, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s' }}>
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="dashboard-layout">
            <div className="sidebar" style={{ background: 'var(--navy-dark)', color: 'var(--slate-400)', borderRight: 'none', padding: '24px 16px' }}>
                <div className="sidebar-logo" style={{ color: '#fff', justifyContent: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--sky-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={20} color="#fff" />
                    </div>
                    {APP_CONFIG.shortName}
                    <span style={{ fontSize: '0.65rem', position: 'absolute', top: '55px', opacity: 0.7 }}>{APP_CONFIG.adminTagline}</span>
                </div>
                
                <div className="sidebar-nav">
                    <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem id="patients" icon={Users} label="Patients" />
                    <SidebarItem id="appointments" icon={Calendar} label="Appointments" />
                    <SidebarItem id="doctors" icon={UserCheck} label="Doctors" />
                    <SidebarItem id="pharmacy" icon={Pill} label="Pharmacy" />
                    <SidebarItem id="billing" icon={CreditCard} label="Billing" />
                    <SidebarItem id="reports" icon={BarChart2} label="Reports & Analytics" />
                    <SidebarItem id="inventory" icon={Package} label="Inventory" />
                    <SidebarItem id="messages" icon={MessageSquare} label="Messages" />
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--navy-light)', borderRadius: '8px', marginTop: 'auto' }} onClick={() => { logout(); window.location.reload(); }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sky-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        AD
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Admin</div>
                        <div style={{ fontSize: '0.7rem' }}>Super Administrator</div>
                    </div>
                </div>
            </div>

            <div className="main-content" style={{ padding: 0, background: 'var(--slate-50)', display: 'flex', flexDirection: 'column' }}>
                {/* Top Header */}
                <div style={{ padding: '20px 32px', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 600, fontSize: '1.25rem' }}>
                        <Menu size={24} color="var(--slate-400)" />
                        Dashboard
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Search anything..." style={{ padding: '10px 16px 10px 40px', border: '1px solid var(--border-color)', borderRadius: '24px', width: '300px', fontSize: '0.9rem', background: 'var(--slate-50)' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="var(--slate-600)" />
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--error-color)', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sky-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AD</div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Admin <ChevronDown size={14} style={{ display: 'inline' }} /></span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
                    {activeSection === 'dashboard' && (
                        <>
                            {/* Stat Cards */}
                            <div className="grid-4" style={{ marginBottom: '24px' }}>
                        <StatCard title="Total Patients" value={stats.patients} trend="8.5%" trendUp={true} icon={Users} color="#3b82f6" />
                        <StatCard title="Appointments Today" value={stats.appointments} trend="12.4%" trendUp={true} icon={Calendar} color="#10b981" />
                        <StatCard title="Pharmacy Orders" value={stats.prescriptions} trend="3.2%" trendUp={false} icon={Pill} color="#8b5cf6" />
                        <StatCard title="Active Doctors" value={stats.doctors} trend="4.3%" trendUp={true} icon={UserCheck} color="#06b6d4" />
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <select className="form-control" style={{ width: '200px', padding: '10px 16px' }}><option>All Departments</option></select>
                            <select className="form-control" style={{ width: '200px', padding: '10px 16px' }}><option>All Doctors</option></select>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="text" className="form-control" value="May 14, 2026" readOnly style={{ width: '200px', padding: '10px 16px 10px 36px' }} />
                            </div>
                            <button className="btn btn-primary" style={{ background: 'var(--teal-primary)' }}><Filter size={16} /> Filter</button>
                        </div>
                        <button className="btn btn-outline"><Download size={16} /> Export</button>
                    </div>

                    <div style={{ display: 'flex', gap: '24px' }}>
                        {/* Recent Appointments Table */}
                        <div className="glass-card" style={{ flex: 2, padding: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Appointments</h3>
                                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--sky-blue)', fontWeight: 600, textDecoration: 'none' }}>View All</a>
                            </div>
                            
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>Patient Name</th>
                                        <th>Doctor</th>
                                        <th>Date & Time</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.slice(0, 5).map((app, idx) => (
                                        <tr key={app.id}>
                                            <td style={{ color: 'var(--slate-400)' }}>{idx + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--slate-200)' }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.patient.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>MRN: {app.patient_id.substring(0, 6)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--slate-200)' }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>Dr. {app.doctor.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Department</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500, color: 'var(--slate-700)' }}>{app.appointment_date}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{app.appointment_time}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${app.status === 'completed' ? 'completed' : app.status === 'scheduled' ? 'scheduled' : 'pending'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <MoreVertical size={16} color="var(--slate-400)" style={{ cursor: 'pointer' }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Showing 1 to 5 of {appointments.length} entries</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--teal-primary)', background: 'var(--teal-primary)', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>1</button>
                                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>2</button>
                                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: User Management */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>User Management</h3>
                                
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '12px' }}>Quick Actions</div>
                                <ActionButton icon={Plus} label="Add New User" color="#0ea5e9" />
                                <ActionButton icon={Shield} label="Manage Roles" color="#8b5cf6" />
                                <ActionButton icon={List} label="View All Users" color="#3b82f6" />
                                <ActionButton icon={ActivitySquare} label="Activity Logs" color="#ec4899" />
                                
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)', margin: '24px 0 12px' }}>User Summary</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--slate-800)' }}></div> <strong>Total Users</strong></div>
                                        <strong>{users.length}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9' }}></div> Doctors</div>
                                        <div>{stats.doctors}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Patients</div>
                                        <div>{stats.patients}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }}></div> Pharmacists</div>
                                        <div>{users.filter(u => u.role === 'pharmacy').length}</div>
                                    </div>
                                </div>

                                <a href="#" style={{ display: 'block', textAlign: 'right', marginTop: '20px', fontSize: '0.85rem', color: 'var(--sky-blue)', fontWeight: 600, textDecoration: 'none' }}>View All Users &gt;</a>
                            </div>
                        </div>
                    </div>
                        </>
                    )}

                    {activeSection === 'reports' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--slate-800)' }}>Power BI Analytics</h2>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>Comprehensive hospital insights and performance overview.</p>
                                </div>
                                <button className="btn btn-outline" style={{ color: 'var(--sky-blue)', borderColor: 'var(--sky-blue)' }}>
                                    Connect Power BI Account
                                </button>
                            </div>
                            
                            <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed var(--slate-300)' }}>
                                <BarChart2 size={64} color="var(--slate-300)" style={{ marginBottom: '16px' }} />
                                <h3 style={{ color: 'var(--slate-600)', marginBottom: '8px' }}>Power BI Dashboard Placeholder</h3>
                                <p style={{ color: 'var(--slate-500)', maxWidth: '500px', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
                                    When you create your free Power BI account and publish your report (like the one in your mockup), you will receive an "Embed Code". Paste that embed code here.
                                </p>
                                <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.85rem', width: '80%', textAlign: 'left' }}>
                                    <span style={{ color: '#ec4899' }}>&lt;iframe</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>title</span>=<span style={{ color: '#a3e635' }}>"Hospital Analytics"</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>width</span>=<span style={{ color: '#a3e635' }}>"100%"</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>height</span>=<span style={{ color: '#a3e635' }}>"100%"</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>src</span>=<span style={{ color: '#a3e635' }}>"https://app.powerbi.com/reportEmbed?reportId=YOUR_ID"</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>frameborder</span>=<span style={{ color: '#a3e635' }}>"0"</span> <br/>
                                    &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>allowFullScreen</span>=<span style={{ color: '#a3e635' }}>"true"</span><span style={{ color: '#ec4899' }}>&gt;</span><br/>
                                    <span style={{ color: '#ec4899' }}>&lt;/iframe&gt;</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

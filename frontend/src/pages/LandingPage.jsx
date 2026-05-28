import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Video, Stethoscope, ArrowRight, Bot, Pill } from 'lucide-react';
import { APP_CONFIG } from '../config';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-wrapper">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="logo" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Activity size={32} strokeWidth={2.5} color="var(--teal-primary)" />
                        <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--slate-800)', letterSpacing: '-0.5px' }}>
                            {APP_CONFIG.shortName}
                        </span>
                    </div>
                    <div className="nav-links">
                        <button className="btn btn-outline" style={{ border: 'none', fontWeight: 600 }} onClick={() => navigate('/auth', { state: { isLogin: true } })}>
                            Log In
                        </button>
                        <button className="btn btn-primary" style={{ borderRadius: '50px', padding: '10px 24px' }} onClick={() => navigate('/auth', { state: { isLogin: false } })}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="badge-pill">
                        ✨ Next Generation Hospital Management
                    </div>
                    <h1 className="hero-title">
                        Healthcare, <span className="text-gradient">reimagined</span> for everyone.
                    </h1>
                    <p className="hero-subtitle">
                        Experience seamless virtual consultations, AI-powered triage, and smart e-prescriptions all in one beautifully designed platform.
                    </p>
                    <div className="hero-cta">
                        <button className="btn btn-primary btn-large" style={{ borderRadius: '50px', padding: '16px 32px', fontSize: '1.1rem' }} onClick={() => navigate('/auth', { state: { isLogin: false } })}>
                            Book an Appointment <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <h2 className="section-title">Everything you need for modern care</h2>
                    <div className="features-grid">
                        <div className="feature-card glass-card">
                            <div className="feature-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                <Video size={28} />
                            </div>
                            <h3>Virtual Consultations</h3>
                            <p>Connect with top specialists from the comfort of your home with our secure, integrated HD video platform.</p>
                        </div>
                        <div className="feature-card glass-card">
                            <div className="feature-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                                <Bot size={28} />
                            </div>
                            <h3>AI Health Assistant</h3>
                            <p>Get instant answers to medical queries and triage guidance powered by Google Gemini AI, available 24/7.</p>
                        </div>
                        <div className="feature-card glass-card">
                            <div className="feature-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                <Pill size={28} />
                            </div>
                            <h3>Smart E-Prescriptions</h3>
                            <p>Doctors can securely transmit prescriptions to our in-house pharmacy with automated dosage calculations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="logo" style={{ filter: 'grayscale(1)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={24} />
                        <span style={{ fontWeight: 600 }}>{APP_CONFIG.hospitalName}</span>
                    </div>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                        &copy; {new Date().getFullYear()} {APP_CONFIG.hospitalName}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

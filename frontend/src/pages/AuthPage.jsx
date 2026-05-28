import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Activity, Loader } from 'lucide-react';
import { APP_CONFIG } from '../config';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
    const [error, setError] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('patient'); // Hidden by default if we just want patient reg, but keep for testing

    const navigate = useNavigate();
    const { profile } = useAuth();

    useEffect(() => {
        if (profile) {
            navigate(`/${profile.role}`);
        }
    }, [profile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsAuthLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                toast.success("Logged in successfully!");
            } else {
                await register(name, email, password, role);
                toast.success("Account created! Logging you in...");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAuthLoading(false);
        }
    };

    return (
        <div className="landing-hero">
            <div style={{ zIndex: 10, width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--teal-primary)', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <Activity size={32} strokeWidth={2.5} />
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{APP_CONFIG.shortName}</h1>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--teal-dark)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
                        Hospital
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '4px' }}>{APP_CONFIG.tagline}</p>
                </div>

                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '8px' }}>
                            {isLogin ? 'Welcome Back' : 'Create Patient Account'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
                            {isLogin ? 'Log in to access your dashboard.' : 'Fill in the details below to create your patient account.'}
                        </p>
                    </div>

                    {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name</label>
                                <input type="text" className="form-control" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Email</label>
                            <input type="email" className="form-control" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Role</label>
                                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="pharmacy">Pharmacy</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
                            <input type="password" className="form-control" placeholder={isLogin ? "Enter password" : "Create a password"} value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={isAuthLoading}>
                            {isAuthLoading && <Loader size={16} className="spinner" />}
                            {isLogin ? (isAuthLoading ? 'Logging in...' : 'Log In') : (isAuthLoading ? 'Registering...' : 'Register')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        {isLogin ? (
                            <span>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }} style={{ color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}>Register</a></span>
                        ) : (
                            <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }} style={{ color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}>Login</a></span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

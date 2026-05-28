import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { profile, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!profile) {
        return <Navigate to="/auth" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/auth" replace />;
    }
    
    return children;
};

function AppRoutes() {
    const location = useLocation();
    // Only show the floating chatbot on the landing page
    const showChatbot = location.pathname === '/';

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                <Route path="/patient" element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/doctor" element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/pharmacy" element={
                    <ProtectedRoute allowedRoles={['pharmacy']}>
                        <PharmacyDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
            
            {showChatbot && <ChatbotWidget />}
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;

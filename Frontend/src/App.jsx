import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const auth = useAuth();
    if (!auth || auth.loading) return null;
    const { user } = auth;
    
    if (!user) return <Navigate to="/login" />;
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

// This component decides which dashboard to show based on the user's role
const UnifiedDashboard = () => {
    const { user } = useAuth();
    
    switch (user?.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'STAFF':
            return <StaffDashboard />;
        case 'CUSTOMER':
        default:
            return <CustomerDashboard />;
    }
};

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <UnifiedDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </Router>
        </AuthProvider>
    );
}

export default App;

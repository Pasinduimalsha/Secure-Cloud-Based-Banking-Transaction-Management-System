import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.signup(formData);
            alert('Signup successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at bottom right, #1e1b4b, #0f172a)'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card" 
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        Join SecureBank
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Start your journey to secure transactions</p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid var(--error)',
                        borderRadius: '8px',
                        color: 'var(--error)',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                style={{ paddingLeft: '40px' }}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Register As
                        </label>
                        <div style={{ position: 'relative' }}>
                            <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 12px 12px 40px', 
                                    backgroundColor: 'var(--bg-main)', 
                                    color: 'white', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    appearance: 'none'
                                }}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="STAFF">Bank Staff</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Lock, Users, LogOut, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ users: 0, transactions: 0, alerts: 2 });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ color: 'var(--secondary)' }}>SecureBank</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ADMIN PORTAL</p>
                </div>
                <nav style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
                        <Shield size={20} />
                        <span>System Security</span>
                    </div>
                </nav>
                <button onClick={logout} style={{ color: 'var(--error)', background: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}><LogOut size={18}/> Logout</button>
            </aside>

            <main style={{ flex: 1, padding: '48px' }}>
                <header style={{ marginBottom: '48px' }}>
                    <h1>System Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time monitoring of bank infrastructure.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Users /></div>
                        <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Users</p><h2 style={{ fontSize: '1.8rem' }}>1,284</h2></div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><TrendingUp /></div>
                        <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Volume (24h)</p><h2 style={{ fontSize: '1.8rem' }}>$4.2M</h2></div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}><AlertTriangle /></div>
                        <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active Alerts</p><h2 style={{ fontSize: '1.8rem' }}>{stats.alerts}</h2></div>
                    </div>
                </div>

                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <Activity size={20} color="var(--primary)" />
                        <h3>Recent Security Events</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Login Detected</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IP: 192.168.1.10{i}</p>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2m ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

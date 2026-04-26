import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../services/api';
import { Users, Search, Check, X, Plus, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositData, setDepositData] = useState({ accountNumber: '', amount: '' });

    const loadAccounts = async () => {
        try {
            const data = await accountService.getAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAccounts(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await accountService.updateStatus(id, status);
            loadAccounts();
        } catch (err) { alert('Update failed'); }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            await transactionService.deposit(depositData.accountNumber, depositData.amount);
            setShowDepositModal(false);
            loadAccounts();
            alert('Deposit successful');
        } catch (err) { alert('Deposit failed'); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ color: 'var(--primary)' }}>SecureBank</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STAFF PORTAL</p>
                </div>
                <nav style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' }}>
                        <Users size={20} />
                        <span>Account Verifications</span>
                    </div>
                </nav>
                <button onClick={logout} style={{ color: 'var(--error)', background: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}><LogOut size={18}/> Logout</button>
            </aside>

            <main style={{ flex: 1, padding: '48px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px' }}>
                    <h1>Account Management</h1>
                    <button onClick={() => setShowDepositModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18}/> Process Deposit
                    </button>
                </header>

                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Search accounts..." style={{ paddingLeft: '40px' }} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>CUSTOMER</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>ACCOUNT NO.</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>BALANCE</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>STATUS</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}><Loader2 className="animate-spin" /></td></tr>
                            ) : accounts.filter(a => a.accountNumber.includes(searchTerm)).map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>{acc.userId}</td>
                                    <td style={{ padding: '16px' }}>{acc.accountNumber}</td>
                                    <td style={{ padding: '16px' }}>${acc.balance.toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>{acc.status}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        {acc.status === 'PENDING' && (
                                            <button onClick={() => updateStatus(acc.id, 'ACTIVE')} style={{ color: 'var(--success)', background: 'none', marginRight: '16px' }}><Check/></button>
                                        )}
                                        <button onClick={() => updateStatus(acc.id, 'SUSPENDED')} style={{ color: 'var(--error)', background: 'none' }}><X/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {showDepositModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-card" style={{ width: '400px' }}>
                        <h3>Manual Deposit</h3>
                        <form onSubmit={handleDeposit} style={{ marginTop: '20px' }}>
                            <input type="text" placeholder="Account Number" style={{ marginBottom: '16px' }} onChange={e => setDepositData({...depositData, accountNumber: e.target.value})} required />
                            <input type="number" placeholder="Amount" style={{ marginBottom: '24px' }} onChange={e => setDepositData({...depositData, amount: e.target.value})} required />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowDepositModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'white' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Deposit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;

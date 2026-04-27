import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../services/api';
import { Wallet, Send, User, Loader2, ArrowRightLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState({
        accountType: 'SAVINGS',
        initialBalance: '0'
    });
    const [transferData, setTransferData] = useState({
        senderAccountNumber: '',
        receiverAccountNumber: '',
        amount: '',
        description: '',
        requestKey: ''
    });

    const fetchAccounts = async () => {
        try {
            setError(null);
            const data = await accountService.getAccounts();
            // Data is now the direct array from the backend
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch accounts', err);
            setError(err.message || 'Could not load accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const requestKey = crypto.randomUUID();
            await transactionService.transfer({ ...transferData, requestKey });
            setShowTransferModal(false);
            fetchAccounts();
            alert('Transfer successful!');
        } catch (err) {
            alert('Transfer failed: ' + (err.message || 'Error occurred'));
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            await accountService.createAccount({
                ...createData,
                userId: user.email // Backend uses email as userId for customers
            });
            setShowCreateModal(false);
            fetchAccounts();
            alert('Account application submitted! It is now PENDING verification.');
        } catch (err) {
            alert('Failed to create account: ' + (err.message || 'Error occurred'));
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '48px' }}>
                    <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SecureBank</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CUSTOMER PORTAL</p>
                </div>
                <nav style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '8px' }}>
                        <Wallet size={20} />
                        <span style={{ fontWeight: '600' }}>My Accounts</span>
                    </div>
                </nav>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <User size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} style={{ color: 'var(--error)', fontSize: '0.9rem', background: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>Log Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manage your funds and transactions securely.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }}>
                            <Plus size={18} /> New Account
                        </button>
                        <button onClick={() => setShowTransferModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} />
                            Transfer Funds
                        </button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px' }}>
                            <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading your financial data...</p>
                        </div>
                    ) : error ? (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', border: '1px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
                            <p style={{ color: 'var(--error)' }}>{error}</p>
                            <button onClick={fetchAccounts} style={{ marginTop: '16px', background: 'none', color: 'var(--primary)', textDecoration: 'underline' }}>Try Again</button>
                        </div>
                    ) : accounts.length > 0 ? (
                        accounts.map(acc => (
                            <motion.div 
                                key={acc.id}
                                whileHover={{ scale: 1.02 }}
                                className="glass-card"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>{acc.accountNumber}</span>
                                    <span style={{ 
                                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', 
                                        backgroundColor: acc.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: acc.status === 'ACTIVE' ? 'var(--success)' : '#eab308'
                                    }}>
                                        {acc.status}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                    ${acc.balance.toLocaleString()}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available Balance</p>
                            </motion.div>
                        ))
                    ) : (
                        <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>You don't have any active accounts yet.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Transfer Modal */}
            <AnimatePresence>
                {showTransferModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
                            <h2 style={{ marginBottom: '24px' }}>Transfer Funds</h2>
                            <form onSubmit={handleTransfer}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>From Account</label>
                                    <select 
                                        value={transferData.senderAccountNumber}
                                        onChange={e => setTransferData({...transferData, senderAccountNumber: e.target.value})}
                                        style={{ width: '100%', background: 'var(--bg-main)', color: 'white', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(a => <option key={a.id} value={a.accountNumber}>{a.accountNumber} (${a.balance})</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>To Account (Number)</label>
                                    <input type="text" placeholder="ACC-XXXXX" onChange={e => setTransferData({...transferData, receiverAccountNumber: e.target.value})} required />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Amount</label>
                                    <input type="number" placeholder="0.00" onChange={e => setTransferData({...transferData, amount: e.target.value})} required />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowTransferModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'white' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Funds</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Account Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                            <h2 style={{ marginBottom: '24px' }}>Open New Account</h2>
                            <form onSubmit={handleCreateAccount}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Account Type</label>
                                    <select 
                                        value={createData.accountType}
                                        onChange={e => setCreateData({...createData, accountType: e.target.value})}
                                        style={{ width: '100%', background: 'var(--bg-main)', color: 'white', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    >
                                        <option value="SAVINGS">Savings Account</option>
                                        <option value="CHECKING">Checking Account</option>
                                        <option value="BUSINESS">Business Account</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Initial Deposit ($)</label>
                                    <input 
                                        type="number" 
                                        value={createData.initialBalance}
                                        onChange={e => setCreateData({...createData, initialBalance: e.target.value})}
                                        placeholder="0.00"
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'white' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Application</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDashboard;

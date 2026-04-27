import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService, notificationService } from '../services/api';
import { Wallet, Send, User, Loader2, ArrowRightLeft, Plus, Bell, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('accounts');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState({ accountType: 'SAVINGS', balance: '0' });
    const [transferData, setTransferData] = useState({ senderAccountNumber: '', receiverAccountNumber: '', amount: '', description: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'accounts') res = await accountService.getAccounts();
            else if (activeTab === 'transactions') res = await transactionService.getTransactions();
            else if (activeTab === 'notifications') res = await notificationService.getNotifications(user.email);
            
            setData(Array.isArray(res) ? res : res?.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to sync financial data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const requestKey = crypto.randomUUID();
            await transactionService.transfer({ ...transferData, requestKey });
            setShowTransferModal(false);
            setTransferData({ senderAccountNumber: '', receiverAccountNumber: '', amount: '', description: '' });
            fetchData();
            toast.success('Funds transferred successfully!');
        } catch (err) { toast.error('Transfer failed: ' + (err.message || 'Check balance')); }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            await accountService.createAccount({ ...createData, userId: user.email });
            setShowCreateModal(false);
            fetchData();
            toast.info('Application submitted for verification');
        } catch (err) { toast.error('Application failed'); }
    };

    const renderAccounts = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', padding: '24px' }}>
            {data.map(acc => (
                <motion.div key={acc.id} whileHover={{ scale: 1.02 }} className="glass-card" style={{ borderLeft: acc.status === 'ACTIVE' ? '4px solid var(--success)' : '4px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{acc.accountNumber}</span>
                        <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{acc.status}</span>
                    </div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>${acc.balance?.toLocaleString()}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available Funds ({acc.accountType})</p>
                </motion.div>
            ))}
        </div>
    );

    const renderTransactions = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '16px 24px' }}>TYPE</th>
                    <th style={{ padding: '16px 24px' }}>AMOUNT</th>
                    <th style={{ padding: '16px 24px' }}>DATE</th>
                    <th style={{ padding: '16px 24px' }}>STATUS</th>
                </tr>
            </thead>
            <tbody>
                {data.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>
                            <span className={`badge ${tx.type === 'TRANSFER' ? 'badge-info' : 'badge-success'}`}>{tx.type}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>${tx.amount?.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>{tx.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderNotifications = () => (
        <div style={{ padding: '24px' }}>
            {data.map((n, index) => (
                <div key={index} className="glass-card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>{n.title}</span>
                            <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>EMAIL SENT</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>{n.message}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '48px' }}>
                    <h2 className="gradient-text">SecureBank</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PERSONAL BANKING</p>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'accounts', label: 'My Accounts', icon: <Wallet size={20}/> },
                        { id: 'transactions', label: 'History', icon: <ArrowRightLeft size={20}/> },
                        { id: 'notifications', label: 'Alerts', icon: <Bell size={20}/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'none',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
                                border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontWeight: activeTab === tab.id ? '600' : '400' }}>{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} color="var(--primary)"/>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user?.email.split('@')[0]}</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>CUSTOMER</p>
                        </div>
                    </div>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ marginBottom: '8px' }}>Financial Overview</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manage your assets and move money instantly.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 20px', borderRadius: '10px', fontWeight: '600' }}>
                            Open Account
                        </button>
                        <button onClick={() => setShowTransferModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18}/> Transfer
                        </button>
                    </div>
                </header>

                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ minHeight: '400px' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--primary)"/>
                            </div>
                        ) : data.length === 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-muted)' }}>
                                No activity recorded yet.
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                                    {activeTab === 'accounts' && renderAccounts()}
                                    {activeTab === 'transactions' && renderTransactions()}
                                    {activeTab === 'notifications' && renderNotifications()}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showTransferModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '450px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3>Transfer Funds</h3>
                                <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleTransfer}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>From Account</label>
                                    <select required value={transferData.senderAccountNumber} onChange={e => setTransferData({...transferData, senderAccountNumber: e.target.value})}>
                                        <option value="">Select source</option>
                                        {data.filter(a => a.status === 'ACTIVE').map(a => <option key={a.id} value={a.accountNumber}>{a.accountNumber} (${a.balance})</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>To Account Number</label>
                                    <input type="text" placeholder="ACC-XXXXX" required onChange={e => setTransferData({...transferData, receiverAccountNumber: e.target.value})} />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Amount ($)</label>
                                    <input type="number" placeholder="0.00" required onChange={e => setTransferData({...transferData, amount: e.target.value})} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowTransferModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Funds</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
                {showCreateModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '400px' }}>
                            <h3>New Account Application</h3>
                            <form onSubmit={handleCreateAccount} style={{ marginTop: '20px' }}>
                                <select style={{ marginBottom: '16px' }} value={createData.accountType} onChange={e => setCreateData({...createData, accountType: e.target.value})}>
                                    <option value="SAVINGS">Savings</option>
                                    <option value="CHECKING">Checking</option>
                                </select>
                                <input type="number" placeholder="Initial Deposit" style={{ marginBottom: '24px' }} value={createData.balance} onChange={e => setCreateData({...createData, balance: e.target.value})} required />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit</button>
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService, auditService, notificationService } from '../services/api';
import { Users, Search, Check, X, Plus, LogOut, Loader2, ArrowRightLeft, FileText, Bell, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('operations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [depositData, setDepositData] = useState({ accountNumber: '', amount: '' });
    const [createData, setCreateData] = useState({ userId: '', accountType: 'SAVINGS', balance: '0' });

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'operations') res = await accountService.getAccounts();
            else if (activeTab === 'transactions') res = await transactionService.getTransactions();
            else if (activeTab === 'audit') res = await auditService.getLogs();
            else if (activeTab === 'notifications') res = await notificationService.getNotifications();
            
            setData(Array.isArray(res) ? res : res?.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to fetch operational data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const updateStatus = async (id, status) => {
        try {
            await accountService.updateStatus(id, status);
            fetchData();
            toast.success(`Account ${status.toLowerCase()} successfully!`);
        } catch (err) { toast.error(`Failed to ${status.toLowerCase()} account`); }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            await transactionService.deposit(depositData.accountNumber, depositData.amount);
            setShowDepositModal(false);
            setDepositData({ accountNumber: '', amount: '' });
            fetchData();
            toast.success('Deposit processed successfully');
        } catch (err) { toast.error('Deposit failed: ' + (err.message || 'Check account number')); }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            await accountService.createAccount(createData);
            setShowCreateModal(false);
            setCreateData({ userId: '', accountType: 'SAVINGS', balance: '0' });
            fetchData();
            toast.success('Account created successfully!');
        } catch (err) { toast.error('Creation failed: ' + (err.message || 'Check user ID')); }
    };

    const renderOperations = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '16px 24px' }}>CUSTOMER</th>
                    <th style={{ padding: '16px 24px' }}>ACCOUNT NO.</th>
                    <th style={{ padding: '16px 24px' }}>BALANCE</th>
                    <th style={{ padding: '16px 24px' }}>STATUS</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {data.filter(a => a.accountNumber?.includes(searchTerm) || a.userId?.includes(searchTerm)).map(acc => (
                    <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>{acc.userId}</td>
                        <td style={{ padding: '16px 24px' }}>{acc.accountNumber}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>${acc.balance?.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>
                            <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{acc.status}</span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                {acc.status === 'PENDING' && (
                                    <button onClick={() => updateStatus(acc.id, 'ACTIVE')} style={{ color: 'var(--success)', background: 'none' }}><Check size={18}/></button>
                                )}
                                <button onClick={() => updateStatus(acc.id, acc.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN')} style={{ color: 'var(--warning)', background: 'none' }}>
                                    <Activity size={18}/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTransactions = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '16px 24px' }}>ID</th>
                    <th style={{ padding: '16px 24px' }}>TYPE</th>
                    <th style={{ padding: '16px 24px' }}>AMOUNT</th>
                    <th style={{ padding: '16px 24px' }}>DATE</th>
                </tr>
            </thead>
            <tbody>
                {data.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>{tx.id}</td>
                        <td style={{ padding: '16px 24px' }}>
                            <span className={`badge ${tx.type === 'TRANSFER' ? 'badge-info' : 'badge-success'}`}>{tx.type}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>${tx.amount?.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderAudit = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '16px 24px' }}>USER</th>
                    <th style={{ padding: '16px 24px' }}>ACTION</th>
                    <th style={{ padding: '16px 24px' }}>TIMESTAMP</th>
                </tr>
            </thead>
            <tbody>
                {data.map((log, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>{log.userId}</td>
                        <td style={{ padding: '16px 24px' }}>{log.type}</td>
                        <td style={{ padding: '16px 24px' }}>{new Date(log.loggedAt).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderNotifications = () => (
        <div style={{ padding: '24px' }}>
            {data.map((n, index) => (
                <div key={index} className="glass-card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--info)' }}>
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
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STAFF PORTAL</p>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'operations', label: 'Operations', icon: <Users size={20}/> },
                        { id: 'transactions', label: 'Transactions', icon: <ArrowRightLeft size={20}/> },
                        { id: 'audit', label: 'Audit Logs', icon: <FileText size={20}/> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell size={20}/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px',
                                background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.1)' : 'none',
                                color: activeTab === tab.id ? 'var(--info)' : 'var(--text)',
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
                            <Activity size={20} color="var(--info)"/>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user?.email.split('@')[0]}</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BANK STAFF</p>
                        </div>
                    </div>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ marginBottom: '8px' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Operational oversight and customer service management.</p>
                    </div>
                    {activeTab === 'operations' && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: '1px solid var(--info)', color: 'var(--info)', padding: '10px 20px', borderRadius: '10px', fontWeight: '600' }}>
                                New Account
                            </button>
                            <button onClick={() => setShowDepositModal(true)} className="btn-primary">
                                Process Deposit
                            </button>
                        </div>
                    )}
                </header>

                <div className="glass-card" style={{ padding: 0 }}>
                    {activeTab === 'operations' && (
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" placeholder="Search customer records..." style={{ paddingLeft: '48px' }} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div style={{ minHeight: '400px' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--info)"/>
                            </div>
                        ) : data.length === 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-muted)' }}>
                                No active records found.
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'operations' && renderOperations()}
                                    {activeTab === 'transactions' && renderTransactions()}
                                    {activeTab === 'audit' && renderAudit()}
                                    {activeTab === 'notifications' && renderNotifications()}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showDepositModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '400px' }}>
                            <h3>Manual Deposit</h3>
                            <form onSubmit={handleDeposit} style={{ marginTop: '20px' }}>
                                <input type="text" placeholder="Account Number" style={{ marginBottom: '16px' }} value={depositData.accountNumber} onChange={e => setDepositData({...depositData, accountNumber: e.target.value})} required />
                                <input type="number" placeholder="Amount" style={{ marginBottom: '24px' }} value={depositData.amount} onChange={e => setDepositData({...depositData, amount: e.target.value})} required />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowDepositModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Deposit</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
                {showCreateModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '400px' }}>
                            <h3>Open Account</h3>
                            <form onSubmit={handleCreateAccount} style={{ marginTop: '20px' }}>
                                <input type="text" placeholder="Customer Email/ID" style={{ marginBottom: '16px' }} value={createData.userId} onChange={e => setCreateData({...createData, userId: e.target.value})} required />
                                <select style={{ marginBottom: '16px' }} value={createData.accountType} onChange={e => setCreateData({...createData, accountType: e.target.value})}>
                                    <option value="SAVINGS">Savings</option>
                                    <option value="CHECKING">Checking</option>
                                </select>
                                <input type="number" placeholder="Initial Balance" style={{ marginBottom: '24px' }} value={createData.balance} onChange={e => setCreateData({...createData, balance: e.target.value})} required />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffDashboard;

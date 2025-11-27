import React, { useState, useEffect } from 'react';
import { Transaction, Wallet, Category, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import LoginPage from './components/LoginPage';
import { getSpendingInsights } from './services/geminiService';
import { AuthService } from './services/authService';
import { Plus, Sparkles, AlertCircle, LogOut } from 'lucide-react';

// --- MOCK DATA (Rupees) - INITIALIZED TO ZERO ---
const MOCK_WALLETS: Wallet[] = [
  { id: '1', name: 'Main Checking', type: 'card', balance: 0, currency: 'INR', color: '#6366f1' },
  { id: '2', name: 'Cash', type: 'cash', balance: 0, currency: 'INR', color: '#10b981' },
  { id: '3', name: 'Savings', type: 'savings', balance: 0, currency: 'INR', color: '#f59e0b' },
];

const MOCK_TRANSACTIONS: Transaction[] = [];

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Global Display Currency
  const [displayCurrency, setDisplayCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    // Check for Auth Session
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // --- DATABASE SIMULATION (LocalStorage) ---
  useEffect(() => {
    // Load data from "DB" - Using v2 keys to ensure fresh start with 0 details
    const storedWallets = localStorage.getItem('app_wallets_v2');
    const storedTx = localStorage.getItem('app_transactions_v2');

    if (storedWallets) {
        setWallets(JSON.parse(storedWallets));
    } else {
        setWallets(MOCK_WALLETS);
    }

    if (storedTx) {
        setTransactions(JSON.parse(storedTx));
    } else {
        setTransactions(MOCK_TRANSACTIONS);
    }
  }, []);

  // Persist data when changed
  useEffect(() => {
    if (wallets.length > 0) localStorage.setItem('app_wallets_v2', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('app_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);


  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Update wallet balance locally
    setWallets(prev => prev.map(w => {
      if (w.id === newTx.walletId) {
        // If wallet currency matches transaction currency, direct add. 
        // If mismatch, simplified conversion for demo: 1 USD = 83 INR
        let amountToAdd = newTx.amount;
        if (w.currency === 'INR' && newTx.currency === 'USD') amountToAdd = newTx.amount * 83;
        if (w.currency === 'USD' && newTx.currency === 'INR') amountToAdd = newTx.amount / 83;

        const change = newTx.type === 'income' ? amountToAdd : -amountToAdd;
        return { ...w, balance: w.balance + change };
      }
      return w;
    }));
  };

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    try {
        const text = await getSpendingInsights(transactions);
        setAiInsights(text);
    } catch (e) {
        setAiInsights("Failed to generate insights. Check your connection or try again later.");
    } finally {
        setIsLoadingInsights(false);
    }
  };

  // Convert transactions for dashboard display if needed
  const convertedTransactions = transactions.map(t => {
     if (t.currency === displayCurrency) return t;
     const rate = displayCurrency === 'INR' ? 83 : 1/83;
     return { ...t, amount: t.amount * rate, currency: displayCurrency };
  });
  
  // Convert wallets for display
  const convertedWallets = wallets.map(w => {
     if (w.currency === displayCurrency) return w;
     const rate = displayCurrency === 'INR' ? 83 : 1/83;
     return { ...w, balance: w.balance * rate, currency: displayCurrency };
  });

  // --- RENDER HELPERS ---
  
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userEmail={user.email}
        userName={user.name}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
      />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen custom-scrollbar">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {activeTab === 'dashboard' && 'Financial Overview'}
                    {activeTab === 'wallets' && 'My Wallets'}
                    {activeTab === 'transactions' && 'Transaction History'}
                    {activeTab === 'insights' && 'AI Financial Advisor'}
                </h1>
                <p className="text-slate-400 text-sm mt-1">SpendWiser</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleLogout}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 border border-slate-700 transition-all"
                >
                    <LogOut size={20} />
                    <span className="hidden md:inline">Logout</span>
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline">Add Transaction</span>
                </button>
            </div>
        </header>

        {activeTab === 'dashboard' && (
            <Dashboard 
                transactions={convertedTransactions} 
                wallets={convertedWallets} 
                onSearch={setSearchQuery} 
                searchQuery={searchQuery} 
            />
        )}

        {activeTab === 'wallets' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {convertedWallets.map(wallet => (
                    <div key={wallet.id} className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/5 rounded-bl-full z-0" style={{backgroundColor: `${wallet.color}15`}}></div>
                        <div className="relative z-10">
                            <p className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-xs">{wallet.type}</p>
                            <h3 className="text-xl font-bold text-white mb-4">{wallet.name}</h3>
                            <p className="text-3xl font-bold" style={{color: wallet.color}}>
                                {new Intl.NumberFormat(displayCurrency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(wallet.balance)}
                            </p>
                        </div>
                    </div>
                ))}
             </div>
        )}

        {activeTab === 'transactions' && (
            <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                    <input 
                        type="text" 
                        placeholder="Search specific transactions..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <div className="divide-y divide-slate-700">
                    {convertedTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p>No transactions yet. Add one to get started!</p>
                        </div>
                    ) : (
                        convertedTransactions
                            .filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(tx => (
                            <div key={tx.id} className="p-4 hover:bg-slate-700/50 flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                                        {tx.type === 'income' ? <Plus size={20} /> : <div className="h-0.5 w-4 bg-current" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{tx.description}</p>
                                        <p className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString() • {tx.category}}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat(displayCurrency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: displayCurrency }).format(tx.amount)}
                                </span>
                            </div>
                        ))
                    )}
                 </div>
            </div>
        )}

        {activeTab === 'insights' && (
             <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl border border-indigo-700/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                                <Sparkles size={24} className="text-indigo-300" />
                            </div>
                            <h2 className="text-2xl font-bold">Financial Analysis</h2>
                        </div>
                        <p className="text-indigo-200 mb-6">
                            Spend-Wiser to analyze your spending patterns and provide actionable advice to help you save more.
                        </p>
                        <button 
                            onClick={handleGenerateInsights}
                            disabled={isLoadingInsights || transactions.length === 0}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoadingInsights ? 'Analyzing...' : transactions.length === 0 ? 'Add Data to Analyze' : 'Generate New Insights'}
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                </div>

                {aiInsights && (
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 animate-fade-in">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-indigo-400"/>
                            Advisor Summary
                        </h3>
                        <div className="prose prose-invert prose-indigo text-slate-300 leading-relaxed">
                            {aiInsights}
                        </div>
                    </div>
                )}
             </div>
        )}
      </main>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addTransaction}
        wallets={wallets}
      />
    </div>
  );
};

export default App;

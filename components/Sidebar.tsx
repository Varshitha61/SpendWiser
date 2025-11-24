
import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, PieChart, Menu, X, Sparkles, RefreshCw } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  userEmail?: string;
  userName?: string;
  displayCurrency: 'INR' | 'USD';
  setDisplayCurrency: (currency: 'INR' | 'USD') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  userEmail,
  userName,
  displayCurrency,
  setDisplayCurrency
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const toggleCurrency = () => {
    setDisplayCurrency(displayCurrency === 'INR' ? 'USD' : 'INR');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-white text-lg">Spend-Wiser</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 bg-slate-800 border-r border-slate-700 w-64 transform transition-transform duration-200 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area (Desktop) */}
          <div className="hidden md:flex items-center gap-3 px-6 h-20 border-b border-slate-700">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Spend-Wiser</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Currency Toggle & User Profile */}
          <div className="p-4 border-t border-slate-700 space-y-4">
            
            {/* Currency Toggle */}
            <button 
              onClick={toggleCurrency}
              className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 flex items-center justify-between text-sm text-slate-300 transition-colors group"
            >
              <span className="flex items-center gap-2 px-2">
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500"/>
                Display Currency
              </span>
              <div className="flex bg-slate-800 rounded p-1">
                <span className={`px-2 rounded ${displayCurrency === 'INR' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>₹</span>
                <span className={`px-2 rounded ${displayCurrency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>$</span>
              </div>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 border border-slate-700">
              <div className="w-10 h-10 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center text-sm font-bold border border-indigo-700">
                {userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : 'U')}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{userName || (userEmail?.split('@')[0]) || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

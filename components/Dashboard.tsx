import React, { useMemo } from 'react';
import { Transaction, Wallet } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Search, FileText, IndianRupee } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onSearch: (query: string) => void;
  searchQuery: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, wallets, onSearch, searchQuery }) => {
  
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const balance = income - expense;
    
    // Group by category for Pie Chart
    const categoryData: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    
    const pieData = Object.keys(categoryData).map(key => ({
      name: key,
      value: categoryData[key]
    }));

    return { income, expense, balance, pieData };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery]);

  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 sticky top-0 z-20">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input 
                type="text" 
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-white">
            <IndianRupee size={100} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(stats.balance)}</h3>
          <div className="mt-4 flex items-center text-xs text-slate-400 bg-slate-700 w-fit px-2 py-1 rounded-full border border-slate-600">
            <span> across {wallets.length} wallets</span>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 group hover:border-green-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Income</p>
                <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.income)}</h3>
            </div>
            <div className="bg-emerald-900/30 p-2 rounded-lg text-emerald-400 border border-emerald-900/50">
                <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-500 flex items-center">
             <ArrowUpRight size={14} className="mr-1" /> 0% from last month
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 group hover:border-red-500/30 transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.expense)}</h3>
                </div>
                <div className="bg-rose-900/30 p-2 rounded-lg text-rose-400 border border-rose-900/50">
                    <TrendingDown size={24} />
                </div>
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500 flex items-center">
                <ArrowDownRight size={14} className="mr-1" /> 0% from last month
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Area */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
             <h4 className="text-lg font-bold text-white mb-6">Spending Analysis</h4>
             <div className="h-64 w-full">
                 {stats.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.pieData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} interval={0} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip 
                                cursor={{fill: '#334155'}}
                                contentStyle={{borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff'}}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <p>No expenses to analyze yet</p>
                    </div>
                 )}
             </div>
          </div>

          {/* Mini Transaction List */}
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col h-[400px]">
             <h4 className="text-lg font-bold text-white mb-4">Recent Transactions</h4>
             <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No transactions found</div>
                ) : filteredTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between group p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                                {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white truncate max-w-[120px]">{tx.description}</p>
                                <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                             </p>
                             {tx.receiptUrl && <FileText size={12} className="ml-auto text-indigo-400 mt-1" />}
                        </div>
                    </div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
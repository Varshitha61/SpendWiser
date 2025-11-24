import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, Receipt, Check } from 'lucide-react';
import { Category, Transaction, Wallet } from '../types';
import { analyzeReceiptImage } from '../services/geminiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  wallets: Wallet[];
  initialData?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, wallets, initialData }) => {
  const [amount, setAmount] = useState<string>(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<string>(initialData?.category || Category.FOOD);
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [walletId, setWalletId] = useState<string>(initialData?.walletId || wallets[0]?.id || '');
  const [date, setDate] = useState<string>(initialData?.date.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<string>(initialData?.currency || 'INR');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(initialData?.receiptUrl || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setReceiptPreview(base64String);
      
      // Auto-analyze
      setIsAnalyzing(true);
      try {
        const result = await analyzeReceiptImage(base64String);
        if (result.amount) setAmount(result.amount.toString());
        if (result.category) setCategory(result.category);
        if (result.description || result.merchant) setDescription(result.description || result.merchant);
        if (result.date) {
            const parsedDate = new Date(result.date);
            if(!isNaN(parsedDate.getTime())) {
                setDate(parsedDate.toISOString().split('T')[0]);
            }
        }
        setType('expense');
        if (result.currency) setCurrency(result.currency);
      } catch (error) {
        console.error("Analysis failed", error);
        alert("Could not analyze receipt automatically. Please enter details manually.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !walletId) return;

    onSave({
      amount: parseFloat(amount),
      description,
      category,
      type,
      walletId,
      date: new Date(date).toISOString(),
      receiptUrl: receiptPreview || undefined,
      currency
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh] border border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Receipt Uploader */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                           <Receipt size={16} className="text-indigo-400"/>
                           Scan Receipt (AI Auto-Fill)
                        </label>
                        <p className="text-xs text-slate-500 mt-1">Scan an image </p>
                    </div>
                    {isAnalyzing && (
                        <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                            <Loader2 size={16} className="animate-spin"/> Analyzing...
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group"
                    >
                         <Camera size={24} className="text-slate-400 group-hover:text-indigo-400"/>
                         <span className="text-sm text-slate-400 group-hover:text-white">Take Photo / Upload</span>
                    </button>
                    {receiptPreview && (
                        <div className="w-24 h-24 rounded-xl bg-slate-800 border border-slate-600 relative overflow-hidden group">
                            <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover"/>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setReceiptPreview(null); }}
                                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <X size={12} />
                             </button>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <form id="txForm" onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Income
                    </button>
                </div>

                {/* Amount & Currency */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 px-3 bg-slate-700 rounded-l-lg flex items-center border border-slate-600 border-r-0">
                             <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer"
                             >
                                 <option value="INR">INR</option>
                                 <option value="USD">USD</option>
                             </select>
                        </div>
                        <input 
                            type="number" 
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-20 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-lg font-bold placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Grocery shopping"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            {Object.values(Category).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Wallet Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Wallet / Account</label>
                     <select 
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>
                            ))}
                    </select>
                </div>
            </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit"
                form="txForm"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-900/40 transition-all transform active:scale-95 flex items-center gap-2"
            >
                <Check size={20} />
                Save Transaction
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;

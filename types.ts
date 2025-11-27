
export type TransactionType = 'income' | 'expense';

export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  HOUSING = 'Housing',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  SALARY = 'Salary',
  INVESTMENT = 'Investment',
  OTHER = 'Other',
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'savings';
  balance: number; // Current calculated balance
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  date: string; // ISO String
  description: string;
  walletId: string;
  receiptUrl?: string; // In a real app, this is a URL. Here we might store base64 for demo
  receiptMerchant?: string;
  currency: string; // 'INR' | 'USD'
}

export interface ReceiptAnalysisResult {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  currency?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

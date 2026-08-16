import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Currency } from '../../types';

interface SummaryCardsProps {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    currentNetBalance: number;
    expenseRatio: number;
    savingsAmount: number;
    savingsGoal: number;
  };
  currency: Currency;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, currency }) => {
  const isNetBalancePositive = summary.currentNetBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {/* Total Income */}
      <div className="p-6 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.totalIncome, currency)}
          </p>
          <p className="text-xs text-emerald-400 mt-1 font-medium">Selected Month</p>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="p-6 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.totalExpenses, currency)}
          </p>
          <p className="text-xs text-rose-400 mt-1 font-medium">Selected Month</p>
        </div>
      </div>

      {/* Current Net Balance (PROMINENT MAIN CARD) */}
      <div className="sm:col-span-2 lg:col-span-1 p-6 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-glow-brand relative overflow-hidden group transform hover:-translate-y-1 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Current Net Balance</span>
          <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-glow-brand">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className={`text-3xl font-extrabold tracking-tight ${isNetBalancePositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(summary.currentNetBalance, currency)}
          </p>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Income − Expenses (Auto-updates live)
          </p>
        </div>
      </div>

      {/* Savings */}
      <div className="p-6 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings</span>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.savingsAmount, currency)}
          </p>
          <p className="text-xs text-purple-400 mt-1 font-medium">Net Savings Margin</p>
        </div>
      </div>

      {/* Expense Ratio */}
      <div className="p-6 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Ratio</span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {summary.expenseRatio}%
          </p>
          <p className="text-xs text-amber-400 mt-1 font-medium">
            {summary.expenseRatio > 70 ? '⚠️ High Outflow' : 'Healthy Spend Ratio'}
          </p>
        </div>
      </div>
    </div>
  );
};

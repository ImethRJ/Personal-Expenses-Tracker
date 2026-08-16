import React, { useState } from 'react';
import { Settings, Save, User as UserIcon, DollarSign, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Currency } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, updateUserCurrency } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState<Currency>(user?.currency || 'LKR');
  const [savingsGoal, setSavingsGoal] = useState<string>(user?.savingsGoal?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage('');
      await updateProfile(name, parseFloat(savingsGoal) || 0);
      await updateUserCurrency(currency);
      setMessage('Profile settings saved successfully!');
    } catch (err: any) {
      setMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
          Account & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Customize your preferred currency, savings goal, and profile</p>
      </div>

      <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address (Protected)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed text-base sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Preferred Currency *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
              >
                <option value="LKR">LKR (Sri Lankan Rupees - Rs.)</option>
                <option value="USD">USD (US Dollars - $)</option>
                <option value="EUR">EUR (Euros - €)</option>
                <option value="GBP">GBP (British Pounds - £)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Monthly Savings Target Goal
            </label>
            <div className="relative">
              <Target className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                placeholder="e.g. 500.00"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-glow-brand active:scale-95 transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


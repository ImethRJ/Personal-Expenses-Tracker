import React from 'react';
import { Calendar, DollarSign, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFilter } from '../../context/FilterContext';
import { Currency } from '../../types';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = [2024, 2025, 2026, 2027];

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, updateUserCurrency } = useAuth();
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useFilter();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUserCurrency(e.target.value as Currency);
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center justify-between xs:justify-start gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden active:scale-95 transition-all"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Overview</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Track and optimize your financial balance</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 self-end xs:self-auto w-full xs:w-auto justify-between xs:justify-end">
        {/* Month & Year Filter Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium">
          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs sm:text-sm"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer border-l border-slate-700 pl-1.5 sm:pl-2 text-xs sm:text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium">
          <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={user?.currency || 'LKR'}
            onChange={handleCurrencyChange}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs sm:text-sm"
          >
            <option value="LKR" className="bg-slate-900 text-white">LKR (Rs.)</option>
            <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
            <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
            <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
          </select>
        </div>
      </div>
    </header>
  );
};


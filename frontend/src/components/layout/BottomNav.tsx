import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  onOpenSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenSidebar }) => {
  const mainNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { label: 'Income', path: '/incomes', icon: TrendingUp },
    { label: 'Expense', path: '/expenses', icon: TrendingDown },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-bottom shadow-2xl">
      <nav className="flex items-center justify-around">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-indigo-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium tracking-tight truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={onOpenSidebar}
          type="button"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">Menu</span>
        </button>
      </nav>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Budget, Currency } from '../../types';

interface BudgetProgressBarProps {
  budgets: Budget[];
  currency: Currency;
  onDelete: (id: string) => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ budgets, currency, onDelete }) => {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
        <h4 className="text-base font-semibold text-white">No budgets configured</h4>
        <p className="text-sm text-slate-400 mt-1">Set monthly category spending caps to keep expenses under control.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {budgets.map((b) => {
        const progressColor = b.isExceeded
          ? 'bg-rose-500 shadow-glow-red'
          : b.percentage >= 80
          ? 'bg-amber-500'
          : 'bg-indigo-500 shadow-glow-brand';

        return (
          <div
            key={b.id}
            className={`p-4 sm:p-5 bg-slate-900/90 border rounded-2xl shadow-lg relative ${
              b.isExceeded ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.category.color }}
                />
                <h4 className="font-bold text-white text-base truncate max-w-[140px] sm:max-w-none">{b.category.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                {b.isExceeded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    + {formatCurrency(b.exceededAmount, currency)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    {b.percentage}% Used
                  </span>
                )}
                <button
                  onClick={() => onDelete(b.id)}
                  title="Remove Budget Target"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>


            <div className="flex items-baseline justify-between text-sm my-2">
              <span className="text-slate-400 font-medium">
                Spent: <strong className="text-white">{formatCurrency(b.spentAmount, currency)}</strong>
              </span>
              <span className="text-slate-400 font-medium">
                Target: <strong className="text-white">{formatCurrency(b.budgetAmount, currency)}</strong>
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mt-3 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(100, b.percentage)}%` }}
              />
            </div>

            {/* Over Budget Banner */}
            {b.isExceeded && (
              <p className="text-xs text-rose-400 mt-3 font-semibold flex items-center gap-1">
                ⚠️ You have exceeded your {b.category.name} budget by {formatCurrency(b.exceededAmount, currency)}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

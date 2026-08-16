import React from 'react';
import { Edit2, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Currency, Subscription } from '../../types';
import { Badge } from '../common/Badge';

interface SubscriptionCardsProps {
  subscriptions: Subscription[];
  currency: Currency;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export const SubscriptionCards: React.FC<SubscriptionCardsProps> = ({
  subscriptions,
  currency,
  onEdit,
  onDelete,
}) => {
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
        <RefreshCw className="w-8 h-8 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-white">No active subscriptions</h4>
        <p className="text-sm text-slate-400 mt-1">Keep track of Netflix, Spotify, AWS, GitHub, etc.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-lg relative flex flex-col justify-between group hover:border-indigo-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-base tracking-tight">{sub.name}</h3>
              <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'PAUSED' ? 'warning' : 'expense'}>
                {sub.status}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-2xl font-extrabold text-white">
                {formatCurrency(sub.amount, currency)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/{sub.billingCycle.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Next renewal: <span className="text-slate-200 font-medium">{formatDate(sub.nextPaymentDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <button
              onClick={() => onEdit(sub)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(sub)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

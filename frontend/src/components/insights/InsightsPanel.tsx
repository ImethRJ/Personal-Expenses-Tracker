import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertCircle, Utensils, Smartphone, Lightbulb } from 'lucide-react';
import { FinancialInsight } from '../../types';

interface InsightsPanelProps {
  insights: FinancialInsight[];
}

const iconMap: Record<string, any> = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'target': Target,
  'alert-circle': AlertCircle,
  'utensils': Utensils,
  'smartphone': Smartphone,
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <div className="space-y-4">
      {insights.map((item) => {
        const IconComponent = iconMap[item.icon] || Lightbulb;
        const styles = {
          warning: 'border-amber-500/30 bg-amber-950/10 text-amber-300',
          success: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-300',
          info: 'border-indigo-500/30 bg-indigo-950/10 text-indigo-300',
          trend: 'border-purple-500/30 bg-purple-950/10 text-purple-300',
        }[item.type];

        return (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border backdrop-blur-sm shadow-md flex items-start gap-4 transition-all hover:scale-[1.01] ${styles}`}
          >
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

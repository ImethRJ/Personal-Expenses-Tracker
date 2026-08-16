import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Lightbulb, LineChart as LineIcon } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { IncomeExpenseBarChart } from '../components/dashboard/IncomeExpenseBarChart';
import { BalanceTrendLineChart } from '../components/dashboard/BalanceTrendLineChart';
import { ExpenseDonutChart } from '../components/dashboard/ExpenseDonutChart';
import { InsightsPanel } from '../components/insights/InsightsPanel';

export const AnalyticsPage: React.FC = () => {
  const { selectedMonth, selectedYear } = useFilter();
  const { user } = useAuth();

  const { data: trendData = [] } = useQuery({
    queryKey: ['analytics-monthly-trend'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/monthly?months=6');
      return res.data;
    },
  });

  const { data: categoryData = [] } = useQuery({
    queryKey: ['analytics-categories', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/categories?month=${selectedMonth}&year=${selectedYear}`);
      return res.data;
    },
  });

  const { data: insightsData = [] } = useQuery({
    queryKey: ['analytics-insights', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/insights?month=${selectedMonth}&year=${selectedYear}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-400" />
          Financial Analytics & AI Insights
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Deep analytical insights derived from actual transaction history</p>
      </div>

      {/* Financial Insights Banner */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Automated Financial Observations
        </h3>
        <InsightsPanel insights={insightsData} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Net Balance Trend Line Chart */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-indigo-400" />
            Net Balance Trend (6 Months)
          </h3>
          <BalanceTrendLineChart data={trendData} currency={user?.currency || 'LKR'} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Category Outflow Ratio</h3>
          <ExpenseDonutChart data={categoryData} currency={user?.currency || 'LKR'} />
        </div>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Historical Income vs Expense Comparison</h3>
        <IncomeExpenseBarChart data={trendData} currency={user?.currency || 'LKR'} />
      </div>
    </div>
  );
};

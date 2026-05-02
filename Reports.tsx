import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface CategoryData {
  category: string;
  income: number;
  expenses: number;
  count: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface SummaryData {
  monthly: MonthlyData[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    netOutgo: number;
  };
}

export default function Reports() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, summaryRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/summary')
        ]);
        
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData);
        }
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const totalExpenses = categories.reduce((sum, c) => sum + c.expenses, 0);
  const totalIncome = categories.reduce((sum, c) => sum + c.income, 0);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Detailed analysis of your finances</p>
      </div>

      {/* Monthly Trend */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Monthly Trend</h2>
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>

        {summary?.monthly && summary.monthly.length > 0 ? (
          <div className="space-y-3">
            {summary.monthly.map((month) => {
              const maxAmount = Math.max(
                ...summary.monthly.map(m => Math.max(m.income, m.expenses))
              );
              
              return (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-400">{formatMonth(month.month)}</div>
                  <div className="flex-1 h-8 bg-slate-700/30 rounded-lg overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-2"
                      style={{ width: `${(month.income / maxAmount) * 100}%` }}
                    >
                      {month.income > 0 && (
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(month.income)}
                        </span>
                      )}
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-400 flex items-center justify-start pl-2"
                      style={{ width: `${(month.expenses / maxAmount) * 100}%` }}
                    >
                      {month.expenses > 0 && (
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(month.expenses)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <span className={`text-sm font-medium ${month.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No data available for reports</p>
          </div>
        )}

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-sm text-slate-400">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded" />
            <span className="text-sm text-slate-400">Expenses</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Expense Categories</h2>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>

          {categories.filter(c => c.expenses > 0).length > 0 ? (
            <div className="space-y-3">
              {categories
                .filter(c => c.expenses > 0)
                .sort((a, b) => b.expenses - a.expenses)
                .map((cat) => {
                  const percentage = (cat.expenses / totalExpenses) * 100;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300">{cat.category}</span>
                        <span className="text-white font-medium">{formatCurrency(cat.expenses)}</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {percentage.toFixed(1)}% • {cat.count} transactions
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No expense data</p>
            </div>
          )}
        </div>

        {/* Income Categories */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Income Categories</h2>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          {categories.filter(c => c.income > 0).length > 0 ? (
            <div className="space-y-3">
              {categories
                .filter(c => c.income > 0)
                .sort((a, b) => b.income - a.income)
                .map((cat) => {
                  const percentage = (cat.income / totalIncome) * 100;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300">{cat.category}</span>
                        <span className="text-white font-medium">{formatCurrency(cat.income)}</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {percentage.toFixed(1)}% • {cat.count} transactions
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No income data</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-1">Average Monthly Income</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(summary.totals.totalIncome / Math.max(summary.monthly.length, 1))}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-1">Average Monthly Expenses</p>
            <p className="text-2xl font-bold text-rose-400">
              {formatCurrency(summary.totals.totalExpenses / Math.max(summary.monthly.length, 1))}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-1">Average Monthly Net</p>
            <p className={`text-2xl font-bold ${
              (summary.totals.netOutgo / Math.max(summary.monthly.length, 1)) >= 0 
                ? 'text-emerald-400' 
                : 'text-rose-400'
            }`}>
              {formatCurrency(summary.totals.netOutgo / Math.max(summary.monthly.length, 1))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
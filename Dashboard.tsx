import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  RefreshCw
} from 'lucide-react';

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

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  source: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch('/api/summary'),
        fetch('/api/transactions?limit=5')
      ]);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setRecentTransactions(transactionsData.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your financial activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Income</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totals.totalIncome || 0)}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-400" />
            </div>
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totals.totalExpenses || 0)}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Net Outgo</p>
          <p className={`text-2xl font-bold ${(summary?.totals.netOutgo || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(summary?.totals.netOutgo || 0)}
          </p>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Summary */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Monthly Summary</h2>
            <Calendar className="w-5 h-5 text-slate-500" />
          </div>
          
          {summary?.monthly && summary.monthly.length > 0 ? (
            <div className="space-y-4">
              {summary.monthly.slice(-6).map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-400">{formatMonth(month.month)}</div>
                  <div className="flex-1">
                    <div className="flex gap-2 h-6">
                      <div 
                        className="bg-emerald-500/60 rounded"
                        style={{ width: `${(month.income / (month.income + month.expenses)) * 100}%` }}
                      />
                      <div 
                        className="bg-rose-500/60 rounded"
                        style={{ width: `${(month.expenses / (month.income + month.expenses)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm">
                    <span className={month.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatCurrency(month.net)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No data yet. Add some transactions!</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <a href="/transactions" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all
            </a>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{tx.description}</p>
                    <p className="text-slate-500 text-sm">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-slate-500 text-xs">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Edit3,
  X,
  RefreshCw
} from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  source: string;
}

const categories = [
  'Salary', 'Freelance', 'Investment', 'Other Income',
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
];

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/api/transactions?';
      if (filterType !== 'all') url += `type=${filterType}&`;
      if (filterCategory) url += `category=${filterCategory}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      source: 'manual'
    };

    try {
      if (editingTransaction) {
        const res = await fetch('/api/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTransaction.id, ...payload })
        });
        if (res.ok) {
          fetchTransactions();
          closeModal();
        }
      } else {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchTransactions();
          closeModal();
        }
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount.toString(),
      description: tx.description,
      category: tx.category,
      date: tx.date
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(search.toLowerCase()) ||
    tx.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-slate-400">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors">
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
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 bg-slate-700 rounded text-xs">{tx.source}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(tx)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    formData.type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  Income
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="What was this for?"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
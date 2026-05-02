import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  Mail, 
  BarChart3,
  TrendingDown,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/upload', icon: Upload, label: 'Import Files' },
  { to: '/email', icon: Mail, label: 'Email Connect' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">ExpenseFlow</h1>
                <p className="text-xs text-slate-500">Track & Analyze</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-4 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-xs text-slate-400 mb-1">Pro Tip</p>
            <p className="text-sm text-slate-300">Upload CSV or Excel files to bulk import transactions</p>
          </div>
        </div>
      </aside>
    </>
  );
}
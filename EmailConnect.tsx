import { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Unlink,
  Shield,
  Zap
} from 'lucide-react';

interface EmailStatus {
  connected: boolean;
  email: string | null;
  lastSync: string | null;
}

export default function EmailConnect() {
  const [status, setStatus] = useState<EmailStatus>({ connected: false, email: null, lastSync: null });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [email, setEmail] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/email');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch email status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    if (!email) return;
    
    setConnecting(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, provider: 'gmail' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setStatus({ connected: true, email: data.email, lastSync: new Date().toISOString() });
        setEmail('');
      }
    } catch (err) {
      console.error('Failed to connect email:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your email?')) return;
    
    // In a real app, this would revoke OAuth tokens
    setStatus({ connected: false, email: null, lastSync: null });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Email Connect</h1>
        <p className="text-slate-400">Connect your email to automatically import transactions</p>
      </div>

      <div className="max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : status.connected ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">Email Connected</h2>
                <p className="text-slate-400">{status.email}</p>
                {status.lastSync && (
                  <p className="text-slate-500 text-sm mt-2">
                    Last synced: {new Date(status.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors flex items-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-slate-300 text-sm">
                Your email is being monitored for transaction receipts. New transactions will be automatically imported and categorized.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Connect Your Email</h2>
                <p className="text-slate-400">Automatically import transactions from email receipts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConnect}
                  disabled={!email || connecting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Connect Gmail
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
            <Shield className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Secure Connection</h3>
            <p className="text-slate-400 text-sm">Your data is encrypted and we only read transaction-related emails</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
            <Zap className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-white font-medium mb-1">Auto Import</h3>
            <p className="text-slate-400 text-sm">Transactions are automatically categorized and added to your dashboard</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">Demo Mode</p>
              <p className="text-slate-400 text-sm mt-1">
                This is a demo implementation. In production, this would connect to Gmail, Outlook, or other email providers via OAuth for secure access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
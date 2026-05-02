import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Return email connection status
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      res.status(200).json({ 
        connected: !!data,
        email: data?.email || null,
        lastSync: data?.last_sync || null
      });
    }
    
    if (req.method === 'POST') {
      const { email, provider } = req.body;
      
      // In a real app, this would initiate OAuth flow
      // For demo purposes, we'll simulate a connection
      const { data, error } = await supabase
        .from('email_connections')
        .upsert({ 
          email, 
          provider: provider || 'gmail',
          connected: true,
          last_sync: new Date().toISOString()
        }, { onConflict: 'email' })
        .select()
        .single();
      
      if (error) throw error;
      
      // Simulate importing some transactions from email
      const simulatedTransactions = [
        { type: 'expense', amount: 12.99, description: 'Netflix Subscription', category: 'Entertainment', date: new Date().toISOString().split('T')[0], source: 'email' },
        { type: 'expense', amount: 45.00, description: 'Amazon Order', category: 'Shopping', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], source: 'email' },
        { type: 'expense', amount: 8.99, description: 'Spotify Premium', category: 'Entertainment', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], source: 'email' },
      ];
      
      await supabase.from('transactions').insert(simulatedTransactions);
      
      res.status(200).json({ 
        message: 'Email connected successfully',
        email: data.email,
        importedCount: simulatedTransactions.length
      });
    }
    
  } catch (err) {
    console.error('Email API error:', err);
    res.status(500).json({ error: err.message });
  }
}
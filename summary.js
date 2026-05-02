import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Aggregate by month
    const monthlyData = {};
    
    data.forEach(tx => {
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (tx.type === 'income') {
        monthlyData[month].income += parseFloat(tx.amount);
      } else {
        monthlyData[month].expenses += parseFloat(tx.amount);
      }
      monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
    });
    
    // Convert to array and sort
    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        net: Math.round(data.net * 100) / 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate totals
    const totals = {
      totalIncome: result.reduce((sum, m) => sum + m.income, 0),
      totalExpenses: result.reduce((sum, m) => sum + m.expenses, 0),
      netOutgo: result.reduce((sum, m) => sum + m.net, 0)
    };
    
    res.status(200).json({ monthly: result, totals });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
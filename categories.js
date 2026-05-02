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
      .select('category, type, amount');
    
    if (error) throw error;
    
    // Aggregate by category
    const categoryData = {};
    
    data.forEach(tx => {
      if (!categoryData[tx.category]) {
        categoryData[tx.category] = { income: 0, expenses: 0, count: 0 };
      }
      
      if (tx.type === 'income') {
        categoryData[tx.category].income += parseFloat(tx.amount);
      } else {
        categoryData[tx.category].expenses += parseFloat(tx.amount);
      }
      categoryData[tx.category].count++;
    });
    
    const result = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        ...data,
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100
      }))
      .sort((a, b) => (b.expenses + b.income) - (a.expenses + a.income));
    
    res.status(200).json(result);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
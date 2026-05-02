import supabase from './_supabase.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple parser for CSV-like content
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const transactions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 4) {
      const date = parts[0];
      const description = parts[1];
      const amount = parseFloat(parts[2].replace(/[^0-9.-]/g, ''));
      const type = parts[3].toLowerCase().includes('income') ? 'income' : 'expense';
      const category = parts[4] || 'Other';
      
      if (date && !isNaN(amount)) {
        transactions.push({ date, description, amount, type, category, source: 'file' });
      }
    }
  }
  
  return transactions;
}

// Parse text content for transaction-like patterns
function parseTextContent(text, filename) {
  const transactions = [];
  const lines = text.split('\n');
  
  // Look for date patterns and amounts
  const datePattern = /(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/g;
  const amountPattern = /[$£€]?([\d,]+\.?\d*)/g;
  
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);
    
    if (dateMatch && amountMatch) {
      const date = dateMatch[0].replace(/\//g, '-');
      const amount = parseFloat(amountMatch[0].replace(/[$£€,]/g, ''));
      const description = line.replace(datePattern, '').replace(amountPattern, '').trim().substring(0, 100);
      
      if (!isNaN(amount) && amount > 0) {
        transactions.push({
          date,
          description: description || `Transaction from ${filename}`,
          amount,
          type: line.toLowerCase().includes('credit') || line.toLowerCase().includes('income') || line.toLowerCase().includes('deposit') ? 'income' : 'expense',
          category: 'Other',
          source: 'file'
        });
      }
    }
  }
  
  return transactions;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf-8');
    
    let transactions = [];
    const filename = req.headers['x-filename'] || 'uploaded file';
    
    // Try to parse as CSV first
    if (content.includes(',') && content.includes('\n')) {
      transactions = parseCSV(content);
    }
    
    // If CSV parsing didn't work, try general text parsing
    if (transactions.length === 0) {
      transactions = parseTextContent(content, filename);
    }
    
    if (transactions.length === 0) {
      return res.status(400).json({ 
        error: 'Could not parse any transactions from the file. Please ensure your file contains dates, amounts, and descriptions.',
        hint: 'Supported formats: CSV with columns (date, description, amount, type, category) or text files with date and amount patterns.'
      });
    }
    
    // Insert transactions into database
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      message: `Successfully imported ${data.length} transactions`,
      count: data.length,
      transactions: data
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
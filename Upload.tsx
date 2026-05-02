import { useState, useCallback } from 'react';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number; hint?: string } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setUploading(true);
    setResult(null);

    try {
      const content = await file.text();
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'X-Filename': file.name
        },
        body: content
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          count: data.count
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to process file'
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Failed to upload file. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const sampleCSV = `date,description,amount,type,category
2024-01-15,Grocery Shopping,85.50,expense,Food & Dining
2024-01-14,Salary Deposit,3500.00,income,Salary
2024-01-13,Electric Bill,120.00,expense,Bills & Utilities
2024-01-12,Gas Station,45.00,expense,Transportation
2024-01-10,Freelance Payment,500.00,income,Freelance
2024-01-09,Netflix Subscription,15.99,expense,Entertainment
2024-01-08,Coffee Shop,12.50,expense,Food & Dining`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Import Files</h1>
        <p className="text-slate-400">Upload CSV or Excel files to bulk import transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Upload File</h2>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${dragActive 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-slate-600 hover:border-slate-500'}
            `}
          >
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls,.pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-400">Processing file...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <UploadIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Drop your file here</p>
                  <p className="text-slate-500 text-sm">or click to browse</p>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Supports CSV, TXT, XLS, XLSX, PDF
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
              result.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-rose-500/10 border border-rose-500/30'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.message}
                </p>
                {result.hint && (
                  <p className="text-slate-400 text-sm mt-1">{result.hint}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions & Sample */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">File Format</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">CSV / Excel Files</p>
                  <p className="text-slate-400 text-sm">Columns: date, description, amount, type, category</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Text Files</p>
                  <p className="text-slate-400 text-sm">Will attempt to parse dates and amounts</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={downloadSample}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-white font-semibold mb-2">Tips for Best Results</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Use ISO date format: YYYY-MM-DD</li>
              <li>• Amounts should be positive numbers</li>
              <li>• Type should be "income" or "expense"</li>
              <li>• Export from your bank as CSV for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
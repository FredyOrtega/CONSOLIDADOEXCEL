
import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Trash2, 
  AlertCircle, 
  FileCheck, 
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';
import { FileData, ExcelRow, MANDATORY_COLUMNS } from './types';
import { parseExcelFile, downloadMergedExcel } from './services/excelService';
import { analyzeDataWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setIsProcessing(true);
    const newFiles: FileData[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const data = await parseExcelFile(file);
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          data,
          status: 'completed'
        });
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          data: [],
          status: 'error'
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setAiAnalysis(null);
  };

  const mergedData = useMemo(() => {
    return files.reduce((acc, file) => [...acc, ...file.data], [] as ExcelRow[]);
  }, [files]);

  const handleDownload = () => {
    if (mergedData.length === 0) return;
    downloadMergedExcel(mergedData);
  };

  const handleAiAnalysis = async () => {
    if (mergedData.length === 0) return;
    setIsAnalyzing(true);
    const analysis = await analyzeDataWithGemini(mergedData);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FileSpreadsheet className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Excel Merger Pro</h1>
              <p className="text-xs text-slate-500 font-medium">Consolida reportes contables con un clic</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {mergedData.length > 0 && (
              <button
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                   <span className="animate-spin h-4 w-4 border-2 border-indigo-700 border-t-transparent rounded-full"></span>
                ) : <Sparkles className="w-4 h-4" />}
                {isAnalyzing ? "Analizando..." : "Análisis IA"}
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={mergedData.length === 0}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:bg-slate-300 disabled:shadow-none"
            >
              <Download className="w-4 h-4" />
              Descargar Consolidado
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" />
                Cargar Archivos
              </h2>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
                  <p className="mb-2 text-sm text-slate-600 font-medium">Click para seleccionar</p>
                  <p className="text-xs text-slate-400">Excel (.xlsx, .xls)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </label>
              
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Columnas Requeridas:</h3>
                <div className="flex flex-wrap gap-1">
                  {MANDATORY_COLUMNS.map(col => (
                    <span key={col} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Lista de Archivos
                </h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {files.length}
                </span>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {files.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-sm italic">
                    No hay archivos cargados
                  </p>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg ${file.status === 'error' ? 'bg-red-100' : 'bg-white shadow-sm'}`}>
                          <FileSpreadsheet className={`w-4 h-4 ${file.status === 'error' ? 'text-red-500' : 'text-emerald-600'}`} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {(file.size / 1024).toFixed(1)} KB • {file.data.length} filas
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Table / Data Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* IA Analysis Panel (if exists) */}
            {aiAnalysis && (
              <div className="bg-indigo-900 text-indigo-50 p-6 rounded-2xl border border-indigo-700 shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                    <h2 className="font-bold text-lg">Resumen Inteligente</h2>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-indigo-100 font-medium">
                      {aiAnalysis}
                    </div>
                  </div>
                  <button 
                    onClick={() => setAiAnalysis(null)}
                    className="mt-4 text-xs font-bold text-indigo-300 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Cerrar Análisis
                  </button>
                </div>
              </div>
            )}

            {/* Consolidado Info Cards */}
            {mergedData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Filas</p>
                  <p className="text-xl font-bold text-slate-800">{mergedData.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Valor Total</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ${mergedData.reduce((sum, row) => sum + (Number(row.VALOR) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo Pendiente</p>
                  <p className="text-xl font-bold text-amber-600">
                    ${mergedData.reduce((sum, row) => sum + (Number(row['SALDO PENDIENTE']) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Anticipos</p>
                  <p className="text-xl font-bold text-indigo-600">
                    ${mergedData.reduce((sum, row) => sum + (Number(row.ANTICIPO) || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Data Preview Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Vista Previa del Consolidado
                </h2>
                {mergedData.length > 0 && (
                  <p className="text-xs text-slate-500 font-medium">Mostrando las primeras 100 filas</p>
                )}
              </div>
              
              <div className="overflow-x-auto flex-1 max-h-[600px]">
                {mergedData.length === 0 ? (
                  <div className="py-32 flex flex-col items-center text-slate-300">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Cargue archivos para ver la vista previa</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-[1]">
                      <tr>
                        {MANDATORY_COLUMNS.map(col => (
                          <th key={col} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mergedData.slice(0, 100).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          {MANDATORY_COLUMNS.map(col => (
                            <td key={col} className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap max-w-[200px] truncate">
                              {row[col]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {mergedData.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
                  Fin de la vista previa • Total: {mergedData.length} registros
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Empty State / Instructional Overlay */}
      {files.length === 0 && !isProcessing && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm animate-bounce-slow">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 p-3 rounded-xl shadow-lg">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">¿Empezamos?</h3>
              <p className="text-sm text-emerald-100 leading-snug">
                Arrastra aquí tus reportes de Excel o haz clic en el botón de carga para consolidarlos al instante.
              </p>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-lg">Procesando Archivos</h3>
              <p className="text-sm text-slate-500">Estamos normalizando tus columnas...</p>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 border-t border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © 2024 Excel Merger Pro - Herramienta de Consolidación Contable
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <AlertCircle className="w-3 h-3 text-emerald-500" />
              Seguro & Local
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ChevronRight className="w-3 h-3 text-emerald-500" />
              Impulsado por Gemini AI
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;

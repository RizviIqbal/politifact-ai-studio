'use client';

import React, { useState, useEffect } from 'react';
import { PredictionResult, predictTruthfulness, LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import { Table, Plus, Download, Trash2, FileText, Info, Sparkles } from 'lucide-react';

interface BenchmarkItem {
  id: string;
  statement: string;
  justification: string;
  predSO?: PredictionResult;
  predSJ?: PredictionResult;
}

export const CustomClaimBenchmark: React.FC = () => {
  const { model } = useModel();
  const [items, setItems] = useState<BenchmarkItem[]>([
    {
      id: '1',
      statement: 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.',
      justification: 'CDC public records and independent laboratory analyses confirm no microchips exist.',
    },
    {
      id: '2',
      statement: 'Our state lost 50,000 manufacturing jobs during the last administration.',
      justification: 'Jobs declined over a decade due to global economic trends prior to the administration.',
    },
    {
      id: '3',
      statement: 'The federal minimum wage has remained at $7.25 per hour since July 2009.',
      justification: 'Under the Fair Labor Standards Act amendment, federal minimum wage rose to $7.25 in 2009.',
    },
  ]);

  const [newStmt, setNewStmt] = useState<string>('');
  const [newJust, setNewJust] = useState<string>('');

  useEffect(() => {
    if (!model) return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        predSO: predictTruthfulness(item.statement, '', model),
        predSJ: predictTruthfulness(item.statement, item.justification, model),
      }))
    );
  }, [model]);

  const handleAddClaim = () => {
    if (!newStmt.trim() || !model) return;
    const newItem: BenchmarkItem = {
      id: Date.now().toString(),
      statement: newStmt,
      justification: newJust,
      predSO: predictTruthfulness(newStmt, '', model),
      predSJ: predictTruthfulness(newStmt, newJust, model),
    };
    setItems((prev) => [newItem, ...prev]);
    setNewStmt('');
    setNewJust('');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Statement', 'Justification', 'Stmt_Only_Prediction', 'Stmt_Only_Confidence', 'Stmt_Just_Prediction', 'Stmt_Just_Confidence'];
    const rows = items.map((i) => [
      i.id,
      `"${i.statement.replace(/"/g, '""')}"`,
      `"${i.justification.replace(/"/g, '""')}"`,
      i.predSO?.topLabel || '',
      i.predSO ? (i.predSO.confidence * 100).toFixed(1) + '%' : '',
      i.predSJ?.topLabel || '',
      i.predSJ ? (i.predSJ.confidence * 100).toFixed(1) + '%' : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'politifact_ai_benchmark_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', 'politifact_ai_benchmark_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Table className="w-3.5 h-3.5 text-purple-400" />
          <span>Batch Evaluation & Academic Export Suite</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Custom Claim Benchmark Suite
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Add custom political claims, evaluate predictions across Statement-Only and Evidence modes, and export full reports as structured CSV or JSON files.
        </p>
      </div>

      {/* Academic Purpose Callout */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2 shadow-xl">
        <div className="flex items-center space-x-2 text-purple-300 font-mono font-bold uppercase text-xs sm:text-sm">
          <Info className="w-4 h-4 text-purple-400" />
          <span>Why Export Benchmark Datasets? (Academic Research Use Case)</span>
        </div>
        <p className="leading-relaxed font-sans text-slate-300 text-xs sm:text-sm">
          In NLP research, benchmark datasets allow researchers to conduct <strong className="text-white">reproducibility experiments</strong>. Exporting predictions in standardized CSV/JSON formats enables researchers to import customized test cases directly into external machine learning pipelines (e.g. PyTorch, TensorFlow, or Scikit-Learn) for comparative error analysis.
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <span className="text-xs sm:text-sm font-mono font-bold text-purple-300 uppercase tracking-wider block">
          Add New Political Claim to Benchmark
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
          <input
            type="text"
            value={newStmt}
            onChange={(e) => setNewStmt(e.target.value)}
            placeholder="Statement claim (required)..."
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
          />
          <input
            type="text"
            value={newJust}
            onChange={(e) => setNewJust(e.target.value)}
            placeholder="Supporting evidence / justification (optional)..."
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddClaim}
            disabled={!newStmt.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-mono font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add to Benchmark
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 font-mono">
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Benchmark Dataset ({items.length} claims)
          </span>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-indigo-300 border border-slate-800 font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-emerald-300 border border-slate-800 font-bold transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-mono uppercase text-xs">
                <th className="py-3 px-3">Statement Claim</th>
                <th className="py-3 px-3">Statement Only Verdict</th>
                <th className="py-3 px-3">Statement + Evidence Verdict</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#0B0F17]/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-white max-w-sm">
                    <p className="line-clamp-2">&quot;{item.statement}&quot;</p>
                    {item.justification && (
                      <span className="text-xs text-slate-400 block truncate italic mt-0.5 font-sans">
                        Evidence: {item.justification}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.predSO ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-white shadow-sm"
                        style={{ backgroundColor: LABEL_COLORS[item.predSO.topLabel] || '#6366F1' }}
                      >
                        {LABEL_DISPLAY_NAMES[item.predSO.topLabel]} ({Math.round(item.predSO.confidence * 100)}%)
                      </span>
                    ) : (
                      '...'
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.predSJ ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-white shadow-sm"
                        style={{ backgroundColor: LABEL_COLORS[item.predSJ.topLabel] || '#6366F1' }}
                      >
                        {LABEL_DISPLAY_NAMES[item.predSJ.topLabel]} ({Math.round(item.predSJ.confidence * 100)}%)
                      </span>
                    ) : (
                      '...'
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete claim"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

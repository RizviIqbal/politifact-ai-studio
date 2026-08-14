'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Database, Compass, BarChart2, Settings, AlertTriangle, Layers, Filter, Eye } from 'lucide-react';
import { ModelMetric, ConfusionMatrixData, fetchMasterResults, fetchConfusionMatrices } from '../lib/data';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';

const SPECTRUM_LABELS = ['pants-fire', 'false', 'barely-true', 'half-true', 'mostly-true', 'true'];

export const ModelComparisonDashboard: React.FC = () => {
  const [results, setResults] = useState<ModelMetric[]>([]);
  const [confusionData, setConfusionData] = useState<ConfusionMatrixData | null>(null);
  const [selectedMatrixModel, setSelectedMatrixModel] = useState<string>('BiLSTM');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Neural' | 'Classical'>('all');
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; val: number; count?: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [res, cm] = await Promise.all([
        fetchMasterResults(),
        fetchConfusionMatrices(),
      ]);
      setResults(res);
      setConfusionData(cm);
    }
    loadData();
  }, []);

  // Build leaderboard: one row per unique model, best stmt_only metric per model
  const leaderboardData = useMemo(() => {
    const stmtOnly = results.filter((r) => r.input === 'stmt_only');

    // Group by model name, pick best macro_f1 representation
    const bestByModel: Record<string, ModelMetric> = {};
    for (const r of stmtOnly) {
      const key = r.model;
      if (!bestByModel[key] || r.macro_f1 > bestByModel[key].macro_f1) {
        bestByModel[key] = r;
      }
    }

    let list = Object.values(bestByModel).sort((a, b) => b.macro_f1 - a.macro_f1);
    if (categoryFilter !== 'all') {
      list = list.filter((m) => m.type === categoryFilter);
    }
    return list;
  }, [results, categoryFilter]);

  // Find top model
  const topModel = leaderboardData[0];

  // Dynamic confusion matrix labels
  const displayLabels = SPECTRUM_LABELS.map((l) => LABEL_DISPLAY_NAMES[l]);

  const availableMatrixKeys = confusionData ? Object.keys(confusionData.matrices) : [];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Model Leaderboard & Quantitative Analytics Suite</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Empirical Benchmark Performance Leaderboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Comparative ground-truth evaluation across 6-way political truthfulness classification on the LIAR-PLUS test dataset (1,283 test claims).
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Card 1: Best Model */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-lg hover:border-emerald-500/30 transition-all">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold font-mono">
              Top Neural Benchmark
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-white mt-0.5">
              {topModel ? topModel.model : 'BERT Base'}
            </h3>
            <span className="text-xs sm:text-sm text-emerald-400 font-bold block mt-0.5">
              {topModel
                ? `${(topModel.accuracy * 100).toFixed(1)}% Acc • ${topModel.macro_f1.toFixed(4)} F1`
                : '27.1% Acc • 0.2684 F1'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Dataset */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold font-mono">
              Benchmark Dataset
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-white mt-0.5">12,836</h3>
            <span className="text-xs sm:text-sm text-slate-400 block mt-0.5">PolitiFact Statements</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Architectures */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold font-mono">
              Model Hierarchy
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-white mt-0.5">
              10 Architectures
            </h3>
            <span className="text-xs sm:text-sm text-slate-400 block mt-0.5">Transformer, RNNs, Classical</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Significance */}
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold font-mono">
              Ablation Significance
            </span>
            <h3 className="font-sans text-base sm:text-lg font-bold text-emerald-400 mt-0.5">p = 0.1591</h3>
            <span className="text-xs sm:text-sm text-slate-400 block mt-0.5">McNemar Paired Test</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leaderboard & Confusion Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {/* Model Performance Leaderboard */}
          <section className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="font-masthead text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span>Architecture Leaderboard</span>
              </h3>

              {/* Family Filter Pills */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(['all', 'Neural', 'Classical'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      categoryFilter === cat
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'All Models' : cat}
                  </button>
                ))}
              </div>
            </div>

            {leaderboardData.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-mono">Loading benchmark results...</p>
            ) : (
              <div className="space-y-3.5 font-mono text-xs">
                {leaderboardData.map((item, idx) => {
                  const repLabel = item.representation ? ` (${item.representation})` : '';
                  return (
                    <div
                      key={`${item.model}-${item.representation || 'default'}-${idx}`}
                      className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 bg-[#0B0F17] p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="sm:col-span-4 text-slate-200 font-bold truncate">
                        <span className="text-slate-500 font-normal mr-2">#{idx + 1}</span>
                        {idx === 0 && <Trophy className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />}
                        {item.model}
                        <span className="text-xs text-slate-400 font-normal block font-sans">{repLabel || item.type}</span>
                      </div>

                      <div className="sm:col-span-8 space-y-1.5">
                        {/* Accuracy Bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-12">Acc:</span>
                          <div className="relative flex-1 bg-slate-900 h-3.5 rounded-md overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-slate-300 transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] text-[#0B0F17] font-bold"
                              style={{ width: `${Math.min(item.accuracy * 100 * 2.8, 100)}%` }}
                            >
                              {(item.accuracy * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Macro-F1 Bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 w-12 font-bold">F1:</span>
                          <div className="relative flex-1 bg-slate-900 h-3.5 rounded-md overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] text-white font-bold"
                              style={{ width: `${Math.min(item.macro_f1 * 100 * 2.8, 100)}%` }}
                            >
                              {item.macro_f1.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Confusion Matrix Panel — Interactive Model Selector */}
          <section className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-masthead text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Normalized Confusion Matrix</span>
                </h3>
                <span className="font-mono text-[11px] text-slate-400">
                  Select an architecture to inspect predicted vs actual distributions:
                </span>
              </div>

              {/* Model Selector Pills */}
              {availableMatrixKeys.length > 0 && (
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {availableMatrixKeys.map((k) => (
                    <button
                      key={k}
                      onClick={() => setSelectedMatrixModel(k)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                        selectedMatrixModel === k
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {k === 'GRU' ? 'GRU (Collapse)' : k}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {confusionData && confusionData.matrices[selectedMatrixModel] ? (
              <div className="pt-6 overflow-x-auto">
                <div className="min-w-[560px]">
                  {/* Column Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    <div className="col-span-1 text-[11px] font-mono text-slate-500 font-bold uppercase text-right pr-2">
                      True \ Pred
                    </div>
                    {displayLabels.map((lbl, idx) => (
                      <div
                        key={idx}
                        className="text-center font-mono text-xs font-bold truncate text-amber-400"
                      >
                        {lbl}
                      </div>
                    ))}
                  </div>

                  {/* Matrix Rows */}
                  {confusionData.matrices[selectedMatrixModel].normalized.map((row, rIdx) => {
                    const rowLabel = displayLabels[rIdx] || `Class ${rIdx}`;
                    const rowColor = LABEL_COLORS[SPECTRUM_LABELS[rIdx]] || '#64748b';
                    const countRow = confusionData.matrices[selectedMatrixModel].counts?.[rIdx];

                    return (
                      <div key={rIdx} className="grid grid-cols-7 gap-2 items-center mb-2 font-mono">
                        <div className="text-right pr-2 text-xs font-bold text-slate-300 truncate">
                          {rowLabel}
                        </div>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          const cellCount = countRow ? countRow[cIdx] : undefined;
                          const opacity = Math.min(0.08 + val * 0.92, 1.0);
                          return (
                            <div
                              key={cIdx}
                              onMouseEnter={() =>
                                setHoveredCell({ row: rIdx, col: cIdx, val, count: cellCount })
                              }
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`h-11 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-xs transition-all cursor-pointer hover:ring-2 hover:ring-amber-500/50 ${
                                isDiagonal ? 'font-bold text-white ring-1 ring-white/10' : 'text-slate-300'
                              }`}
                              style={{
                                backgroundColor: isDiagonal
                                  ? `${rowColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
                                  : `rgba(30, 41, 59, ${opacity})`,
                              }}
                            >
                              <span>{(val * 100).toFixed(0)}%</span>
                              {cellCount !== undefined && (
                                <span className="text-[9px] text-slate-400 font-normal">
                                  ({cellCount})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Hovered Cell Inspector Banner */}
                {hoveredCell && (
                  <div className="mt-3 p-3 rounded-xl bg-[#0B0F17] border border-amber-500/30 font-mono text-xs text-slate-300 flex items-center justify-between animate-fade-in">
                    <span>
                      True: <strong className="text-white">{displayLabels[hoveredCell.row]}</strong> →
                      Predicted: <strong className="text-amber-400">{displayLabels[hoveredCell.col]}</strong>
                    </span>
                    <span className="font-bold text-emerald-400">
                      {(hoveredCell.val * 100).toFixed(1)}% {hoveredCell.count ? `(${hoveredCell.count} test claims)` : ''}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  Confusion matrix data loading...
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Research Insights & Feature Importance */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono">
              <Settings className="w-4 h-4 text-amber-400" />
              <h3 className="font-masthead text-base font-bold text-white">Empirical Insights</h3>
            </div>

            {/* Card 1: Evidence Ablation */}
            <div className="bg-[#0B0F17] border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-xs font-bold text-white">Evidence Ablation</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  p = 0.1591
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Statistical McNemar testing confirms that adding fact-checker evidence context does not provide a statistically significant accuracy boost over claim statements alone.
              </p>
            </div>

            {/* Card 2: GRU Anomaly */}
            <div className="bg-[#0B0F17] border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-xs font-bold text-white">Model Anomalies</span>
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  Mode Collapse
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                GRU (combined) and LSTM (combined) exhibit mode collapse: Macro-F1 drops to 0.076 and 0.092 respectively, predicting a single dominant class. Inspect the GRU matrix on the left to observe 100% predictions pooling in Barely-True.
              </p>
            </div>

            {/* Card 3: Feature Importance */}
            <div className="pt-2 space-y-3 font-mono text-xs">
              <span className="text-slate-400 uppercase tracking-wider font-bold block">
                Relative Feature Contribution
              </span>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 text-xs">
                  <span>Statement Text (TF-IDF / Embeddings)</span>
                  <span className="text-amber-400 font-bold">85%</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full w-[85%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 text-xs">
                  <span>Justification Context</span>
                  <span className="text-emerald-400 font-bold">62%</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full w-[62%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 text-xs">
                  <span>Speaker Track Record Priors</span>
                  <span className="text-indigo-400 font-bold">45%</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-full w-[45%]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

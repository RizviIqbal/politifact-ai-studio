'use client';

import React, { useState, useEffect } from 'react';
import {
  TsnePoint,
  PredictionAgreementData,
  fetchTsnePoints,
  fetchPredictionAgreement,
} from '../lib/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { motion } from 'framer-motion';

export const ResearchStoryScrolly: React.FC = () => {
  const [tsnePoints, setTsnePoints] = useState<TsnePoint[]>([]);
  const [agreementData, setAgreementData] = useState<PredictionAgreementData | null>(null);

  useEffect(() => {
    async function loadData() {
      const pts = await fetchTsnePoints();
      const agree = await fetchPredictionAgreement();
      setTsnePoints(pts);
      setAgreementData(agree);
    }
    loadData();
  }, []);

  const ablationData = [
    { model: 'BERT', stmt_only: 0.2739, stmt_just: 0.2497 },
    { model: 'RandomForest', stmt_only: 0.2474, stmt_just: 0.2022 },
    { model: 'LogReg', stmt_only: 0.2382, stmt_just: 0.2028 },
    { model: 'BiGRU', stmt_only: 0.2335, stmt_just: 0.2042 },
    { model: 'BiLSTM', stmt_only: 0.2446, stmt_just: 0.2068 },
    { model: 'LSTM', stmt_only: 0.1910, stmt_just: 0.0853 },
    { model: 'NaiveBayes', stmt_only: 0.2171, stmt_just: 0.2121 },
    { model: 'GRU', stmt_only: 0.1195, stmt_just: 0.0784 },
    { model: 'BiSimpleRNN', stmt_only: 0.1916, stmt_just: 0.1915 },
    { model: 'SimpleRNN', stmt_only: 0.1329, stmt_just: 0.1185 },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
          The Visual Empirical Report
        </span>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Visual Scrollytelling & Key Findings
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          An interactive data-journalism walkthrough answering our central research questions.
        </p>
      </div>

      {/* Chapter 1: Ablation Study & McNemar Test */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Chapter 1: The Evidence Ablation Paradox
            </span>
            <h3 className="text-xl sm:text-2xl font-masthead font-bold text-white">
              Does Giving the Model Fact-Checker Evidence Improve Accuracy?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              We evaluated models under two input regimes: <strong className="text-emerald-400">Statement Only</strong> vs. <strong className="text-cyan-400">Statement + Justification</strong>. Contrary to popular intuition, adding human fact-checker evidence did <em>not</em> reliably boost performance.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 flex-shrink-0 space-y-1 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              McNemar Significance Test
            </span>
            <div className="text-sm font-bold text-white">
              chi² = 1.9824, p = 0.1591
            </div>
            <span className="text-[11px] text-slate-400 block font-sans">
              p &gt; 0.05: Not Statistically Significant
            </span>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ablationData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="model" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} interval={0} angle={-20} textAnchor="end" />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={[0, 0.30]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                }}
                formatter={(val: number) => [val.toFixed(4), 'Macro-F1']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Bar dataKey="stmt_only" name="Statement Only" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stmt_just" name="Statement + Evidence" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-xs font-sans text-slate-300 space-y-1">
          <p>
            💡 <strong className="text-amber-400">Key Research Finding:</strong> For our best model (BERT), Statement-Only F1 was <span className="font-mono text-white">0.2739</span> vs. Statement+Justification F1 of <span className="font-mono text-white">0.2497</span>. Adding evidence actually <strong className="text-rose-400">decreased</strong> performance. McNemar&apos;s test confirms p = 0.1495 — the difference is not statistically significant.
          </p>
        </div>
      </motion.div>

      {/* Chapter 2: t-SNE Scatter Plot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl"
      >
        <div className="space-y-2 max-w-3xl">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Chapter 2: Visualizing Task Ambiguity
          </span>
          <h3 className="text-xl sm:text-2xl font-masthead font-bold text-white">
            t-SNE Embedding Projection of Political Claims
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Why do all models struggle to exceed ~28% 6-way accuracy? Below is a 2D t-SNE scatter plot of TF-IDF statement representations sampled across the test set, colored by ground truth rating.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 h-80 bg-[#0B0F17] rounded-xl p-4 border border-slate-800 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="x" name="t-SNE Dim 1" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis type="number" dataKey="y" name="t-SNE Dim 2" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <ZAxis type="number" range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload as TsnePoint;
                      return (
                        <div className="bg-[#1E293B] border border-slate-700 p-3 rounded-xl max-w-xs text-xs space-y-1 shadow-xl font-mono">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                            style={{ backgroundColor: LABEL_COLORS[data.label] }}
                          >
                            {LABEL_DISPLAY_NAMES[data.label]}
                          </span>
                          <p className="text-slate-200 font-sans line-clamp-2">&quot;{data.statement}&quot;</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {Object.keys(LABEL_COLORS).map((lbl) => (
                  <Scatter
                    key={lbl}
                    name={LABEL_DISPLAY_NAMES[lbl]}
                    data={tsnePoints.filter((p) => p.label === lbl)}
                    fill={LABEL_COLORS[lbl]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Overlapping Representations</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Statements across all 6 truth categories heavily overlap in vector space. Unlike sentiment analysis where positive/negative words cluster neatly, political claims use identical vocabulary regardless of veracity.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chapter 3: Inter-Model Agreement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl"
      >
        <div className="space-y-2 max-w-3xl">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            Chapter 3: Why Ensembling Hits a Hard Performance Ceiling
          </span>
          <h3 className="text-xl sm:text-2xl font-masthead font-bold text-white">
            Inter-Model Prediction Agreement Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Our hard-voting ensemble achieved <span className="font-mono text-emerald-400 font-bold">25.18%</span> accuracy — only a marginal gain over single models. McNemar testing confirmed p = 0.5977 &gt; 0.05. Here is why.
          </p>
        </div>

        {agreementData ? (
          <div className="overflow-x-auto pt-2 font-mono">
            <div className="min-w-[550px]">
              <div className="grid grid-cols-8 gap-1.5 text-center text-xs font-bold mb-2">
                <div className="text-slate-500 flex items-center justify-center">Model %</div>
                {agreementData.models.map((m) => (
                  <div key={m} className="text-slate-300 text-[11px] truncate">
                    {m}
                  </div>
                ))}
              </div>

              {agreementData.agreement.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-8 gap-1.5 text-center mb-1.5">
                  <div className="flex items-center justify-end pr-2 text-xs font-bold text-slate-300 text-[11px] truncate">
                    {agreementData.models[rIdx]}
                  </div>

                  {row.map((val, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    return (
                      <div
                        key={cIdx}
                        className={`p-3 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelf
                            ? 'bg-[#0B0F17] text-slate-500 border border-slate-800'
                            : 'text-emerald-300 border border-emerald-500/20'
                        }`}
                        style={{
                          backgroundColor: isSelf
                            ? '#0B0F17'
                            : `rgba(5, 150, 105, ${0.1 + (val / 100) * 0.5})`,
                        }}
                      >
                        {val.toFixed(1)}%
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6 font-mono">Loading agreement matrix...</p>
        )}
      </motion.div>
    </section>
  );
};

'use client';

import React from 'react';
import { Award, BookOpen, CheckCircle2, FileText, Sparkles, Trophy } from 'lucide-react';

export const MasterProjectGuide: React.FC = () => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>All-in-One Master Project Guide & Research Summary</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Complete Research Project Executive Overview
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Everything about our CSE440 research project: research question, 11-model comparison, McNemar test results, and learning takeaways in one unified guide.
        </p>
      </div>

      {/* 1. Research Question & Core Hypotheses */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>1. Central Research Question & Hypotheses</span>
        </div>
        <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 text-sm text-slate-200 italic leading-relaxed font-medium">
          &quot;Does giving a model the fact-checker&apos;s supporting evidence (not just the statement claim) improve its truthfulness prediction, and does the answer depend on how sophisticated the model architecture is?&quot;
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">Hypothesis 1: Evidence Impact</span>
            <p className="text-slate-400 font-sans">Hypothesized that adding fact-checker justification text would significantly increase macro-F1 accuracy across all models.</p>
          </div>
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">Hypothesis 2: Architecture Hierarchy</span>
            <p className="text-slate-400 font-sans">Hypothesized that deep bidirectional neural networks (BiLSTM/BERT) would far outperform classical ML models (LR/RF/NB).</p>
          </div>
        </div>
      </div>

      {/* 2. 11-Model Leaderboard Summary */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>2. Empirical 11-Model Benchmark Leaderboard</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">N=1,283 LIAR-PLUS Test Set</span>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">Input Condition</th>
                <th className="py-2.5 px-3">Macro-F1</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans text-xs">
              <tr className="bg-purple-500/10">
                <td className="py-2.5 px-3 font-bold text-purple-300">BERT Base (Transformer)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement Only</td>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-400">0.2684</td>
                <td className="py-2.5 px-3 font-mono text-white">27.11%</td>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-300">Top Neural Overall</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Random Forest (TF-IDF)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement Only</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">0.2474</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">25.28%</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Top Classical Model</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Logistic Regression (TF-IDF)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement Only</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">0.2382</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">24.09%</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Live Inference Engine</td>
              </tr>
              <tr className="bg-emerald-500/10">
                <td className="py-2.5 px-3 font-bold text-emerald-300">BiGRU (Bidirectional)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement Only</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">0.2314</td>
                <td className="py-2.5 px-3 font-mono text-white">24.17%</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-300">Top RNN Architecture</td>
              </tr>
              <tr className="bg-emerald-500/10">
                <td className="py-2.5 px-3 font-bold text-emerald-300">BiLSTM (Bidirectional)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement Only</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">0.2294</td>
                <td className="py-2.5 px-3 font-mono text-white">23.21%</td>
                <td className="py-2.5 px-3 font-mono text-emerald-300">2nd Best RNN</td>
              </tr>
              <tr className="bg-rose-500/10">
                <td className="py-2.5 px-3 font-bold text-rose-300">GRU (Unidirectional)</td>
                <td className="py-2.5 px-3 text-slate-400 font-mono">Statement + Justification</td>
                <td className="py-2.5 px-3 font-mono font-bold text-rose-400">0.0762</td>
                <td className="py-2.5 px-3 font-mono text-slate-400">20.51%</td>
                <td className="py-2.5 px-3 font-mono font-bold text-rose-300">⚠️ Mode Collapse</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Statistical Significance & Key Findings */}
      <div className="modern-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>3. Statistical Significance & McNemar Test Results</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-[#1E293B] p-4 rounded-xl border border-indigo-500/30 space-y-2">
            <span className="text-indigo-400 font-bold block uppercase tracking-wider">Ablation McNemar Test</span>
            <div className="text-sm font-bold text-white">chi² = 1.9824, p = 0.1591</div>
            <p className="text-slate-300 font-sans text-[11px]">
              p &gt; 0.05 confirms that evidence text does <strong>not</strong> produce a statistically significant improvement over statement-only predictions.
            </p>
          </div>

          <div className="bg-[#1E293B] p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider">Ensemble McNemar Test</span>
            <div className="text-sm font-bold text-white">chi² = 0.2783, p = 0.5977</div>
            <p className="text-slate-300 font-sans text-[11px]">
              p &gt; 0.05 confirms that hard-voting ensembles do not statistically outperform single BiLSTM models due to correlated errors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

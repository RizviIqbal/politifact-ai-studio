'use client';

import React, { useState } from 'react';
import { Network, ArrowRight, ArrowLeft, CheckCircle2, Cpu, Code, Filter, Sparkles, Sliders } from 'lucide-react';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { motion, AnimatePresence } from 'framer-motion';

export const DecisionTreeSimulator: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [featureFilter, setFeatureFilter] = useState<'all' | 'deceptive' | 'truthful'>('all');

  const sampleClaim = 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.';

  const tokens = ['cdc', 'secretly', 'admitted', 'court', 'documents', 'covid', 'vaccines', 'contain', 'microchips'];

  const tfidfWeights = [
    { token: 'microchips', tfidf: 0.58, impact: 'deceptive', pfWeight: +2.5, tWeight: -0.8 },
    { token: 'secretly', tfidf: 0.42, impact: 'deceptive', pfWeight: +1.8, tWeight: -0.6 },
    { token: 'cdc', tfidf: 0.35, impact: 'neutral', pfWeight: +0.4, tWeight: -0.2 },
    { token: 'vaccines', tfidf: 0.38, impact: 'neutral', pfWeight: +0.3, tWeight: -0.1 },
    { token: 'court', tfidf: 0.28, impact: 'truthful', pfWeight: -0.2, tWeight: +0.6 },
    { token: 'documents', tfidf: 0.25, impact: 'truthful', pfWeight: -0.1, tWeight: +0.5 },
  ];

  const filteredWeights = tfidfWeights.filter((w) => {
    if (featureFilter === 'all') return true;
    return w.impact === featureFilter;
  });

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span>Transparent Linear Decision Pipeline</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Interactive 4-Stage Decision Pipeline Simulator
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Step through the 4 mathematical stages of the TF-IDF + Logistic Regression engine to observe how raw text strings are tokenized, weighted, multiplied, and normalized into final class probabilities.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#111827] p-2 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl">
        {[
          { num: 1, title: '1. Text Tokenizer' },
          { num: 2, title: '2. TF-IDF Matrix' },
          { num: 3, title: '3. Logits Dot Product' },
          { num: 4, title: '4. Softmax Probs' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(s.num)}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeStep === s.num
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Stage Cards */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        {/* Stage 1: Tokenizer */}
        {activeStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-masthead text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Stage 1: Lowercase Regex Tokenizer & Stopword Cleaning</span>
              </h3>
              <span className="text-[10px] text-slate-400 bg-[#0B0F17] px-2.5 py-1 rounded border border-slate-800">
                {tokens.length} Clean Tokens Extracted
              </span>
            </div>

            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Raw Input Claim:</span>
              <p className="text-sm font-sans italic text-slate-200 leading-relaxed">&quot;{sampleClaim}&quot;</p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Normalized Clean Tokens:</span>
              <div className="flex flex-wrap gap-2">
                {tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#0B0F17] border border-slate-800 rounded-lg text-emerald-400 font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: TF-IDF */}
        {activeStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 font-mono text-xs"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <h3 className="font-masthead text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Stage 2: Inverse Document Frequency (IDF) Scaling</span>
              </h3>

              {/* Filter */}
              <div className="flex gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800 text-[10px]">
                {(['all', 'deceptive', 'truthful'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeatureFilter(f)}
                    className={`px-2.5 py-0.5 rounded capitalize ${
                      featureFilter === f ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredWeights.map((w, idx) => (
                <div key={idx} className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">&quot;{w.token}&quot;</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        w.impact === 'deceptive'
                          ? 'bg-rose-500/20 text-rose-300'
                          : w.impact === 'truthful'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {w.impact}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                    <span>TF-IDF Score:</span>
                    <span className="text-amber-400 font-bold">{w.tfidf.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stage 3: Logits Dot Product */}
        {activeStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 font-mono text-xs"
          >
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-masthead text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Stage 3: Linear Logit Dot Product Calculation</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Formula: <code className="text-amber-400 font-mono">z_k = Intercept_k + sum(TFIDF_j * Weight_{'{k,j}'})</code>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0B0F17] p-4 rounded-xl border border-rose-500/30 space-y-2">
                <span className="text-rose-400 font-bold uppercase text-[10px] block">
                  Pants on Fire (Deceptive Class Logit):
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Intercept b_0:</span>
                    <span>-0.42</span>
                  </div>
                  <div className="flex justify-between text-rose-300">
                    <span>+ microchips (0.58 x 2.50):</span>
                    <span>+1.45</span>
                  </div>
                  <div className="flex justify-between text-rose-300">
                    <span>+ secretly (0.42 x 1.80):</span>
                    <span>+0.75</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total Logit z_0:</span>
                    <span className="text-rose-400">+1.78</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B0F17] p-4 rounded-xl border border-emerald-500/30 space-y-2">
                <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                  True (Verified Class Logit):
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Intercept b_5:</span>
                    <span>-0.25</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>- microchips (0.58 x -0.80):</span>
                    <span>-0.46</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>- secretly (0.42 x -0.60):</span>
                    <span>-0.25</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total Logit z_5:</span>
                    <span className="text-emerald-400">-0.96</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 4: Softmax Probs */}
        {activeStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 font-mono text-xs"
          >
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-masthead text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Stage 4: Softmax Probability Normalization</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Converts raw linear logit numbers into a valid 6-way probability distribution summing to 1.0.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              {[
                { label: 'pants-fire', prob: 0.58, color: '#DC2626' },
                { label: 'false', prob: 0.22, color: '#EA580C' },
                { label: 'barely-true', prob: 0.11, color: '#D97706' },
                { label: 'half-true', prob: 0.05, color: '#CA8A04' },
                { label: 'mostly-true', prob: 0.03, color: '#65A30D' },
                { label: 'true', prob: 0.01, color: '#059669' },
              ].map((p) => (
                <div key={p.label} className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {LABEL_DISPLAY_NAMES[p.label]}
                  </span>
                  <span className="text-base font-bold text-white block">
                    {(p.prob * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs">
          <button
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-[#0B0F17] transition-all flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Stage
          </button>
          <span className="text-slate-400 font-bold">Step {activeStep} of 4</span>
          <button
            disabled={activeStep === 4}
            onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            Next Stage <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

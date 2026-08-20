'use client';

import React, { useState } from 'react';
import { GraduationCap, BookOpen, CheckCircle, ArrowRight, Sparkles, Layers, Cpu } from 'lucide-react';

export const InteractiveLearningLab: React.FC = () => {
  const [activeModule, setActiveModule] = useState<number>(1);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive NLP Research Learning Lab</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white">
          Interactive Research Learning Lab
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Learn how political fact-checking NLP models operate by stepping through hands-on experimental modules.
        </p>
      </div>

      {/* Module Selector Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#111827] p-2 rounded-xl border border-slate-800 font-mono text-xs shadow-xl">
        {[
          { num: 1, title: '1. TF-IDF Weights' },
          { num: 2, title: '2. Evidence Paradox' },
          { num: 3, title: '3. Speaker Metadata' },
          { num: 4, title: '4. McNemar Test' },
        ].map((m) => (
          <button
            key={m.num}
            onClick={() => setActiveModule(m.num)}
            className={`py-2 px-2 rounded-lg text-center transition-all ${
              activeModule === m.num
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* Module Display Card */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        {activeModule === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Module 1: How TF-IDF Feature Vectors Work</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              TF-IDF (Term Frequency-Inverse Document Frequency) measures how important a word is to a claim relative to the entire dataset of 12,800 PolitiFact statements.
            </p>
            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between text-purple-400 font-bold">
                <span>Rare Term (&quot;microchips&quot;)</span>
                <span>High IDF = 3.10 (Strong Discriminative Signal)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Common Term (&quot;the&quot;, &quot;is&quot;)</span>
                <span>Low IDF = 0.05 (Ignored Neutral Term)</span>
              </div>
            </div>
          </div>
        )}

        {activeModule === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Module 2: The Evidence Paradox (Ablation Study)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Our research tested whether providing models with human fact-checker evidence improves accuracy. Across classical ML and neural networks, adding justification text resulted in no statistically significant gain (BiLSTM F1: 0.2446 vs 0.2068; BERT F1: 0.2739 vs 0.2497).
            </p>
          </div>
        )}

        {activeModule === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Module 3: Speaker Credit Feature Fusion</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              In Section 14, we combined text TF-IDF vectors with 5 speaker track-record counts (<code className="font-mono text-purple-400">scipy.sparse.hstack</code>). This allows the model to adjust claim predictions based on historical politician bias.
            </p>
          </div>
        )}

        {activeModule === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Module 4: Statistical Significance & McNemar Test</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              McNemar&apos;s Chi-Square Test evaluates whether two models make different error patterns on identical test data (<code className="font-mono text-purple-400">p = 0.1591 &gt; 0.05</code>).
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

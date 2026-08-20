'use client';

import React, { useState } from 'react';
import { BookOpen, Github, FileCode, CheckCircle2, Award, Sparkles, Download } from 'lucide-react';
import { NotebookModal } from './NotebookModal';

export const AboutResearch: React.FC = () => {
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 font-sans">
      {/* Notebook Modal Component */}
      <NotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
          Academic Research Project • CSE440
        </span>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          About The LIAR-PLUS Benchmark Project
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          CSE440 Natural Language Processing II — Political Statement Truthfulness Classification & Evidence Ablation Study.
        </p>
      </div>

      {/* Core Research Question & Methodology */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Central Research Question & Methodology</span>
        </h3>

        <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-sm text-slate-300 italic leading-relaxed font-masthead">
          &quot;Does giving an NLP model the fact-checker&apos;s supporting evidence (not just the statement claim) improve its truthfulness prediction, and does the answer depend on how sophisticated the model architecture is?&quot;
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono">
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">1. Benchmark Dataset</span>
            <h4 className="text-sm font-bold text-white font-sans">LIAR-PLUS Dataset</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              ~12,800 human-annotated political statements from PolitiFact across 6 ratings: <em>pants-fire, false, barely-true, half-true, mostly-true, true</em>.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">2. Model Hierarchy</span>
            <h4 className="text-sm font-bold text-white font-sans">11 Architectures</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Evaluated 3 Classical ML models (LR, RF, NB), 6 RNN-family architectures (SimpleRNN, GRU, LSTM uni/bi), fine-tuned BERT Base, and an Ensemble.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">3. Significance</span>
            <h4 className="text-sm font-bold text-white font-sans">McNemar Testing</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Paired retrains across statement-only vs statement+justification conditions with McNemar&apos;s chi-squared statistical significance testing.
            </p>
          </div>
        </div>
      </div>

      {/* Key Takeaways Summary */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Executive Summary & Empirical Findings</span>
        </h3>

        <ul className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <li className="flex items-start space-x-3 bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-white">Evidence does not reliably boost accuracy:</strong> Paired McNemar testing on our best model (BiLSTM) yielded p = 0.1591 &gt; 0.05. Adding justification text provided negligible macro-F1 gain, proving that models rely heavily on claim token heuristics.
            </div>
          </li>

          <li className="flex items-start space-x-3 bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-white">Model sophistication helps, but hits a ceiling:</strong> Transformer and bidirectional neural models (BERT Macro-F1 = 0.2739, BiLSTM = 0.2446, BiGRU = 0.2335) outperform classical TF-IDF models (LR Macro-F1 = 0.2382, NB = 0.2171), but all models face a hard performance ceiling around 24-28% accuracy due to 6-class scalar truth ambiguity.
            </div>
          </li>

          <li className="flex items-start space-x-3 bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-white">Ensembling yields minor gains due to correlated errors:</strong> Hard-voting between top classical and neural models reached 25.18% accuracy, but McNemar testing confirmed p = 0.5977 vs BiLSTM alone because models make highly correlated predictions on short claims.
            </div>
          </li>
        </ul>
      </div>

      {/* Credits & Interactive Code Artifacts */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <h3 className="text-xl font-masthead font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Course Credits & Interactive Research Artifacts</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-2 font-mono">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Academic Context
            </span>
            <div className="text-sm font-bold text-white font-sans">
              CSE440: Natural Language Processing II
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              University Computer Science & Engineering Department Lab Project. Built for research reproducibility and interactive portfolio demonstration.
            </p>
          </div>

          <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between font-mono">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Reproducibility Notebook
              </span>
              <p className="text-xs text-slate-300 font-sans mt-1">
                Inspect the complete Jupyter research pipeline, model training scripts, and accuracy evaluation cells.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setIsNotebookModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 shadow-emerald-600/20"
              >
                <FileCode className="w-4 h-4" />
                <span>View Notebook</span>
              </button>

              <a
                href="/CSE440_Project_.ipynb"
                download="CSE440_Project_.ipynb"
                className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-[#0B0F17] hover:bg-slate-800 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-medium transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download .ipynb</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

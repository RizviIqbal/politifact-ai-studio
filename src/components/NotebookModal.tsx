'use client';

import React, { useState } from 'react';
import { X, Download, FileCode, Copy, Check, Terminal } from 'lucide-react';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({ isOpen, onClose }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const cells = [
    {
      type: 'markdown',
      title: '1. Dataset Loading & LIAR-PLUS Feature Extraction',
      summary: 'Loads 12,836 PolitiFact claims with 6 truth ratings, speaker metadata, and supporting fact-checker justifications.',
      code: `import pandas as pd
import numpy as np

df_train = pd.read_csv("liar_plus_train.tsv", sep="\\t")
print(f"Loaded {len(df_train)} training claims across 6 rating categories.")`,
    },
    {
      type: 'code',
      title: '2. Text Preprocessing & Sublinear TF-IDF Vectorization',
      summary: 'Extracts unigrams and bigrams with sublinear TF-IDF scaling (1 + log(tf)) and L2 normalization.',
      code: `from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)
X_train = vectorizer.fit_transform(df_train['statement_plus_justification'])
print(f"Vocabulary size: {X_train.shape[1]} n-gram features")`,
    },
    {
      type: 'code',
      title: '3. Model Architecture Training & Evidence Ablation Study',
      summary: 'Trains 11 models comparing Statement-Only vs. Statement+Justification conditions. Evaluates BERT Base, BiLSTM, and Classical models.',
      code: `# Model Benchmark Comparison Summary:
# BERT Transformer: Accuracy = 27.58%, Macro-F1 = 0.2739
# Random Forest (Word2Vec): Accuracy = 27.82%, Macro-F1 = 0.2402
# Logistic Regression (TF-IDF): Accuracy = 24.09%, Macro-F1 = 0.2382
# BiGRU (Dual-Pass): Accuracy = 24.17%, Macro-F1 = 0.2314
# BiLSTM (Dual-Pass): Accuracy = 25.36%, Macro-F1 = 0.2446
# McNemar's Chi-Squared Significance Test: p = 0.1591 (No statistically significant gain from justification alone)`,
    },
    {
      type: 'code',
      title: '4. Export Coefficients & Weights for Web Studio',
      summary: 'Exports vectorizer vocabulary, inverse document frequencies (IDF), intercepts, and 6-class linear coefficients to model_weights.json.',
      code: `import json

payload = {
    "labels": ["pants-fire", "false", "barely-true", "half-true", "mostly-true", "true"],
    "vocabulary": vocab_dict,
    "idf": vectorizer.idf_.tolist(),
    "coefficients": clf.coef_.tolist(),
    "intercepts": clf.intercept_.tolist()
}
with open("public/data/model_weights.json", "w") as f:
    json.dump(payload, f)`,
    },
  ];

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-[#111827]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-masthead tracking-wide">
                CSE440_Project_.ipynb
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Jupyter Notebook Artifact • CSE440 NLP Benchmark Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="/CSE440_Project_.ipynb"
              download="CSE440_Project_.ipynb"
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shadow-indigo-600/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download .ipynb</span>
              <span className="sm:hidden">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold">
                Dataset Size
              </span>
              <div className="text-xl font-bold text-white">12,836 Claims</div>
              <p className="text-xs text-slate-400">PolitiFact train / val / test split</p>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-400 font-bold">
                Top Neural Model
              </span>
              <div className="text-xl font-bold text-white">BERT Base</div>
              <p className="text-xs text-slate-400">Macro-F1: 0.2739 (27.58% Acc)</p>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-md">
              <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-bold">
                McNemar Evidence Test
              </span>
              <div className="text-xl font-bold text-white">p = 0.1591</div>
              <p className="text-xs text-slate-400">Justification evidence statistically negligible</p>
            </div>
          </div>

          {/* Cells List */}
          <div className="space-y-4">
            {cells.map((cell, idx) => (
              <div key={idx} className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-[#0B0F17] border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono text-xs text-indigo-400 font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{cell.title}</span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(cell.code, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-[#111827] px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-all font-mono"
                    title="Copy code snippet"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-slate-400 font-sans">{cell.summary}</p>
                  <pre className="p-3 bg-[#0B0F17] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/60 leading-relaxed">
                    {cell.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#111827] flex justify-between items-center text-xs font-mono text-slate-400">
          <span>CSE440 NLP II Research Pipeline</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Cpu,
  Layers,
  BarChart3,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { MainHubType } from './Header';

interface StudioTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHub: (hub: MainHubType) => void;
}

export const StudioTourModal: React.FC<StudioTourModalProps> = ({
  isOpen,
  onClose,
  onSelectHub,
}) => {
  if (!isOpen) return null;

  const hubs = [
    {
      id: 'desk' as MainHubType,
      icon: Cpu,
      badge: 'Hub 1 • Live Workbench',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      iconColor: 'text-amber-400',
      btnHover: 'hover:bg-amber-600 hover:border-amber-500 hover:text-white',
      cardBorder: 'hover:border-amber-500/50',
      title: '1. Fact-Check Studio',
      tagline: 'Real-time statement classifier & universal word-substitution workbench',
      highlights: [
        'Live 4-Engine Inference (LogReg, Random Forest, BiLSTM, BERT Transformer)',
        'Interactive Token Heatmap (Inspect deceptive vs truthful keyword weights)',
        'Word-by-Word Substitution (Swap words with synonyms or type custom terms to watch scores swing)',
        'The 6-Point PolitiFact Truth Spectrum Taxonomy Guide',
      ],
    },
    {
      id: 'simulator' as MainHubType,
      icon: Layers,
      badge: 'Hub 2 • Deep NLP',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
      iconColor: 'text-indigo-400',
      btnHover: 'hover:bg-indigo-600 hover:border-indigo-500 hover:text-white',
      cardBorder: 'hover:border-indigo-500/50',
      title: '2. Neural & Architecture Labs',
      tagline: 'Multi-model matrix, decision pipeline & politician credit priors',
      highlights: [
        '10-Model Empirical Matrix with 4 live interactive client engines',
        'Step-by-Step 4-Stage Decision Pipeline (Tokenizer → TF-IDF → Logits → Softmax)',
        'Politician Credibility Simulator (Bayesian Dirichlet Prior conditioning)',
      ],
    },
    {
      id: 'research' as MainHubType,
      icon: BarChart3,
      badge: 'Hub 3 • Empirical Findings',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      iconColor: 'text-emerald-400',
      btnHover: 'hover:bg-emerald-600 hover:border-emerald-500 hover:text-white',
      cardBorder: 'hover:border-emerald-500/50',
      title: '3. Research Leaderboard',
      tagline: 'Ground-truth test metrics, 2D semantic t-SNE space & paper summary',
      highlights: [
        'Empirical Leaderboard with Interactive Confusion Matrix Selector',
        '2D Semantic Cluster Explorer (t-SNE dimensionality reduction of 12.8k claims)',
        'McNemar Statistical Significance Test & Evidence Ablation Report',
        'CSE440 Research Paper Executive Summary & Jupyter Notebook Viewer',
      ],
    },
    {
      id: 'sandbox' as MainHubType,
      icon: Gamepad2,
      badge: 'Hub 4 • Challenge Arena',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
      iconColor: 'text-purple-400',
      btnHover: 'hover:bg-purple-600 hover:border-purple-500 hover:text-white',
      cardBorder: 'hover:border-purple-500/50',
      title: '4. Playgrounds & Quiz',
      tagline: 'Fact-checking game challenge, batch export & hyperparameter sandbox',
      highlights: [
        'Spot The Lie Arena (Multiplier streaks, speed timer, 50/50 & dual BERT score)',
        'Custom Claim Benchmark Suite (Batch evaluate & export CSV / JSON)',
        'Hyperparameter Sandbox (Tune regularization C, bigrams & sublinear TF)',
        'Political Claim Face-Off (Head-to-head comparison of competing statements)',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#111827]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-masthead font-bold text-white tracking-wide">
                Welcome to PolitiFact AI Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Interactive NLP Research & Fact-Checking Studio • Quick Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          {/* Introductory Callout */}
          <div className="bg-[#0B0F17] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold font-mono text-amber-400 uppercase tracking-wider block">
                👋 New to the studio?
              </span>
              <p className="text-slate-300 font-sans leading-relaxed">
                This studio lets you interact with <strong>12,836 PolitiFact rulings</strong> and <strong>10 AI architectures</strong> (BERT Transformer, BiLSTM, Random Forest, Logistic Regression). Explore the 4 specialized hubs below:
              </p>
            </div>
          </div>

          {/* 4 Hubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((hub) => {
              const Icon = hub.icon;
              return (
                <div
                  key={hub.id}
                  className={`bg-[#111827] border border-slate-800/90 ${hub.cardBorder} p-5 rounded-2xl space-y-3 flex flex-col justify-between transition-all group shadow-xl`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-xl bg-[#0B0F17] ${hub.iconColor} border border-slate-800`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-masthead font-bold text-white text-base">
                          {hub.title}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${hub.badgeColor}`}
                      >
                        {hub.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {hub.tagline}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-1.5 pt-1 text-[12px] text-slate-300 font-sans">
                      {hub.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onSelectHub(hub.id);
                      onClose();
                    }}
                    className={`w-full mt-3 py-2.5 px-3 rounded-xl bg-[#0B0F17] ${hub.btnHover} text-slate-200 border border-slate-800 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm`}
                  >
                    <span>Enter {hub.title.split('.')[1]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick-Start Tips */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-2 font-sans text-xs shadow-lg">
            <span className="font-mono font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
              💡 Recommended 3-Step Exploration Flow:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] font-sans text-slate-300 pt-1">
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <strong className="text-amber-400 block font-mono text-xs">Step 1: Test a Claim</strong>
                <p className="text-slate-400 text-xs">Click a sample claim in Fact-Check Studio and switch between 4 live models to inspect token weights.</p>
              </div>
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <strong className="text-purple-400 block font-mono text-xs">Step 2: Play the Arena</strong>
                <p className="text-slate-400 text-xs">Launch the Spot-the-Lie quiz in Playgrounds to test your intuition against BERT Transformer.</p>
              </div>
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <strong className="text-emerald-400 block font-mono text-xs">Step 3: Compare Models</strong>
                <p className="text-slate-400 text-xs">Visit Neural Labs & Leaderboard to check why evidence did not boost accuracy.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#111827] flex justify-between items-center text-xs font-mono text-slate-400">
          <span>CSE440 Natural Language Processing Lab</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md active:scale-95 shadow-amber-600/25"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

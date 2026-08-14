'use client';

import React from 'react';
import { MainHubType } from './Header';
import { Sparkles, Cpu, Layers, BarChart3, Gamepad2 } from 'lucide-react';

interface HubWelcomeBannerProps {
  activeHub: MainHubType;
  onOpenTour?: () => void;
}

interface HubInfo {
  icon: any;
  badge: string;
  title: string;
  description: string;
  theme: {
    bgGradient: string;
    border: string;
    badgeStyle: string;
    iconColor: string;
    tagStyle: string;
    sparkleColor: string;
  };
  quickActions: { label: string; tag: string }[];
}

const HUB_DATA: Partial<Record<MainHubType, HubInfo>> = {
  simulator: {
    icon: Layers,
    badge: 'Hub 2 • Neural & Mathematical Labs',
    title: 'Multi-Model Architecture & Mathematical Pipeline Labs',
    description:
      'Deep dive into 10 NLP architectures (BERT, BiLSTM, GRUs, Classical). Step through the 4-stage linear decision pipeline and simulate politician credibility priors.',
    theme: {
      bgGradient: 'from-[#0B0F17] via-[#1E1B4B]/50 to-[#0B0F17]',
      border: 'border-indigo-500/30',
      badgeStyle: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      iconColor: 'text-indigo-400',
      tagStyle: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      sparkleColor: 'text-indigo-400',
    },
    quickActions: [
      { label: '10-Model Empirical Benchmark Matrix', tag: '🏆 Benchmarks' },
      { label: '4-Stage Decision Pipeline Simulator', tag: '📐 Math' },
      { label: 'Politician Credibility & Dirichlet Prior', tag: '🗳️ Bayesian' },
    ],
  },
  research: {
    icon: BarChart3,
    badge: 'Hub 3 • Empirical Benchmark Results',
    title: 'Research Leaderboard, 2D Embeddings & Empirical Findings',
    description:
      'Inspect ground-truth test evaluation metrics on 1,283 LIAR-PLUS test claims. Explore the 2D t-SNE embedding space, McNemar significance tests, and the complete research paper.',
    theme: {
      bgGradient: 'from-[#0B0F17] via-[#064E3B]/30 to-[#0B0F17]',
      border: 'border-emerald-500/30',
      badgeStyle: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      iconColor: 'text-emerald-400',
      tagStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      sparkleColor: 'text-emerald-400',
    },
    quickActions: [
      { label: 'Model Performance Leaderboard & Confusion Matrices', tag: '📊 Test Data' },
      { label: '2D Statement Embedding & Cluster Explorer', tag: '🧭 t-SNE' },
      { label: 'Evidence Ablation & McNemar Significance', tag: '🧪 Research' },
      { label: 'Executive Summary & Jupyter Notebook Viewer', tag: '📄 Paper' },
    ],
  },
  sandbox: {
    icon: Gamepad2,
    badge: 'Hub 4 • Interactive Playgrounds',
    title: 'Fact-Checking Challenge Quiz, Batch Exports & Hyperparameter Studio',
    description:
      'Test your human intuition in the Spot-the-Lie quiz game, batch-evaluate custom claims with CSV/JSON exports, tune model hyperparameters in real time, and run head-to-head claim face-offs.',
    theme: {
      bgGradient: 'from-[#0B0F17] via-[#3B0764]/30 to-[#0B0F17]',
      border: 'border-purple-500/30',
      badgeStyle: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      iconColor: 'text-purple-400',
      tagStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      sparkleColor: 'text-purple-400',
    },
    quickActions: [
      { label: 'Spot The Lie: Human vs. AI Challenge', tag: '🎮 Game' },
      { label: 'Custom Claim Batch Benchmark & Exporter', tag: '💾 CSV/JSON' },
      { label: 'Live Hyperparameter Tuning Sandbox', tag: '🎛️ Tuning' },
      { label: 'Political Claim Face-Off Workbench', tag: '⚔️ Head-to-Head' },
    ],
  },
};

export const HubWelcomeBanner: React.FC<HubWelcomeBannerProps> = ({ activeHub }) => {
  if (activeHub === 'desk') return null;

  const current = HUB_DATA[activeHub];
  if (!current) return null;
  const Icon = current.icon;
  const { theme } = current;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 font-sans">
      <div className={`bg-gradient-to-r ${theme.bgGradient} border ${theme.border} p-5 sm:p-6 rounded-2xl shadow-xl space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border text-xs sm:text-sm font-mono font-bold uppercase tracking-wider ${theme.badgeStyle}`}>
              <Icon className={`w-4 h-4 ${theme.iconColor}`} />
              <span>{current.badge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-masthead font-bold text-white tracking-tight">
              {current.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans font-normal">
              {current.description}
            </p>
          </div>
        </div>

        {/* Feature Pills / Table of Contents - Readable & Clean! */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 font-sans text-xs sm:text-sm">
          <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <Sparkles className={`w-3.5 h-3.5 ${theme.sparkleColor}`} /> Key Sections on this page:
          </span>
          {current.quickActions.map((action, idx) => (
            <div
              key={idx}
              className="bg-[#0B0F17] px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-200 flex items-center gap-2 text-xs sm:text-sm shadow-sm hover:border-slate-700 transition-colors"
            >
              <span className="font-medium text-slate-200">{action.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold font-mono border ${theme.tagStyle}`}>
                {action.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

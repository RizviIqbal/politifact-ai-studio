'use client';

import React from 'react';
import { MainHubType } from './Header';
import {
  Cpu,
  Edit3,
  BookOpen,
  Layers,
  GitCommit,
  GitFork,
  UserCheck,
  BarChart3,
  Compass,
  FileText,
  FlaskConical,
  Info,
  Gamepad2,
  Database,
  GraduationCap,
  Sliders,
  Swords,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

export interface SubtoolItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: any;
  badge?: string;
}

export const HUB_SUBTOOLS: Record<MainHubType, SubtoolItem[]> = {
  desk: [
    { id: 'all', label: 'All Studio Tools', shortLabel: 'All Tools', icon: LayoutGrid },
    { id: 'classifier', label: 'Claim Classifier & Gauge', shortLabel: 'Live Classifier', icon: Cpu, badge: 'Real-Time' },
    { id: 'editor', label: 'Word-Swap Simulator', shortLabel: 'Word-Swap', icon: Edit3, badge: 'Interactive' },
    { id: 'spectrum', label: '6-Point Truth Spectrum', shortLabel: 'Truth Taxonomy', icon: BookOpen },
  ],
  simulator: [
    { id: 'all', label: 'All Neural Labs', shortLabel: 'All Labs', icon: LayoutGrid },
    { id: 'matrix', label: '10-Model Empirical Matrix', shortLabel: '10-Model Matrix', icon: Layers, badge: '10 Models' },
    { id: 'pipeline', label: '4-Stage Decision Pipeline', shortLabel: 'Decision Pipeline', icon: GitCommit, badge: 'Step-by-Step' },
    { id: 'tree', label: 'Decision Tree Rule Explorer', shortLabel: 'Tree Rules', icon: GitFork },
    { id: 'priors', label: 'Speaker Credibility Priors', shortLabel: 'Speaker Priors', icon: UserCheck, badge: 'Bayesian' },
  ],
  research: [
    { id: 'all', label: 'All Research Findings', shortLabel: 'All Findings', icon: LayoutGrid },
    { id: 'leaderboard', label: 'Ground-Truth Leaderboard', shortLabel: 'Leaderboard', icon: BarChart3, badge: '1,283 Test' },
    { id: 'tsne', label: '2D t-SNE Embedding Map', shortLabel: '2D t-SNE Map', icon: Compass, badge: '12.8k Claims' },
    { id: 'guide', label: 'Master Project Guide', shortLabel: 'Project Guide', icon: FileText },
    { id: 'story', label: 'Evidence Ablation & McNemar', shortLabel: 'Ablation Report', icon: FlaskConical },
    { id: 'about', label: 'Paper & Methodology', shortLabel: 'Methodology', icon: Info },
  ],
  sandbox: [
    { id: 'all', label: 'All Playgrounds', shortLabel: 'All Playgrounds', icon: LayoutGrid },
    { id: 'quiz', label: 'Spot The Lie Human vs AI', shortLabel: 'Quiz Arena', icon: Gamepad2, badge: 'Human vs AI' },
    { id: 'benchmark', label: 'Batch Benchmark Suite', shortLabel: 'Batch Export', icon: Database, badge: 'CSV/JSON' },
    { id: 'learning', label: 'Interactive Learning Lab', shortLabel: 'Learning Lab', icon: GraduationCap },
    { id: 'sandbox', label: 'Hyperparameter Tuning', shortLabel: 'Hyperparameters', icon: Sliders },
    { id: 'faceoff', label: 'Political Claim Face-Off', shortLabel: 'Claim Face-Off', icon: Swords },
  ],
};

interface HubSubtoolBarProps {
  activeHub: MainHubType;
  activeSubtool: string;
  onSelectSubtool: (subtoolId: string) => void;
}

const HUB_THEMES: Record<
  MainHubType,
  { activeBg: string; activeText: string; activeBorder: string; activeShadow: string }
> = {
  desk: {
    activeBg: 'bg-amber-500',
    activeText: 'text-slate-950',
    activeBorder: 'border-amber-400',
    activeShadow: 'shadow-amber-500/25',
  },
  simulator: {
    activeBg: 'bg-indigo-600',
    activeText: 'text-white',
    activeBorder: 'border-indigo-400',
    activeShadow: 'shadow-indigo-600/25',
  },
  research: {
    activeBg: 'bg-emerald-500',
    activeText: 'text-slate-950',
    activeBorder: 'border-emerald-400',
    activeShadow: 'shadow-emerald-500/25',
  },
  sandbox: {
    activeBg: 'bg-purple-600',
    activeText: 'text-white',
    activeBorder: 'border-purple-400',
    activeShadow: 'shadow-purple-600/25',
  },
};

export const HubSubtoolBar: React.FC<HubSubtoolBarProps> = ({
  activeHub,
  activeSubtool,
  onSelectSubtool,
}) => {
  const tools = HUB_SUBTOOLS[activeHub] || [];
  const theme = HUB_THEMES[activeHub];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mb-6 font-sans">
      <div className="bg-[#0B0F17]/90 border border-slate-800/90 rounded-2xl p-1.5 sm:p-2 backdrop-blur-xl shadow-lg flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tools.map((tool) => {
            const isSelected = activeSubtool === tool.id;
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                onClick={() => onSelectSubtool(tool.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 font-bold shadow-sm active:scale-95 ${
                  isSelected
                    ? `${theme.activeBg} ${theme.activeText} ${theme.activeBorder} shadow-md ${theme.activeShadow}`
                    : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
                title={tool.label}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{tool.shortLabel}</span>
                {tool.badge && !isSelected && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-normal">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { MainHubType } from './Header';
import { Sparkles, FileCode2, Menu } from 'lucide-react';

interface TopBarProps {
  activeHub: MainHubType;
  setActiveHub: (hub: MainHubType) => void;
  onOpenTour: () => void;
  onOpenNotebook: () => void;
  onToggleMobileNav?: () => void;
}

const HUB_TITLES: Record<
  MainHubType,
  { breadcrumb: string; title: string; badgeClass: string; activeColor: string }
> = {
  desk: {
    breadcrumb: 'Hub 1',
    title: 'Fact-Check Studio',
    badgeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    activeColor: 'text-amber-400',
  },
  simulator: {
    breadcrumb: 'Hub 2',
    title: 'Neural & Architecture Labs',
    badgeClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    activeColor: 'text-indigo-400',
  },
  research: {
    breadcrumb: 'Hub 3',
    title: 'Research Leaderboard & Embeddings',
    badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    activeColor: 'text-emerald-400',
  },
  sandbox: {
    breadcrumb: 'Hub 4',
    title: 'Playgrounds, Export Suite & Quiz Arena',
    badgeClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    activeColor: 'text-purple-400',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeHub,
  setActiveHub,
  onOpenTour,
  onOpenNotebook,
  onToggleMobileNav,
}) => {
  const current = HUB_TITLES[activeHub];

  return (
    <header className="bg-[#0B0F17]/90 border-b border-slate-800 sticky top-0 z-20 py-3.5 px-4 sm:px-8 backdrop-blur-md font-sans">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Dynamic Breadcrumb */}
        <div className="flex items-center space-x-3">
          {onToggleMobileNav && (
            <button
              onClick={onToggleMobileNav}
              className="p-1.5 rounded-lg bg-[#111827] text-slate-400 hover:text-white border border-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline-block">PolitiFact AI</span>
            <span className="text-slate-400 hidden sm:inline-block">/</span>
            <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${current.badgeClass}`}>
              {current.breadcrumb}
            </span>
            <span className="text-slate-100 font-bold font-sans text-sm sm:text-base tracking-tight">
              {current.title}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 font-mono text-xs">
          {/* Studio Tour */}
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline-block">Studio Tour</span>
          </button>

          {/* Notebook */}
          <button
            onClick={onOpenNotebook}
            className="hidden md:flex items-center gap-1.5 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 font-medium transition-all"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Notebook</span>
          </button>

          {/* Model Status Pulse */}
          <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline-block">Engine Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useState } from 'react';
import { Cpu, BarChart3, Layers, Sparkles, Gamepad2 } from 'lucide-react';
import { StudioTourModal } from './StudioTourModal';
import { StudioLogo } from './StudioLogo';

export type MainHubType = 'desk' | 'simulator' | 'research' | 'sandbox';

interface HeaderProps {
  activeHub: MainHubType;
  setActiveHub: (hub: MainHubType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeHub, setActiveHub }) => {
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  return (
    <>
      <StudioTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectHub={(hub) => setActiveHub(hub)}
      />

      <header className="bg-[#0B0F17]/95 border-b border-slate-800 sticky top-0 z-40 py-3 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-lg font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            className="cursor-pointer select-none"
            onClick={() => setActiveHub('desk')}
          >
            <StudioLogo size="sm" showText={true} />
          </div>

          {/* Central Hub Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-[#111827] p-1.5 rounded-2xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveHub('desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHub === 'desk'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>1. Studio</span>
            </button>

            <button
              onClick={() => setActiveHub('simulator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHub === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Neural</span>
            </button>

            <button
              onClick={() => setActiveHub('research')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHub === 'research'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveHub('sandbox')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeHub === 'sandbox'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>4. Playgrounds</span>
            </button>
          </nav>

          {/* Right Action: Studio Tour Button & Model Status */}
          <div className="flex items-center space-x-2.5 font-mono text-xs">
            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Tour</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-[#111827] border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-slate-300 font-medium text-[11px]">4 Engines Live</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

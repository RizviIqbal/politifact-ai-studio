'use client';

import React, { useState } from 'react';
import { MainHubType } from './Header';
import { StudioLogo } from './StudioLogo';
import {
  Cpu,
  Layers,
  BarChart3,
  Gamepad2,
  Sparkles,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarNavProps {
  activeHub: MainHubType;
  setActiveHub: (hub: MainHubType) => void;
  onOpenTour: () => void;
  onOpenNotebook: () => void;
  isMobileDrawerOpen?: boolean;
  setIsMobileDrawerOpen?: (open: boolean) => void;
}

interface NavItem {
  id: MainHubType;
  label: string;
  shortLabel: string;
  icon: any;
  badge?: string;
  theme: {
    text: string;
    bgActive: string;
    borderActive: string;
    ringActive: string;
    iconBgActive: string;
    dotColor: string;
    badgeStyle: string;
  };
  subtools: string[];
}

const NAV_HUBS: NavItem[] = [
  {
    id: 'desk',
    label: 'Fact-Check Studio',
    shortLabel: 'Studio',
    icon: Cpu,
    badge: 'Live',
    theme: {
      text: 'text-amber-400',
      bgActive: 'bg-amber-500/15',
      borderActive: 'border-amber-500/40',
      ringActive: 'ring-amber-500/20',
      iconBgActive: 'bg-amber-500 text-slate-950',
      dotColor: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]',
      badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    subtools: ['Claim Classifier', 'Word-Swap Simulator', 'Truth Spectrum'],
  },
  {
    id: 'simulator',
    label: 'Neural Labs',
    shortLabel: 'Neural',
    icon: Layers,
    badge: '10 Models',
    theme: {
      text: 'text-indigo-400',
      bgActive: 'bg-indigo-500/15',
      borderActive: 'border-indigo-500/40',
      ringActive: 'ring-indigo-500/20',
      iconBgActive: 'bg-indigo-500 text-white',
      dotColor: 'bg-indigo-400 shadow-[0_0_8px_#6366F1]',
      badgeStyle: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    },
    subtools: ['Architecture Matrix', 'Linear Pipeline', 'Bayesian Priors'],
  },
  {
    id: 'research',
    label: 'Research Leaderboard',
    shortLabel: 'Research',
    icon: BarChart3,
    badge: '1,283 Test',
    theme: {
      text: 'text-emerald-400',
      bgActive: 'bg-emerald-500/15',
      borderActive: 'border-emerald-500/40',
      ringActive: 'ring-emerald-500/20',
      iconBgActive: 'bg-emerald-500 text-slate-950',
      dotColor: 'bg-emerald-400 shadow-[0_0_8px_#10B981]',
      badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    subtools: ['Confusion Matrices', '2D t-SNE Explorer', 'McNemar Tests'],
  },
  {
    id: 'sandbox',
    label: 'Playgrounds & Quiz',
    shortLabel: 'Playground',
    icon: Gamepad2,
    badge: 'Arena',
    theme: {
      text: 'text-purple-400',
      bgActive: 'bg-purple-500/15',
      borderActive: 'border-purple-500/40',
      ringActive: 'ring-purple-500/20',
      iconBgActive: 'bg-purple-500 text-white',
      dotColor: 'bg-purple-400 shadow-[0_0_8px_#A855F7]',
      badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    },
    subtools: ['Spot-The-Lie Arena', 'Batch Benchmark', 'Hyperparam Tuning'],
  },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeHub,
  setActiveHub,
  onOpenTour,
  onOpenNotebook,
  isMobileDrawerOpen = false,
  setIsMobileDrawerOpen,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleSelectHub = (hubId: MainHubType) => {
    setActiveHub(hubId);
    if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* 1. DESKTOP/TABLET SIDEBAR (Hidden on mobile phones: hidden md:flex) */}
      <aside
        className={`hidden md:flex bg-[#0B0F17]/95 border-r border-slate-800/90 transition-all duration-300 flex-col justify-between select-none z-30 sticky top-0 h-screen font-sans backdrop-blur-xl ${
          isCollapsed ? 'w-24' : 'w-80'
        }`}
      >
        {/* Top Brandmark Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          {!isCollapsed ? (
            <div
              className="cursor-pointer"
              onClick={() => setActiveHub('desk')}
              title="Go to Fact-Check Studio"
            >
              <StudioLogo size="md" showText={true} />
            </div>
          ) : (
            <div
              className="mx-auto cursor-pointer p-1.5 rounded-xl hover:bg-slate-800/60 transition-all"
              onClick={() => setActiveHub('desk')}
              title="PolitiFact AI Studio"
            >
              <StudioLogo size="sm" showText={false} />
            </div>
          )}

          {/* Collapse / Expand Toggle Button */}
          {!isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Hubs List */}
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-3">
          {!isCollapsed && (
            <div className="px-2 mb-2 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Navigation Hubs
            </div>
          )}

          {NAV_HUBS.map((hub, idx) => {
            const isActive = activeHub === hub.id;
            const Icon = hub.icon;
            const { theme } = hub;

            return (
              <div key={hub.id} className="space-y-1.5">
                <button
                  onClick={() => handleSelectHub(hub.id)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all border font-mono ${
                    isActive
                      ? `${theme.bgActive} text-white ${theme.borderActive} shadow-xl ring-1 ${theme.ringActive} font-bold`
                      : 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border-transparent'
                  } ${isCollapsed ? 'justify-center p-3' : ''}`}
                  title={hub.label}
                >
                  <div
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      isActive ? `${theme.iconBgActive} shadow-md ring-1 ring-white/20` : 'bg-[#111827] text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="space-y-0.5 truncate">
                        <span className={`block text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {hub.label}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal font-sans">
                          Hub {idx + 1}
                        </span>
                      </div>

                      {hub.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ml-1 flex-shrink-0 ${theme.badgeStyle}`}>
                          {hub.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-tools Drawer */}
                {isActive && !isCollapsed && (
                  <div className="pl-12 pr-2 py-1.5 space-y-1.5 font-sans animate-fade-in">
                    {hub.subtools.map((tool, tIdx) => (
                      <div
                        key={tIdx}
                        className="text-slate-300 hover:text-white transition-all flex items-center gap-2.5 py-1 px-2.5 rounded-lg hover:bg-slate-800/50 text-[13px] font-medium cursor-pointer"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${theme.dotColor}`} />
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions & Tour Trigger */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2.5 font-mono text-xs">
          <button
            onClick={onOpenTour}
            className={`w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all shadow-sm active:scale-95 ${
              isCollapsed ? 'justify-center p-2.5' : ''
            }`}
            title="Studio Tour & Guide"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs">Interactive Tour</span>}
          </button>

          <button
            onClick={onOpenNotebook}
            className={`w-full flex items-center gap-3 p-3 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-medium transition-all active:scale-95 ${
              isCollapsed ? 'justify-center p-2.5' : ''
            }`}
            title="Inspect Jupyter Notebook"
          >
            <FileCode2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs">Notebook (CSE440)</span>}
          </button>

          {!isCollapsed && (
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="text-slate-300 font-medium">4 Engines Live</span>
              </div>
              <span className="text-slate-400 font-mono">1,283 Test</span>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION DOCK (Native mobile feel: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 border-t border-slate-800/90 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
        {NAV_HUBS.map((hub) => {
          const isActive = activeHub === hub.id;
          const Icon = hub.icon;
          const { theme } = hub;

          return (
            <button
              key={hub.id}
              onClick={() => handleSelectHub(hub.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all font-mono text-[10px] ${
                isActive
                  ? `${theme.text} font-bold scale-105`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mb-0.5 transition-all ${
                  isActive
                    ? `${theme.iconBgActive} shadow-lg ring-1 ring-white/20`
                    : 'bg-[#111827]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[65px]">{hub.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. MOBILE SLIDE-OUT DRAWER MODAL */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen && setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#0B0F17] border-r border-slate-800 flex flex-col justify-between p-5 z-10 shadow-2xl font-sans overflow-y-auto">
            <div className="space-y-6">
              {/* Header with Close */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <StudioLogo size="sm" showText={true} />
                <button
                  onClick={() => setIsMobileDrawerOpen && setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-xl bg-[#111827] text-slate-400 hover:text-white border border-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hub Links */}
              <div className="space-y-2 font-mono">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  Navigate Hubs
                </span>
                {NAV_HUBS.map((hub, idx) => {
                  const isActive = activeHub === hub.id;
                  const Icon = hub.icon;
                  const { theme } = hub;

                  return (
                    <button
                      key={hub.id}
                      onClick={() => handleSelectHub(hub.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all text-xs ${
                        isActive
                          ? `${theme.bgActive} ${theme.text} ${theme.borderActive} font-bold`
                          : 'bg-[#111827] text-slate-300 border-slate-800'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isActive ? theme.iconBgActive : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-sm truncate">{hub.label}</span>
                        <span className="text-[11px] text-slate-400 block font-normal font-sans">Hub {idx + 1}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 space-y-2 font-mono text-xs">
              <button
                onClick={() => {
                  if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
                  onOpenTour();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Interactive Tour</span>
              </button>

              <button
                onClick={() => {
                  if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
                  onOpenNotebook();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#111827] text-slate-200 border border-slate-800 font-medium"
              >
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                <span>Notebook (CSE440)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

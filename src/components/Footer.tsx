'use client';

import React from 'react';
import { StudioLogo } from './StudioLogo';
import { Download, Sparkles, FileCode, ExternalLink, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0F17]/90 border-t border-slate-800/80 w-full px-6 sm:px-12 py-10 z-20 relative mt-auto font-sans backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brandmark */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <StudioLogo size="sm" showText={true} />
        </div>

        {/* Center Credits */}
        <div className="text-slate-400 font-mono text-xs text-center space-y-1">
          <div>© {currentYear} PolitiFact AI Studio • CSE440 Natural Language Processing Lab</div>
          <div className="text-slate-400 text-[11px]">
            Trained & Evaluated on 12,836 PolitiFact LIAR-PLUS Benchmark Statements
          </div>
        </div>

        {/* Links & Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
          <a
            href="/CSE440_Project_.ipynb"
            download="CSE440_Project_.ipynb"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Jupyter Notebook</span>
          </a>

          <a
            href="https://github.com/Tariq-99/440-project"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-sm active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Dataset & Docs</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

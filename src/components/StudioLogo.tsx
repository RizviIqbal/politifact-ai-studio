'use client';

import React from 'react';

interface StudioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const StudioLogo: React.FC<StudioLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none group cursor-pointer ${className}`}>
      {/* Custom Vector Brandmark (Truthometer Shield + Neural Prism) */}
      <div className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/40 via-purple-500/30 to-indigo-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />

        {/* Custom SVG Icon */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Shield Gradient */}
            <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B0F17" />
            </linearGradient>

            {/* Gold Arc Gradient (PolitiFact Truthometer Arc) */}
            <linearGradient id="truthArcGrad" x1="8" y1="12" x2="40" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="75%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            {/* Neural Sparkle Gold */}
            <linearGradient id="sparkGrad" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Cyber Indigo Accent */}
            <linearGradient id="indigoGrad" x1="12" y1="36" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Base Shield Container */}
          <path
            d="M24 4L8 10V22C8 33.2 14.8 41.8 24 44C33.2 41.8 40 33.2 40 22V10L24 4Z"
            fill="url(#shieldGrad)"
            stroke="#475569"
            strokeWidth="1.8"
          />

          {/* Inner Glowing Shield Border */}
          <path
            d="M24 6.5L10 11.8V21.5C10 31.4 16 39.2 24 41.2C32 39.2 38 31.4 38 21.5V11.8L24 6.5Z"
            stroke="url(#truthArcGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Truthometer Gauge Arc */}
          <path
            d="M14 26C14 20.4772 18.4772 16 24 16C29.5228 16 34 20.4772 34 26"
            stroke="url(#truthArcGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Central AI Neural Diamond / Truth Compass */}
          <path
            d="M24 18L27.5 24L24 30L20.5 24L24 18Z"
            fill="url(#sparkGrad)"
            className="filter drop-shadow-[0_0_6px_#F59E0B]"
          />

          {/* Neural Connectivity Nodes */}
          <circle cx="14" cy="26" r="2.2" fill="#EF4444" />
          <circle cx="24" cy="16" r="2.2" fill="#EAB308" />
          <circle cx="34" cy="26" r="2.2" fill="#10B981" />

          {/* Pulse Core Dot */}
          <circle cx="24" cy="24" r="1.5" fill="#FFFFFF" />

          {/* Needle / Calibrator Pin */}
          <line
            x1="24"
            y1="24"
            x2="30"
            y2="18"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Bottom Neural Circuit Bridge */}
          <path
            d="M16 35L21 38H27L32 35"
            stroke="url(#indigoGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography & Brandlock */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span className="font-masthead text-lg sm:text-xl font-bold text-white tracking-tight">
              PolitiFact
            </span>
            <span className="text-[11px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
              AI Studio
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-300 tracking-wide mt-1 font-medium">
            CSE440 NLP Deception Lab
          </span>
        </div>
      )}
    </div>
  );
};

'use client';

import React from 'react';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { Flame, CheckCircle, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TruthometerGaugeProps {
  score: number; // 0 to 100
  topLabel: string;
  confidence: number;
  probabilities?: { label: string; prob: number; color: string }[];
}

export const TruthometerGauge: React.FC<TruthometerGaugeProps> = ({
  score,
  topLabel,
  confidence,
  probabilities,
}) => {
  const strokeColor = LABEL_COLORS[topLabel] || '#64748B';
  const confidencePct = Math.round(confidence * 100);
  const labelDisplayName = LABEL_DISPLAY_NAMES[topLabel] || topLabel;
  const isDeceptive = topLabel === 'pants-fire' || topLabel === 'false' || topLabel === 'barely-true';

  // SVG Gauge calculations (radius 44, circumference 276.46)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - confidence * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-5 font-sans">
      {/* High-Tech Glowing Dial Gauge */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Ambient Glow Background */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-25 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: strokeColor }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Outer Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Secondary Sub-Track */}
          <circle
            cx="50"
            cy="50"
            r={radius - 6}
            fill="none"
            stroke="#0F172A"
            strokeWidth="2"
            strokeDasharray="2 4"
          />

          {/* Foreground Colored Active Ring with Gradient Shadow */}
          <circle
            className="transition-all duration-700 ease-out"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${strokeColor}99)`,
            }}
          />
        </svg>

        {/* Center Percentage, Rating & Index Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 z-10">
          <span
            className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md"
            style={{ color: strokeColor }}
          >
            {confidencePct}%
          </span>
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">
            MODEL CONFIDENCE
          </span>

          <div className="mt-2.5 px-3 py-1 rounded-full bg-[#0B0F17]/95 border border-slate-800 text-xs font-mono text-slate-200 shadow-sm flex items-center gap-1.5 font-medium">
            <span className="text-slate-300">Truth Index:</span>
            <span className="font-bold text-white">{score}/100</span>
          </div>
        </div>
      </div>

      {/* Official PolitiFact Rating Badge */}
      <div
        className="px-5 py-2.5 rounded-2xl flex items-center gap-2.5 font-mono text-sm sm:text-base font-bold uppercase tracking-wider border shadow-xl transition-all duration-500"
        style={{
          backgroundColor: `${strokeColor}15`,
          borderColor: `${strokeColor}60`,
          color: strokeColor,
          boxShadow: `0 4px 20px -4px ${strokeColor}40`,
        }}
      >
        {isDeceptive ? (
          <Flame className="w-5 h-5 animate-pulse flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="tracking-wide text-sm sm:text-base">{labelDisplayName}</span>
      </div>

      {/* Live 6-Class Probability Spectrum Breakdown (if provided) */}
      {probabilities && probabilities.length > 0 && (
        <div className="w-full space-y-2 pt-2 border-t border-slate-800/80 font-sans text-xs sm:text-sm">
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
            Full 6-Class Probability Spectrum:
          </span>
          <div className="space-y-1.5 font-mono text-xs sm:text-sm">
            {probabilities.map((item) => {
              const isWinner = item.label === topLabel;
              return (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className={isWinner ? 'font-bold text-white flex items-center gap-1' : 'text-slate-300'}>
                      {isWinner && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block mr-0.5" />}
                      {LABEL_DISPLAY_NAMES[item.label]}
                    </span>
                    <span className={isWinner ? 'font-bold text-white' : 'text-slate-300'}>
                      {(item.prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner ? 'shadow-[0_0_6px]' : ''
                      }`}
                      style={{
                        width: `${Math.max(item.prob * 100, 2)}%`,
                        backgroundColor: item.color,
                        boxShadow: isWinner ? `0 0 6px ${item.color}` : 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

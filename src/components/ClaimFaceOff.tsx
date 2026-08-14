'use client';

import React, { useState, useEffect } from 'react';
import { PredictionResult, predictTruthfulness, LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import { Swords, Trophy, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { TruthometerGauge } from './TruthometerGauge';

interface ClaimPairPreset {
  title: string;
  claimA: string;
  claimB: string;
}

const PRESET_MATCHUPS: ClaimPairPreset[] = [
  {
    title: 'Minimum Wage vs. Vaccine Microchips',
    claimA: 'The federal minimum wage has remained at $7.25 per hour since July 2009.',
    claimB: 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.',
  },
  {
    title: 'Middle Class Tax Cut vs. Social Security Elimination',
    claimA: 'Under the middle class tax relief bill, typical working families saved an average of $1,200 annually.',
    claimB: 'My political opponent voted to completely eliminate Social Security benefits for all current American retirees.',
  },
  {
    title: 'Clean Energy Investments vs. Job Destruction',
    claimA: 'Over 80 percent of small business owners say access to affordable healthcare coverage is a top economic priority.',
    claimB: 'The proposed energy bill will single-handedly destroy 500,000 manufacturing jobs across the rust belt in 18 months.',
  },
];

export const ClaimFaceOff: React.FC = () => {
  const { model } = useModel();
  const [claimA, setClaimA] = useState<string>(PRESET_MATCHUPS[0].claimA);
  const [claimB, setClaimB] = useState<string>(PRESET_MATCHUPS[0].claimB);
  const [predA, setPredA] = useState<PredictionResult | null>(null);
  const [predB, setPredB] = useState<PredictionResult | null>(null);

  useEffect(() => {
    if (!model) return;
    if (claimA.trim()) setPredA(predictTruthfulness(claimA, '', model));
    if (claimB.trim()) setPredB(predictTruthfulness(claimB, '', model));
  }, [claimA, claimB, model]);

  const scoreA = predA ? predA.truthScore : 50;
  const scoreB = predB ? predB.truthScore : 50;
  const winner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'Tie';
  const scoreDiff = Math.abs(scoreA - scoreB);

  const handleSelectPreset = (preset: ClaimPairPreset) => {
    setClaimA(preset.claimA);
    setClaimB(preset.claimB);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Swords className="w-3.5 h-3.5 text-purple-400" />
          <span>Head-to-Head Claim Comparative Analysis</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Political Claim Face-Off Workbench
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Compare two competing political statements side-by-side to visually inspect comparative model ratings, relative confidence, and feature attribution.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 font-sans text-xs sm:text-sm">
        <span className="text-slate-300 uppercase tracking-wider font-bold mr-1 flex items-center gap-1.5 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Matchup Presets:
        </span>
        {PRESET_MATCHUPS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(preset)}
            className="px-3.5 py-1.5 bg-[#111827] hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-200 hover:text-white rounded-xl transition-all shadow-sm font-medium"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Winner Summary Banner */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 text-center max-w-2xl mx-auto space-y-2 shadow-xl">
        <span className="text-xs sm:text-sm font-mono font-bold text-purple-300 uppercase tracking-wider block">Comparative Model Verdict</span>
        {winner === 'A' && (
          <div className="flex items-center justify-center space-x-2 text-emerald-400 text-base font-bold font-mono">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>Claim A is evaluated more truthful (+{scoreDiff} truth index advantage)</span>
          </div>
        )}
        {winner === 'B' && (
          <div className="flex items-center justify-center space-x-2 text-emerald-400 text-base font-bold font-mono">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>Claim B is evaluated more truthful (+{scoreDiff} truth index advantage)</span>
          </div>
        )}
        {winner === 'Tie' && (
          <div className="text-slate-300 text-sm font-bold font-mono">
            Both claims evaluated identical truthfulness scores ({scoreA} / 100).
          </div>
        )}
      </div>

      {/* Side-by-Side Face-Off Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Candidate A Card */}
        <div className={`bg-[#111827] p-6 rounded-2xl border transition-all space-y-4 shadow-xl ${
          winner === 'A' ? 'border-emerald-500/60 shadow-emerald-500/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Candidate A Statement</span>
            {winner === 'A' && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                HIGHER FACTUALITY
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={claimA}
            onChange={(e) => setClaimA(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 focus:border-emerald-500/60 rounded-xl p-3 text-sm text-white focus:outline-none resize-none leading-relaxed font-medium"
            placeholder="Enter Candidate A statement..."
          />
          {predA ? (
            <div className="space-y-4">
              <TruthometerGauge score={predA.truthScore} topLabel={predA.topLabel} confidence={predA.confidence} />
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                <span>Top Verdict: <strong className="text-white">{LABEL_DISPLAY_NAMES[predA.topLabel]}</strong></span>
                <span>Entropy: <strong className="text-amber-400">{predA.entropy} bits</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8 font-mono">Analyzing Claim A...</p>
          )}
        </div>

        {/* Candidate B Card */}
        <div className={`bg-[#111827] p-6 rounded-2xl border transition-all space-y-4 shadow-xl ${
          winner === 'B' ? 'border-emerald-500/60 shadow-emerald-500/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Candidate B Statement</span>
            {winner === 'B' && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                HIGHER FACTUALITY
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={claimB}
            onChange={(e) => setClaimB(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-sm text-white focus:outline-none resize-none leading-relaxed font-medium"
            placeholder="Enter Candidate B statement..."
          />
          {predB ? (
            <div className="space-y-4">
              <TruthometerGauge score={predB.truthScore} topLabel={predB.topLabel} confidence={predB.confidence} />
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                <span>Top Verdict: <strong className="text-white">{LABEL_DISPLAY_NAMES[predB.topLabel]}</strong></span>
                <span>Entropy: <strong className="text-amber-400">{predB.entropy} bits</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8 font-mono">Analyzing Claim B...</p>
          )}
        </div>
      </div>
    </section>
  );
};

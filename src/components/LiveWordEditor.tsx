'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PredictionResult, predictTruthfulness, LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import {
  Edit3,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Flame,
  Scale,
  Dices,
  Plus,
  Type,
  HelpCircle,
} from 'lucide-react';

interface PresetSubstitution {
  id: string;
  icon: string;
  title: string;
  originalText: string;
  suggestedSwap: string;
}

const PRESET_SPIN_EXPERIMENTS: PresetSubstitution[] = [
  {
    id: 'exp1',
    icon: '🔬',
    title: 'Vaccine Microchips ➔ Factual Ingredients',
    originalText: 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.',
    suggestedSwap: 'Click "secretly" ➔ "officially", and "microchips" ➔ "ingredients"',
  },
  {
    id: 'exp2',
    icon: '💼',
    title: 'Manufacturing Jobs: Lost ➔ Gained',
    originalText: 'Our state lost 50,000 manufacturing jobs during the last governor administration.',
    suggestedSwap: 'Click "lost" ➔ "gained", and "50,000" ➔ "100,000"',
  },
  {
    id: 'exp3',
    icon: '👴',
    title: 'Social Security: Elimination ➔ Reform',
    originalText: 'My political opponent voted to completely eliminate Social Security benefits for retirees.',
    suggestedSwap: 'Click "completely" ➔ "prudently", and "eliminate" ➔ "protect"',
  },
  {
    id: 'exp4',
    icon: '💰',
    title: 'Tax Policy: Relief ➔ Hikes',
    originalText: 'Under the middle class tax relief bill, typical working families saved an average of $1,200 annually.',
    suggestedSwap: 'Click "relief" ➔ "penalty", and "saved" ➔ "lost"',
  },
  {
    id: 'exp5',
    icon: '⚡',
    title: 'Energy Production: Record ➔ Collapse',
    originalText: 'The United States produces more crude oil than any nation in global history.',
    suggestedSwap: 'Click "more" ➔ "less", and "crude oil" ➔ "renewable energy"',
  },
];

interface WordOption {
  word: string;
  impact: 'positive' | 'negative' | 'neutral';
  explanation?: string;
}

const EXTENSIVE_SYNONYM_DICT: Record<string, WordOption[]> = {
  // Verbs
  'secretly': [
    { word: 'officially', impact: 'positive', explanation: 'Legitimate public agency release' },
    { word: 'publicly', impact: 'positive', explanation: 'Open public statement' },
    { word: 'reportedly', impact: 'neutral', explanation: 'Journalistic hedge' },
    { word: 'allegedly', impact: 'negative', explanation: 'Unsubstantiated claim' },
    { word: 'covertly', impact: 'negative', explanation: 'Conspiracy terminology' },
  ],
  'admitted': [
    { word: 'confirmed', impact: 'positive', explanation: 'Verifiable confirmation' },
    { word: 'announced', impact: 'positive', explanation: 'Official declaration' },
    { word: 'stated', impact: 'neutral', explanation: 'Neutral attribution' },
    { word: 'confessed', impact: 'negative', explanation: 'Implies covert guilt' },
    { word: 'denied', impact: 'neutral', explanation: 'Public refutation' },
  ],
  'contain': [
    { word: 'utilize', impact: 'positive' },
    { word: 'include', impact: 'neutral' },
    { word: 'exclude', impact: 'positive' },
    { word: 'inject', impact: 'negative' },
    { word: 'hide', impact: 'negative' },
  ],
  'lost': [
    { word: 'gained', impact: 'positive', explanation: 'Economic growth signal' },
    { word: 'created', impact: 'positive', explanation: 'Job generation signal' },
    { word: 'added', impact: 'positive', explanation: 'Positive expansion' },
    { word: 'retained', impact: 'neutral', explanation: 'Baseline stability' },
    { word: 'shed', impact: 'negative', explanation: 'Downsizing signal' },
    { word: 'destroyed', impact: 'negative', explanation: 'Severe political attack' },
  ],
  'gained': [
    { word: 'lost', impact: 'negative' },
    { word: 'created', impact: 'positive' },
    { word: 'added', impact: 'positive' },
    { word: 'shed', impact: 'negative' },
  ],
  'voted': [
    { word: 'sponsored', impact: 'positive' },
    { word: 'supported', impact: 'positive' },
    { word: 'cosponsored', impact: 'positive' },
    { word: 'opposed', impact: 'neutral' },
    { word: 'refused', impact: 'negative' },
    { word: 'conspired', impact: 'negative' },
  ],
  'eliminate': [
    { word: 'protect', impact: 'positive', explanation: 'Preservation policy' },
    { word: 'expand', impact: 'positive', explanation: 'Benefit growth' },
    { word: 'reform', impact: 'neutral', explanation: 'Moderate policy adjustment' },
    { word: 'adjust', impact: 'neutral', explanation: 'Technical amendment' },
    { word: 'reduce', impact: 'negative', explanation: 'Benefit reduction' },
    { word: 'destroy', impact: 'negative', explanation: 'Maximal deception phrasing' },
  ],
  'saved': [
    { word: 'earned', impact: 'positive' },
    { word: 'received', impact: 'positive' },
    { word: 'paid', impact: 'negative' },
    { word: 'lost', impact: 'negative' },
    { word: 'surrendered', impact: 'negative' },
  ],
  'produces': [
    { word: 'generates', impact: 'positive' },
    { word: 'exports', impact: 'positive' },
    { word: 'consumes', impact: 'neutral' },
    { word: 'wastes', impact: 'negative' },
    { word: 'imports', impact: 'neutral' },
  ],

  // Nouns & Topics
  'microchips': [
    { word: 'ingredients', impact: 'positive', explanation: 'Official biochemical terms' },
    { word: 'components', impact: 'positive', explanation: 'Manufacturing standard' },
    { word: 'lipids', impact: 'positive', explanation: 'Actual mRNA formulation' },
    { word: 'hardware', impact: 'negative', explanation: 'Conspiracy terminology' },
    { word: 'toxins', impact: 'negative', explanation: 'Alarmist medical rhetoric' },
  ],
  'vaccines': [
    { word: 'immunizations', impact: 'positive' },
    { word: 'treatments', impact: 'positive' },
    { word: 'medications', impact: 'neutral' },
    { word: 'therapeutics', impact: 'positive' },
    { word: 'injections', impact: 'neutral' },
    { word: 'chemicals', impact: 'negative' },
  ],
  'manufacturing': [
    { word: 'clean energy', impact: 'positive' },
    { word: 'technology', impact: 'positive' },
    { word: 'healthcare', impact: 'positive' },
    { word: 'construction', impact: 'neutral' },
    { word: 'coal mining', impact: 'neutral' },
    { word: 'government', impact: 'neutral' },
  ],
  'jobs': [
    { word: 'careers', impact: 'positive' },
    { word: 'positions', impact: 'positive' },
    { word: 'opportunities', impact: 'positive' },
    { word: 'factories', impact: 'positive' },
    { word: 'contracts', impact: 'neutral' },
    { word: 'layoffs', impact: 'negative' },
  ],
  'tax': [
    { word: 'income tax', impact: 'neutral' },
    { word: 'tax relief', impact: 'positive' },
    { word: 'corporate tax', impact: 'neutral' },
    { word: 'tax hike', impact: 'negative' },
    { word: 'tax penalty', impact: 'negative' },
  ],
  'relief': [
    { word: 'cuts', impact: 'positive' },
    { word: 'rebates', impact: 'positive' },
    { word: 'credits', impact: 'positive' },
    { word: 'hikes', impact: 'negative' },
    { word: 'increases', impact: 'negative' },
    { word: 'penalties', impact: 'negative' },
  ],
  'oil': [
    { word: 'clean energy', impact: 'positive' },
    { word: 'solar power', impact: 'positive' },
    { word: 'natural gas', impact: 'positive' },
    { word: 'petroleum', impact: 'neutral' },
    { word: 'fossil fuels', impact: 'neutral' },
    { word: 'pollution', impact: 'negative' },
  ],
  'opponent': [
    { word: 'colleague', impact: 'positive' },
    { word: 'candidate', impact: 'neutral' },
    { word: 'challenger', impact: 'neutral' },
    { word: 'rival', impact: 'neutral' },
    { word: 'enemy', impact: 'negative' },
  ],
  'benefits': [
    { word: 'pensions', impact: 'positive' },
    { word: 'guarantees', impact: 'positive' },
    { word: 'payouts', impact: 'neutral' },
    { word: 'checks', impact: 'neutral' },
    { word: 'handouts', impact: 'negative' },
  ],
  'court': [
    { word: 'legal', impact: 'positive' },
    { word: 'public', impact: 'positive' },
    { word: 'congressional', impact: 'positive' },
    { word: 'classified', impact: 'negative' },
  ],
  'documents': [
    { word: 'records', impact: 'positive' },
    { word: 'filings', impact: 'positive' },
    { word: 'reports', impact: 'positive' },
    { word: 'leaks', impact: 'negative' },
  ],

  // Modifiers & Quantifiers
  '50,000': [
    { word: '100,000', impact: 'positive' },
    { word: '25,000', impact: 'neutral' },
    { word: '5,000', impact: 'neutral' },
    { word: 'zero', impact: 'negative' },
    { word: '500,000', impact: 'negative' },
  ],
  'completely': [
    { word: 'prudently', impact: 'positive' },
    { word: 'substantially', impact: 'neutral' },
    { word: 'partially', impact: 'neutral' },
    { word: 'drastically', impact: 'negative' },
    { word: 'recklessly', impact: 'negative' },
  ],
  'more': [
    { word: 'record-breaking', impact: 'positive' },
    { word: 'greater', impact: 'positive' },
    { word: 'equal', impact: 'neutral' },
    { word: 'less', impact: 'negative' },
    { word: 'substantially less', impact: 'negative' },
  ],
  'last': [
    { word: 'current', impact: 'positive' },
    { word: 'previous', impact: 'neutral' },
    { word: 'prior', impact: 'neutral' },
    { word: 'disastrous', impact: 'negative' },
    { word: 'failed', impact: 'negative' },
  ],
  'governor': [
    { word: 'president', impact: 'neutral' },
    { word: 'bipartisan council', impact: 'positive' },
    { word: 'mayor', impact: 'neutral' },
    { word: 'senator', impact: 'neutral' },
    { word: 'regime', impact: 'negative' },
  ],
  'administration.': [
    { word: 'tenure.', impact: 'positive' },
    { word: 'term.', impact: 'neutral' },
    { word: 'leadership.', impact: 'positive' },
    { word: 'regime.', impact: 'negative' },
  ],
  'retirees.': [
    { word: 'seniors.', impact: 'positive' },
    { word: 'veterans.', impact: 'positive' },
    { word: 'families.', impact: 'positive' },
    { word: 'citizens.', impact: 'neutral' },
  ],
};

export const LiveWordEditor: React.FC = () => {
  const { model } = useModel();
  const [currentPreset, setCurrentPreset] = useState<PresetSubstitution>(PRESET_SPIN_EXPERIMENTS[0]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [activeTokenIdx, setActiveTokenIdx] = useState<number | null>(null);
  const [customWordInput, setCustomWordInput] = useState<string>('');

  // Baseline & Modified Predictions
  const [basePrediction, setBasePrediction] = useState<PredictionResult | null>(null);
  const [modifiedPrediction, setModifiedPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    setTokens(currentPreset.originalText.split(' '));
  }, [currentPreset]);

  // Compute baseline
  useEffect(() => {
    if (!model) return;
    const baseRes = predictTruthfulness(currentPreset.originalText, '', model);
    setBasePrediction(baseRes);
  }, [currentPreset, model]);

  // Compute modified
  useEffect(() => {
    if (!model || tokens.length === 0) return;
    const currentStatement = tokens.join(' ');
    const res = predictTruthfulness(currentStatement, '', model);
    setModifiedPrediction(res);
  }, [tokens, model]);

  const handleSelectPreset = (preset: PresetSubstitution) => {
    setCurrentPreset(preset);
    setTokens(preset.originalText.split(' '));
    setActiveTokenIdx(null);
  };

  const handleSwapWord = (idx: number, newWord: string) => {
    const updated = [...tokens];
    updated[idx] = newWord;
    setTokens(updated);
    setActiveTokenIdx(null);
    setCustomWordInput('');
  };

  const handleCustomWordSubmit = (idx: number) => {
    if (!customWordInput.trim()) return;
    handleSwapWord(idx, customWordInput.trim());
  };

  const handleToggleWord = (idx: number) => {
    const updated = [...tokens];
    updated.splice(idx, 1);
    setTokens(updated);
    setActiveTokenIdx(null);
  };

  const handleReset = () => {
    setTokens(currentPreset.originalText.split(' '));
    setActiveTokenIdx(null);
  };

  // 🎲 Random Chaos Spin Generator: randomly flips 2 words to show a dramatic score swing!
  const handleRandomChaosSpin = () => {
    const updated = [...tokens];
    const eligibleIndices: number[] = [];
    tokens.forEach((w, i) => {
      const cleanW = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanW in EXTENSIVE_SYNONYM_DICT || w.toLowerCase() in EXTENSIVE_SYNONYM_DICT) {
        eligibleIndices.push(i);
      }
    });

    if (eligibleIndices.length === 0) return;

    // Pick 2 random indices and swap them
    const shuffled = eligibleIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    shuffled.forEach((idx) => {
      const w = tokens[idx];
      const cleanW = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      const options = EXTENSIVE_SYNONYM_DICT[cleanW] || EXTENSIVE_SYNONYM_DICT[w.toLowerCase()] || [];
      if (options.length > 0) {
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        const hasPunctuation = /[.,!?;:]$/.test(w);
        updated[idx] = hasPunctuation && !/[.,!?;:]$/.test(randomOpt.word)
          ? `${randomOpt.word}${w.slice(-1)}`
          : randomOpt.word;
      }
    });

    setTokens(updated);
    setActiveTokenIdx(null);
  };

  const baseScore = basePrediction?.truthScore ?? 41;
  const modScore = modifiedPrediction?.truthScore ?? 41;
  const scoreDelta = modScore - baseScore;
  const topLabel = modifiedPrediction?.topLabel ?? 'false';
  const labelColor = LABEL_COLORS[topLabel] || '#64748B';

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Keyword Perturbation Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Political Spin & Word-Swap Simulator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Every word below is clickable! Swap keywords or type custom terms to watch the AI truthfulness score flip from False to True in real time.
        </p>
      </div>

      {/* Preset Claims Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-mono text-xs max-w-5xl mx-auto">
        <span className="text-slate-400 text-[11px] uppercase font-bold mr-1 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Choose Statement:
        </span>
        {PRESET_SPIN_EXPERIMENTS.map((exp) => {
          const isSelected = currentPreset.id === exp.id;
          return (
            <button
              key={exp.id}
              onClick={() => handleSelectPreset(exp)}
              className={`px-3 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold ring-1 ring-amber-500/30'
                  : 'bg-[#111827] hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{exp.icon}</span>
              <span>{exp.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Token Board (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2 text-xs">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Click ANY Word to Swap or Edit:
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomChaosSpin}
                className="text-[11px] font-mono text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-all active:scale-95"
                title="Randomly spin 2 words in the sentence"
              >
                <Dices className="w-3.5 h-3.5 text-indigo-400" />
                <span>🎲 Random Spin</span>
              </button>

              <button
                onClick={handleReset}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Clickable Word Tokens Board */}
          <div className="flex flex-wrap gap-2 text-base font-medium leading-relaxed bg-[#0B0F17] p-5 sm:p-6 rounded-xl border border-slate-800 min-h-[140px] items-center">
            {tokens.map((word, idx) => {
              const cleanW = word.toLowerCase().replace(/[^a-z0-9]/g, '');
              const options = EXTENSIVE_SYNONYM_DICT[cleanW] || EXTENSIVE_SYNONYM_DICT[word.toLowerCase()] || [];
              const hasPresetSynonyms = options.length > 0;
              const isSelected = activeTokenIdx === idx;

              return (
                <div key={idx} className="relative inline-block">
                  <button
                    onClick={() => {
                      setActiveTokenIdx(isSelected ? null : idx);
                      setCustomWordInput('');
                    }}
                    className={`px-3 py-1.5 rounded-xl transition-all font-mono text-xs sm:text-sm border font-bold cursor-pointer select-none ${
                      hasPresetSynonyms
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 shadow-[0_0_8px_#F59E0B22]'
                        : 'bg-[#111827] text-slate-200 border-slate-700 hover:border-slate-500'
                    } ${isSelected ? 'ring-2 ring-white border-white' : ''}`}
                  >
                    <span>{word}</span>
                    {hasPresetSynonyms && (
                      <span className="ml-1 text-[9px] text-amber-400 opacity-80">▾</span>
                    )}
                  </button>

                  {/* Popover for Synonym Selection & Custom Word Input */}
                  {isSelected && (
                    <>
                      {/* Mobile Backdrop Overlay */}
                      <div
                        className="fixed inset-0 bg-black/60 sm:hidden z-40"
                        onClick={() => setActiveTokenIdx(null)}
                      />
                      <div className="fixed inset-x-4 top-1/4 sm:top-full sm:inset-x-auto sm:left-0 z-50 sm:z-30 bg-[#1E293B] border border-slate-700 p-4 rounded-2xl max-w-xs sm:max-w-[280px] w-auto sm:w-max space-y-3 font-mono shadow-2xl animate-fade-in text-xs">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Edit: &quot;{word}&quot;
                          </span>
                          <button
                            onClick={() => setActiveTokenIdx(null)}
                            className="text-xs text-slate-400 hover:text-white font-sans px-1"
                          >
                            ✕ Close
                          </button>
                        </div>

                      {/* Preset Options if Available */}
                      {hasPresetSynonyms ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Suggested Substitutes:
                          </span>
                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {options.map((syn) => (
                              <button
                                key={syn.word}
                                onClick={() => handleSwapWord(idx, syn.word)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors font-bold flex items-center justify-between border ${
                                  syn.impact === 'positive'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : syn.impact === 'negative'
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                    : 'bg-[#0B0F17] text-slate-300 border-slate-800 hover:bg-slate-800'
                                }`}
                              >
                                <span>→ {syn.word}</span>
                                <span className="text-[9px] uppercase font-bold opacity-75">
                                  {syn.impact === 'positive' ? '🟢 Fact' : syn.impact === 'negative' ? '🔴 Spin' : '🟡 Neutral'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-sans">
                          No preset synonyms for this specific word. Type any replacement below:
                        </p>
                      )}

                      {/* Custom Word Input */}
                      <div className="pt-2 border-t border-slate-700 space-y-1.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Or Type Custom Word:
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={customWordInput}
                            onChange={(e) => setCustomWordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomWordSubmit(idx);
                            }}
                            placeholder="e.g. verified, zero, federal..."
                            className="flex-1 bg-[#0B0F17] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                          <button
                            onClick={() => handleCustomWordSubmit(idx)}
                            disabled={!customWordInput.trim()}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Delete Word Option */}
                      <div className="pt-1.5 border-t border-slate-700">
                        <button
                          onClick={() => handleToggleWord(idx)}
                          className="w-full text-center px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold transition-all border border-rose-500/30"
                        >
                          Delete Word from Sentence
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
            })}
          </div>

          {/* Dynamic Suggested Experiment Tip */}
          <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed flex items-center gap-2">
            <span className="text-amber-400 font-mono font-bold flex-shrink-0">💡 Suggested Test:</span>
            <span>{currentPreset.suggestedSwap} to watch the real-time truth index delta respond instantly!</span>
          </div>
        </div>

        {/* Right Column: Live Before vs After Impact Delta Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Real-Time Impact Delta</span>
            </span>
            <span className="text-slate-400 text-xs">Before vs. After</span>
          </div>

          {/* Dual Score Comparison Box */}
          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            {/* Baseline */}
            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold block">Original Baseline</span>
              <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase block truncate">
                {basePrediction ? LABEL_DISPLAY_NAMES[basePrediction.topLabel] : 'False'}
              </span>
              <span className="text-xl font-bold text-slate-300 block font-mono">
                {baseScore}/100
              </span>
            </div>

            {/* Modified */}
            <div
              className="bg-[#0B0F17] p-4 rounded-xl border space-y-1 transition-all duration-500 shadow-lg"
              style={{ borderColor: `${labelColor}80` }}
            >
              <span className="text-xs uppercase font-bold block" style={{ color: labelColor }}>
                Modified Verdict
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase block truncate" style={{ color: labelColor }}>
                {modifiedPrediction ? LABEL_DISPLAY_NAMES[modifiedPrediction.topLabel] : 'False'}
              </span>
              <span className="text-xl font-bold text-white block font-mono">
                {modScore}/100
              </span>
            </div>
          </div>

          {/* Delta Gain / Loss Badge */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 text-xs">Net Truth Score Shift:</span>
            <div
              className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs ${
                scoreDelta > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_#10B98122]'
                  : scoreDelta < 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_#F43F5E22]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {scoreDelta > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>+{scoreDelta} Pts Factual Gain</span>
                </>
              ) : scoreDelta < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span>{scoreDelta} Pts Factual Loss</span>
                </>
              ) : (
                <span>0 Pts (Neutral)</span>
              )}
            </div>
          </div>

          {/* Probability Spectrum Bars */}
          {modifiedPrediction && (
            <div className="space-y-1.5 font-mono text-xs pt-1">
              <span className="text-xs text-slate-300 uppercase font-bold tracking-wider block">
                Updated Probability Spectrum:
              </span>
              {modifiedPrediction.probabilities.slice(0, 4).map((p) => (
                <div key={p.label} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{LABEL_DISPLAY_NAMES[p.label]}</span>
                    <span className="font-bold text-white">{(p.prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0B0F17] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(p.prob * 100, 2)}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

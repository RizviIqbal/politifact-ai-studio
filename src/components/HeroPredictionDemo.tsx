'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PredictionResult,
  predictTruthfulness,
  LABEL_DISPLAY_NAMES,
  LABEL_COLORS,
  DetailedTokenImpact,
  LiveEngineType,
  AVAILABLE_ENGINES,
} from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import {
  Sparkles,
  Microscope,
  Play,
  Edit3,
  Cpu,
  Copy,
  Check,
  Zap,
  Eye,
  Sliders,
  RotateCcw,
  Layers,
  Bot,
  Trees,
  Activity,
  Info,
} from 'lucide-react';
import { TruthometerGauge } from './TruthometerGauge';

interface PresetClaim {
  id: string;
  icon: string;
  shortTitle: string;
  statement: string;
  justification: string;
}

const CURATED_PRESETS: PresetClaim[] = [
  {
    id: 'p1',
    icon: '🏛️',
    shortTitle: 'Minimum Wage ($7.25)',
    statement: 'The federal minimum wage has remained at $7.25 per hour since July 2009.',
    justification: 'Under the 2007 Fair Labor Standards Act amendment, the federal minimum wage reached $7.25 in July 2009 and has not been updated since.',
  },
  {
    id: 'p2',
    icon: '🔬',
    shortTitle: 'Vaccine Microchips Myth',
    statement: 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.',
    justification: 'FDA laboratory analyses and public court filings confirm zero microchips or tracking hardware exist in vaccines.',
  },
  {
    id: 'p3',
    icon: '💼',
    shortTitle: '50k Manufacturing Jobs',
    statement: 'Our state lost 50,000 manufacturing jobs during the last governor administration.',
    justification: 'Manufacturing jobs did decline over a 10-year period, but the loss occurred due to nationwide trends prior to the governor taking office.',
  },
  {
    id: 'p4',
    icon: '💰',
    shortTitle: 'Middle Class Tax Cuts',
    statement: 'Under our economic relief bill, middle class families saved an average of $1,200 annually on income taxes.',
    justification: 'Congressional Joint Committee on Taxation estimates show typical middle-income households saved between $1,050 and $1,300.',
  },
  {
    id: 'p5',
    icon: '⚡',
    shortTitle: 'U.S. Crude Oil Record',
    statement: 'The United States produces more crude oil than any nation in global history.',
    justification: 'U.S. Energy Information Administration (EIA) monthly statistics confirm U.S. crude oil output surpassed 13.3 million barrels per day in late 2023.',
  },
  {
    id: 'p6',
    icon: '👴',
    shortTitle: 'Social Security Cuts',
    statement: 'My political opponent voted to completely eliminate Social Security benefits for all current American retirees.',
    justification: 'The opponent voted on an overall discretionary budget spending cap that explicitly exempted Medicare and Social Security from cuts.',
  },
];

export const HeroPredictionDemo: React.FC = () => {
  const [statement, setStatement] = useState<string>(CURATED_PRESETS[0].statement);
  const [justification, setJustification] = useState<string>(CURATED_PRESETS[0].justification);
  const [selectedEngine, setSelectedEngine] = useState<LiveEngineType>('logreg');
  const { model } = useModel();

  const [predStmtOnly, setPredStmtOnly] = useState<PredictionResult | null>(null);
  const [predStmtJust, setPredStmtJust] = useState<PredictionResult | null>(null);
  const [activeToggleTab, setActiveToggleTab] = useState<'so' | 'sj'>('so');
  const [copied, setCopied] = useState<boolean>(false);
  const [hoveredToken, setHoveredToken] = useState<DetailedTokenImpact | null>(null);
  const [selectedToken, setSelectedToken] = useState<DetailedTokenImpact | null>(null);
  const [tokenFilter, setTokenFilter] = useState<'all' | 'significant' | 'deceptive' | 'truthful'>('all');

  useEffect(() => {
    if (!model || !statement.trim()) {
      setPredStmtOnly(null);
      setPredStmtJust(null);
      return;
    }

    const resSO = predictTruthfulness(statement, '', model, selectedEngine);
    const resSJ = predictTruthfulness(statement, justification, model, selectedEngine);
    setPredStmtOnly(resSO);
    setPredStmtJust(resSJ);
  }, [statement, justification, model, selectedEngine]);

  const handleSelectPreset = (preset: PresetClaim) => {
    setStatement(preset.statement);
    setJustification(preset.justification);
    setSelectedToken(null);
  };

  const activePred = activeToggleTab === 'so' ? predStmtOnly : predStmtJust;
  const currentEngineInfo = AVAILABLE_ENGINES.find((e) => e.id === selectedEngine) || AVAILABLE_ENGINES[0];

  // Filtered tokens based on user preference
  const filteredTokens = useMemo(() => {
    if (!activePred || !activePred.tokens) return [];
    if (tokenFilter === 'all') return activePred.tokens;
    if (tokenFilter === 'significant') {
      return activePred.tokens.filter((t) => Math.abs(t.weight) > 0.15 || t.impact !== 'neutral');
    }
    if (tokenFilter === 'deceptive') {
      return activePred.tokens.filter((t) => t.impact === 'deceptive');
    }
    if (tokenFilter === 'truthful') {
      return activePred.tokens.filter((t) => t.impact === 'truthful');
    }
    return activePred.tokens;
  }, [activePred, tokenFilter]);

  // Top 3 highest magnitude tokens
  const topDrivers = useMemo(() => {
    if (!activePred || !activePred.tokens) return [];
    return [...activePred.tokens]
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, 3);
  }, [activePred]);

  const maxLogitVal = activePred && activePred.mathLogits.length > 0
    ? Math.max(...activePred.mathLogits.map((m) => Math.abs(m.logit)))
    : 0;

  const handleCopySummary = () => {
    if (!activePred) return;
    const summary = `🏛️ PolitiFact AI Studio Fact-Check Analysis:\nClaim: "${statement}"\nVerdict: ${LABEL_DISPLAY_NAMES[activePred.topLabel]} (${(activePred.confidence * 100).toFixed(1)}% Confidence)\nTruth Score: ${activePred.truthScore}/100\nActive Engine: ${currentEngineInfo.name}\nInference Latency: ${activePred.latency}ms`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeTokenToInspect = selectedToken || hoveredToken;

  return (
    <div className="py-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-200">
      {/* Clean, Elegant Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-Time Multi-Model Fact-Checking AI Studio</span>
        </div>
        <h1 className="font-masthead text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Political Claim Truthfulness Engine
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Type or paste any political claim below to evaluate it across 4 NLP architectures (BERT Transformer, BiLSTM, Random Forest & Logistic Regression).
        </p>
      </div>

      {/* Sleek Preset Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs max-w-5xl mx-auto">
        <span className="text-slate-300 text-xs uppercase font-bold mr-1 hidden sm:inline-block">
          Try Claim:
        </span>
        {CURATED_PRESETS.map((preset) => {
          const isSelected = statement === preset.statement;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-sans transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold ring-1 ring-amber-500/30'
                  : 'bg-[#111827] hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Model Engine Selector Toolbar (Spacious 4-Column Grid) */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg max-w-5xl mx-auto font-sans text-xs sm:text-sm">
        <div className="flex items-center justify-between text-slate-300 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm uppercase font-bold tracking-wider text-slate-200 font-mono">
              Active NLP Inference Engine:
            </span>
          </div>
          <span className="text-xs text-slate-400 font-sans hidden sm:inline-block">
            4 Selectable Model Architectures
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {AVAILABLE_ENGINES.map((engine) => {
            const isEngineActive = selectedEngine === engine.id;
            return (
              <button
                key={engine.id}
                onClick={() => setSelectedEngine(engine.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 shadow-sm ${
                  isEngineActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold ring-1 ring-amber-500/30'
                    : 'bg-[#0B0F17] text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {engine.id === 'logreg' && <Cpu className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  {engine.id === 'rf' && <Trees className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {engine.id === 'bilstm' && <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  {engine.id === 'bert' && <Bot className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  <span className="truncate text-xs sm:text-sm font-semibold">{engine.shortName}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono whitespace-nowrap flex-shrink-0 font-bold">
                  {engine.latencyEstimate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Statement Input & Token Attribution Heatmap (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Input Box Card */}
          <section className="bg-[#111827] border border-slate-800 p-5 sm:p-6 rounded-2xl relative shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="font-mono text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2 font-bold">
                <Edit3 className="w-4 h-4 text-amber-400" /> Political Statement Claim
              </label>

              {/* Mode Toggle */}
              <div className="flex bg-[#0B0F17] p-1 border border-slate-800 rounded-xl font-mono text-xs">
                <button
                  onClick={() => setActiveToggleTab('so')}
                  className={`px-3 py-1 rounded-lg transition-all font-bold ${
                    activeToggleTab === 'so'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Statement Only
                </button>
                <button
                  onClick={() => setActiveToggleTab('sj')}
                  className={`px-3 py-1 rounded-lg transition-all font-bold ${
                    activeToggleTab === 'sj'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Statement + Evidence
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Type or paste any political claim..."
                className="w-full bg-[#0B0F17] border border-slate-800 focus:border-amber-500/60 rounded-xl p-4 text-white text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-medium placeholder-slate-600"
              />
              <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 bg-[#111827] px-2 py-0.5 rounded border border-slate-800">
                {statement.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {activeToggleTab === 'sj' && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Supporting Fact-Checker Evidence Context:
                </label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Enter fact-checker supporting evidence..."
                  className="w-full bg-[#0B0F17] border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-slate-300 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-800 font-sans text-xs sm:text-sm">
              <span className="text-slate-300 text-xs sm:text-sm flex items-center gap-1.5 font-sans">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Active Engine: <strong className="text-white">{currentEngineInfo.shortName}</strong> ({activePred?.latency} ms)</span>
              </span>

              <div className="flex items-center gap-2 font-mono">
                {activePred && (
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-800 font-bold transition-all text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (model && statement.trim()) {
                      setPredStmtOnly(predictTruthfulness(statement, '', model, selectedEngine));
                      setPredStmtJust(predictTruthfulness(statement, justification, model, selectedEngine));
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 font-bold shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Fact-Check
                </button>
              </div>
            </div>
          </section>

          {/* Token Feature Attribution Heatmap Panel */}
          <section className="bg-[#111827] border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Microscope className="w-4 h-4 text-amber-400" />
                <h3 className="font-masthead text-base sm:text-lg font-bold text-white">
                  Token Feature Attribution Heatmap
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0F17] p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
                <button
                  onClick={() => setTokenFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    tokenFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({activePred?.tokens.length || 0})
                </button>
                <button
                  onClick={() => setTokenFilter('significant')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    tokenFilter === 'significant' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Key Signals
                </button>
                <button
                  onClick={() => setTokenFilter('deceptive')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    tokenFilter === 'deceptive' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Deceptive 🔴
                </button>
                <button
                  onClick={() => setTokenFilter('truthful')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    tokenFilter === 'truthful' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Truthful 🟢
                </button>
              </div>
            </div>

            {/* Tokens Heatmap Matrix */}
            <div className="bg-[#0B0F17] p-4 sm:p-5 rounded-xl border border-slate-800 text-base leading-relaxed min-h-[110px] flex flex-col justify-between">
              {filteredTokens.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredTokens.map((t, idx) => {
                    const isHovered = hoveredToken?.token === t.token;
                    const isSelected = selectedToken?.token === t.token;
                    const isBigram = t.token.includes(' ');

                    return (
                      <button
                        key={idx}
                        onMouseEnter={() => setHoveredToken(t)}
                        onMouseLeave={() => setHoveredToken(null)}
                        onClick={() => setSelectedToken(isSelected ? null : t)}
                        className={`transition-all px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer select-none text-left ${
                          t.impact === 'deceptive'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 shadow-[0_0_8px_#F43F5E22]'
                            : t.impact === 'truthful'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-[0_0_8px_#10B98122]'
                            : 'bg-slate-800/40 text-slate-300 border-slate-800 hover:border-slate-600'
                        } ${isSelected ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                      >
                        <span className="flex items-center gap-1">
                          <span>{t.token}</span>
                          {isBigram && <span className="text-[9px] text-slate-500 font-normal">[2-gram]</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  No tokens match filter. Switch to &quot;All&quot; to inspect all features.
                </div>
              )}
            </div>

            {/* Interactive Selected / Hovered Token Inspector Box */}
            {activeTokenToInspect ? (
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-amber-500/40 font-mono text-xs space-y-2 shadow-xl animate-fade-in">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">
                      Token: &quot;{activeTokenToInspect.token}&quot;
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {activeTokenToInspect.token.includes(' ') ? 'Bigram Collocation' : 'Unigram Word'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400">
                      IDF: <strong className="text-white">{activeTokenToInspect.tfidfVal.toFixed(3)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Weight: <strong className={activeTokenToInspect.weight > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {activeTokenToInspect.weight > 0 ? `+${activeTokenToInspect.weight.toFixed(3)}` : activeTokenToInspect.weight.toFixed(3)}
                      </strong>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {activeTokenToInspect.impact === 'deceptive' ? (
                    <>
                      <strong className="text-rose-400 font-mono">Deceptive Attribution:</strong> Correlates strongly with False / Pants-on-Fire rulings in the LIAR-PLUS dataset.
                    </>
                  ) : activeTokenToInspect.impact === 'truthful' ? (
                    <>
                      <strong className="text-emerald-400 font-mono">Truthful Anchor:</strong> Correlates with verified factual legislation and statistical reports.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-400 font-mono">Neutral Context:</strong> Uniformly distributed across truthfulness categories.
                    </>
                  )}
                </p>
              </div>
            ) : (
              /* Top Decisive Drivers Bar */
              <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Top Decisive Drivers:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {topDrivers.map((d, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded border font-bold ${
                        d.impact === 'deceptive'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : d.impact === 'truthful'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      &quot;{d.token}&quot; ({d.weight > 0 ? `+${d.weight.toFixed(2)}` : d.weight.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Truthometer Cockpit & Live Softmax Distribution (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Classification Verdict</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px]">
                {currentEngineInfo.shortName}
              </span>
            </div>

            {/* Glowing Gauge & 6-Class Spectrum */}
            <div className="py-1 w-full">
              <TruthometerGauge
                score={activePred ? activePred.truthScore : 50}
                topLabel={activePred ? activePred.topLabel : 'half-true'}
                confidence={activePred ? activePred.confidence : 0.50}
                probabilities={activePred ? activePred.probabilities : undefined}
              />
            </div>

            {/* Live Telemetry Drawer */}
            <div className="w-full pt-3 border-t border-slate-800 grid grid-cols-3 text-center font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  MAX LOGIT
                </span>
                <span className="text-xs text-white font-bold mt-0.5">
                  {maxLogitVal ? maxLogitVal.toFixed(3) : '0.000'}
                </span>
              </div>
              <div className="flex flex-col border-x border-slate-800 px-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  ENTROPY
                </span>
                <span className="text-xs text-amber-400 font-bold mt-0.5">
                  {activePred ? `${activePred.entropy} bits` : '0.000'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  LATENCY
                </span>
                <span className="text-xs text-emerald-400 font-bold mt-0.5">
                  {activePred ? `${activePred.latency} ms` : '<1 ms'}
                </span>
              </div>
            </div>

            {/* AI Decision X-Ray Summary Card */}
            {activePred && (
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800 space-y-1 font-sans text-xs">
                <span className="font-mono font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentEngineInfo.shortName} Decision Logic:</span>
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Evaluated <strong className="text-white">{LABEL_DISPLAY_NAMES[activePred.topLabel]}</strong> ({(activePred.confidence * 100).toFixed(1)}% conf). {currentEngineInfo.description}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

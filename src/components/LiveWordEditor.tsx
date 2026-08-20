'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  X,
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
  // Preset 1: Vaccines & CDC
  'cdc': [
    { word: 'FDA', impact: 'neutral', explanation: 'Federal regulatory agency' },
    { word: 'NIH', impact: 'positive', explanation: 'National Institutes of Health' },
    { word: 'WHO', impact: 'neutral', explanation: 'World Health Organization' },
    { word: 'conspiracy blog', impact: 'negative', explanation: 'Unverified partisan source' },
    { word: 'anonymous source', impact: 'negative', explanation: 'Unsubstantiated origin' },
  ],
  'secretly': [
    { word: 'officially', impact: 'positive', explanation: 'Legitimate public agency release' },
    { word: 'publicly', impact: 'positive', explanation: 'Open public press briefing' },
    { word: 'reportedly', impact: 'neutral', explanation: 'Standard journalistic attribution' },
    { word: 'allegedly', impact: 'negative', explanation: 'Unsubstantiated claim' },
    { word: 'covertly', impact: 'negative', explanation: 'Conspiracy rhetoric' },
  ],
  'admitted': [
    { word: 'confirmed', impact: 'positive', explanation: 'Verifiable factual record' },
    { word: 'announced', impact: 'positive', explanation: 'Official public statement' },
    { word: 'stated', impact: 'neutral', explanation: 'Neutral factual reporting' },
    { word: 'confessed', impact: 'negative', explanation: 'Implies hidden criminal guilt' },
    { word: 'denied', impact: 'neutral', explanation: 'Explicit refutation' },
  ],
  'court': [
    { word: 'legal', impact: 'positive', explanation: 'Formal judicial proceedings' },
    { word: 'public', impact: 'positive', explanation: 'Transparent public record' },
    { word: 'congressional', impact: 'positive', explanation: 'Official legislative inquiry' },
    { word: 'classified', impact: 'negative', explanation: 'Insinuates hidden conspiracy' },
  ],
  'documents': [
    { word: 'records', impact: 'positive', explanation: 'Audited public archives' },
    { word: 'filings', impact: 'positive', explanation: 'Official legal paperwork' },
    { word: 'reports', impact: 'positive', explanation: 'Published scientific studies' },
    { word: 'leaks', impact: 'negative', explanation: 'Unverified covert material' },
  ],
  'covid': [
    { word: 'COVID-19', impact: 'positive', explanation: 'Standard scientific nomenclature' },
    { word: 'seasonal influenza', impact: 'neutral', explanation: 'Baseline viral comparison' },
    { word: 'experimental viral', impact: 'negative', explanation: 'Alarmist characterization' },
  ],
  'vaccines': [
    { word: 'immunizations', impact: 'positive', explanation: 'Standard clinical term' },
    { word: 'treatments', impact: 'neutral', explanation: 'Therapeutic reference' },
    { word: 'injections', impact: 'neutral', explanation: 'Physical delivery method' },
    { word: 'compounds', impact: 'negative', explanation: 'Ambiguous chemical phrasing' },
  ],
  'contain': [
    { word: 'utilize', impact: 'positive', explanation: 'Standard formulation terminology' },
    { word: 'include', impact: 'neutral', explanation: 'Neutral factual inclusion' },
    { word: 'exclude', impact: 'positive', explanation: 'Explicit safety boundary' },
    { word: 'inject', impact: 'negative', explanation: 'Invasive rhetoric' },
    { word: 'hide', impact: 'negative', explanation: 'Concealment framing' },
  ],
  'microchips': [
    { word: 'ingredients', impact: 'positive', explanation: 'Official biochemical formulation' },
    { word: 'components', impact: 'positive', explanation: 'Standard pharmaceutical parts' },
    { word: 'lipids', impact: 'positive', explanation: 'Actual mRNA nanoparticle structure' },
    { word: 'hardware', impact: 'negative', explanation: 'Conspiracy falsehood' },
    { word: 'toxins', impact: 'negative', explanation: 'Alarmist medical disinformation' },
  ],

  // Preset 2: Jobs & Economy
  'state': [
    { word: 'nation', impact: 'neutral', explanation: 'Country-wide scope' },
    { word: 'region', impact: 'neutral', explanation: 'Geographic economic zone' },
    { word: 'county', impact: 'neutral', explanation: 'Localized district' },
  ],
  'lost': [
    { word: 'gained', impact: 'positive', explanation: 'Economic growth signal' },
    { word: 'created', impact: 'positive', explanation: 'Job generation signal' },
    { word: 'added', impact: 'positive', explanation: 'Positive expansion' },
    { word: 'retained', impact: 'neutral', explanation: 'Baseline stability' },
    { word: 'shed', impact: 'negative', explanation: 'Downsizing signal' },
    { word: 'destroyed', impact: 'negative', explanation: 'Severe political attack' },
  ],
  '50000': [
    { word: '100,000', impact: 'positive', explanation: 'Doubled job growth metric' },
    { word: '25,000', impact: 'neutral', explanation: 'Moderate adjustment' },
    { word: '5,000', impact: 'neutral', explanation: 'Minimal fluctuation' },
    { word: 'zero', impact: 'negative', explanation: 'Stagnation claim' },
    { word: '500,000', impact: 'negative', explanation: 'Severe hyperbolic distortion' },
  ],
  'manufacturing': [
    { word: 'clean energy', impact: 'positive', explanation: 'Emerging tech sector' },
    { word: 'technology', impact: 'positive', explanation: 'High-wage modern industry' },
    { word: 'industrial', impact: 'neutral', explanation: 'Traditional heavy industry' },
    { word: 'service sector', impact: 'neutral', explanation: 'Non-manufacturing employment' },
  ],
  'jobs': [
    { word: 'careers', impact: 'positive', explanation: 'High-quality sustainable roles' },
    { word: 'positions', impact: 'neutral', explanation: 'Standard employment count' },
    { word: 'opportunities', impact: 'positive', explanation: 'Economic prospect framing' },
    { word: 'gigs', impact: 'negative', explanation: 'Precarious labor framing' },
  ],
  'last': [
    { word: 'current', impact: 'positive', explanation: 'Incumbent term' },
    { word: 'previous', impact: 'neutral', explanation: 'Neutral historical reference' },
    { word: 'prior', impact: 'neutral', explanation: 'Standard temporal descriptor' },
    { word: 'disastrous', impact: 'negative', explanation: 'Partisan attack adjective' },
    { word: 'failed', impact: 'negative', explanation: 'Overt partisan condemnation' },
  ],
  'governor': [
    { word: 'president', impact: 'neutral', explanation: 'Executive leadership level' },
    { word: 'bipartisan council', impact: 'positive', explanation: 'Cross-party consensus' },
    { word: 'mayor', impact: 'neutral', explanation: 'Municipal jurisdiction' },
    { word: 'senator', impact: 'neutral', explanation: 'Legislative branch' },
    { word: 'regime', impact: 'negative', explanation: 'Authoritarian delegitimization' },
  ],
  'administration': [
    { word: 'tenure', impact: 'positive', explanation: 'Official constitutional term' },
    { word: 'term', impact: 'neutral', explanation: 'Standard elective cycle' },
    { word: 'leadership', impact: 'positive', explanation: 'Positive institutional stewardship' },
    { word: 'regime', impact: 'negative', explanation: 'Pejorative delegitimization' },
  ],

  // Preset 3: Social Security
  'opponent': [
    { word: 'colleague', impact: 'positive', explanation: 'Civil institutional framing' },
    { word: 'predecessor', impact: 'neutral', explanation: 'Historical predecessor' },
    { word: 'challenger', impact: 'neutral', explanation: 'Electoral competitor' },
    { word: 'rival', impact: 'neutral', explanation: 'Political adversary' },
    { word: 'enemy', impact: 'negative', explanation: 'Hyper-polarized rhetoric' },
  ],
  'voted': [
    { word: 'sponsored', impact: 'positive', explanation: 'Direct legislative authorship' },
    { word: 'supported', impact: 'positive', explanation: 'Affirmative policy backing' },
    { word: 'cosponsored', impact: 'positive', explanation: 'Multi-sponsor collaboration' },
    { word: 'opposed', impact: 'neutral', explanation: 'Negative vote on specific bill' },
    { word: 'refused', impact: 'negative', explanation: 'Obstructive framing' },
    { word: 'conspired', impact: 'negative', explanation: 'Conspiratorial bad faith' },
  ],
  'completely': [
    { word: 'prudently', impact: 'positive', explanation: 'Responsible measured fiscal reform' },
    { word: 'substantially', impact: 'neutral', explanation: 'Significant scale modification' },
    { word: 'partially', impact: 'neutral', explanation: 'Gradual phased adjustment' },
    { word: 'drastically', impact: 'negative', explanation: 'Severe aggressive reduction' },
    { word: 'recklessly', impact: 'negative', explanation: 'Negligent fiscal destruction' },
  ],
  'eliminate': [
    { word: 'protect', impact: 'positive', explanation: 'Guaranteed benefit security' },
    { word: 'expand', impact: 'positive', explanation: 'Increased funding & payouts' },
    { word: 'reform', impact: 'neutral', explanation: 'Actuarial solvent adjustments' },
    { word: 'adjust', impact: 'neutral', explanation: 'Cost-of-living COLA tweak' },
    { word: 'reduce', impact: 'negative', explanation: 'Benefit haircut' },
    { word: 'destroy', impact: 'negative', explanation: 'Existential elimination attack' },
  ],
  'benefits': [
    { word: 'guarantees', impact: 'positive', explanation: 'Entitlement statutory promise' },
    { word: 'pensions', impact: 'positive', explanation: 'Earned retirement annuities' },
    { word: 'payouts', impact: 'neutral', explanation: 'Standard monthly disbursements' },
    { word: 'checks', impact: 'neutral', explanation: 'Direct payment mechanisms' },
    { word: 'handouts', impact: 'negative', explanation: 'Welfare pejorative framing' },
  ],
  'retirees': [
    { word: 'seniors', impact: 'positive', explanation: 'Vulnerable elderly demographic' },
    { word: 'veterans', impact: 'positive', explanation: 'Honored service members' },
    { word: 'working families', impact: 'positive', explanation: 'Middle-class recipients' },
    { word: 'citizens', impact: 'neutral', explanation: 'General public population' },
  ],

  // Preset 4: Tax Policy
  'middle': [
    { word: 'working', impact: 'positive', explanation: 'Working class emphasis' },
    { word: 'wealthy', impact: 'negative', explanation: 'Top bracket concentration' },
    { word: 'broad', impact: 'neutral', explanation: 'Universal coverage' },
  ],
  'class': [
    { word: 'families', impact: 'positive', explanation: 'Household unit' },
    { word: 'earners', impact: 'neutral', explanation: 'Income demographic' },
    { word: 'corporations', impact: 'negative', explanation: 'Commercial enterprise shift' },
  ],
  'tax': [
    { word: 'tariff', impact: 'neutral', explanation: 'Import/trade border levy' },
    { word: 'income tax', impact: 'neutral', explanation: 'Direct payroll deduction' },
    { word: 'revenue', impact: 'positive', explanation: 'Government fiscal balance' },
  ],
  'relief': [
    { word: 'cuts', impact: 'positive', explanation: 'Direct rate reduction' },
    { word: 'credits', impact: 'positive', explanation: 'Targeted refund incentives' },
    { word: 'reforms', impact: 'neutral', explanation: 'Structural code simplification' },
    { word: 'penalties', impact: 'negative', explanation: 'Punitive surcharge framing' },
    { word: 'hikes', impact: 'negative', explanation: 'Direct tax increases' },
  ],
  'bill': [
    { word: 'legislation', impact: 'positive', explanation: 'Enacted statutory law' },
    { word: 'act', impact: 'positive', explanation: 'Congressional statute' },
    { word: 'initiative', impact: 'neutral', explanation: 'Policy proposal' },
    { word: 'scheme', impact: 'negative', explanation: 'Deceptive hidden agenda' },
  ],
  'saved': [
    { word: 'earned', impact: 'positive', explanation: 'Retained wage income' },
    { word: 'received', impact: 'positive', explanation: 'Direct cash benefit' },
    { word: 'paid', impact: 'negative', explanation: 'Out-of-pocket tax burden' },
    { word: 'lost', impact: 'negative', explanation: 'Net financial deficit' },
    { word: 'surrendered', impact: 'negative', explanation: 'Involuntary tax seizure' },
  ],
  '1200': [
    { word: '$2,400', impact: 'positive', explanation: 'Doubled savings estimate' },
    { word: '$500', impact: 'neutral', explanation: 'Conservative modest estimate' },
    { word: '$0', impact: 'negative', explanation: 'Zero benefit claim' },
    { word: '$5,000', impact: 'negative', explanation: 'Exaggerated hyperbole' },
  ],
  'annually': [
    { word: 'per year', impact: 'neutral', explanation: 'Standard annualized frequency' },
    { word: 'monthly', impact: 'positive', explanation: 'Higher implied aggregate return' },
    { word: 'over a decade', impact: 'negative', explanation: 'Diluted long-term aggregate' },
  ],

  // Preset 5: Energy Production
  'produces': [
    { word: 'generates', impact: 'positive', explanation: 'Direct energy output' },
    { word: 'exports', impact: 'positive', explanation: 'Net trade surplus signal' },
    { word: 'supplies', impact: 'positive', explanation: 'Grid capacity reliability' },
    { word: 'consumes', impact: 'neutral', explanation: 'Domestic demand volume' },
    { word: 'wastes', impact: 'negative', explanation: 'Inefficient emission loss' },
    { word: 'imports', impact: 'negative', explanation: 'Foreign dependency' },
  ],
  'more': [
    { word: 'record-breaking', impact: 'positive', explanation: 'Historical zenith benchmark' },
    { word: 'greater', impact: 'positive', explanation: 'Comparative output advantage' },
    { word: 'equal', impact: 'neutral', explanation: 'Parity with global peers' },
    { word: 'less', impact: 'negative', explanation: 'Underperformance signal' },
    { word: 'substantially less', impact: 'negative', explanation: 'Severe domestic collapse' },
  ],
  'crude': [
    { word: 'clean renewable', impact: 'positive', explanation: 'Zero-carbon sustainable power' },
    { word: 'solar and wind', impact: 'positive', explanation: 'Green energy transition' },
    { word: 'refined domestic', impact: 'positive', explanation: 'High-value value-added fuel' },
    { word: 'fossil-heavy', impact: 'negative', explanation: 'Pollution-heavy framing' },
  ],
  'oil': [
    { word: 'energy', impact: 'positive', explanation: 'Comprehensive power grid output' },
    { word: 'petroleum', impact: 'neutral', explanation: 'Standard hydrocarbon term' },
    { word: 'clean power', impact: 'positive', explanation: 'Modern renewable transition' },
    { word: 'fossil fuel', impact: 'negative', explanation: 'Carbon emission rhetoric' },
  ],
  'nation': [
    { word: 'country', impact: 'neutral', explanation: 'Sovereign nation state' },
    { word: 'economy', impact: 'positive', explanation: 'Global economic market' },
    { word: 'competitor', impact: 'negative', explanation: 'Geopolitical rival' },
  ],
  'history': [
    { word: 'recorded history', impact: 'positive', explanation: 'Verified empirical timespan' },
    { word: 'modern times', impact: 'neutral', explanation: 'Contemporary era' },
    { word: 'recent decades', impact: 'neutral', explanation: 'Post-industrial timeframe' },
  ],
};

function lookupSynonyms(rawWord: string): WordOption[] {
  const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (EXTENSIVE_SYNONYM_DICT[clean]) {
    return EXTENSIVE_SYNONYM_DICT[clean];
  }
  const rawLower = rawWord.toLowerCase();
  if (EXTENSIVE_SYNONYM_DICT[rawLower]) {
    return EXTENSIVE_SYNONYM_DICT[rawLower];
  }
  return [];
}

export const LiveWordEditor: React.FC = () => {
  const { model } = useModel();
  const [currentPreset, setCurrentPreset] = useState<PresetSubstitution>(PRESET_SPIN_EXPERIMENTS[0]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [activeTokenIdx, setActiveTokenIdx] = useState<number | null>(null);
  const [customWordInput, setCustomWordInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Baseline & Modified Predictions
  const [basePrediction, setBasePrediction] = useState<PredictionResult | null>(null);
  const [modifiedPrediction, setModifiedPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    setTokens(currentPreset.originalText.split(' '));
    setActiveTokenIdx(null);
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

  // Focus input on active token
  useEffect(() => {
    if (activeTokenIdx !== null) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [activeTokenIdx]);

  const handleSelectPreset = (preset: PresetSubstitution) => {
    setCurrentPreset(preset);
    setTokens(preset.originalText.split(' '));
    setActiveTokenIdx(null);
    setCustomWordInput('');
  };

  const handleSwapWord = (idx: number, newWord: string) => {
    const originalWord = tokens[idx];
    const updated = [...tokens];
    
    // Preserve trailing punctuation from original token if present
    const trailingPunctMatch = originalWord.match(/[.,!?;:]+$/);
    const trailingPunct = trailingPunctMatch ? trailingPunctMatch[0] : '';
    
    // Check if new word already has punctuation
    const hasPunctAlready = /[.,!?;:]+$/.test(newWord);
    
    // Combine cleanly
    updated[idx] = hasPunctAlready ? newWord : `${newWord}${trailingPunct}`;
    
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
    setCustomWordInput('');
  };

  const handleReset = () => {
    setTokens(currentPreset.originalText.split(' '));
    setActiveTokenIdx(null);
    setCustomWordInput('');
  };

  // 🎲 Random Spin Generator: randomly flips 2 words to demonstrate instant score swing
  const handleRandomChaosSpin = () => {
    const updated = [...tokens];
    const eligibleIndices: number[] = [];
    tokens.forEach((w, i) => {
      const options = lookupSynonyms(w);
      if (options.length > 0) {
        eligibleIndices.push(i);
      }
    });

    if (eligibleIndices.length === 0) return;

    // Pick up to 2 random eligible words
    const shuffled = [...eligibleIndices].sort(() => 0.5 - Math.random()).slice(0, 2);
    shuffled.forEach((idx) => {
      const w = tokens[idx];
      const options = lookupSynonyms(w);
      if (options.length > 0) {
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        const trailingPunctMatch = w.match(/[.,!?;:]+$/);
        const trailingPunct = trailingPunctMatch ? trailingPunctMatch[0] : '';
        const hasPunctAlready = /[.,!?;:]+$/.test(randomOpt.word);
        updated[idx] = hasPunctAlready ? randomOpt.word : `${randomOpt.word}${trailingPunct}`;
      }
    });

    setTokens(updated);
    setActiveTokenIdx(null);
    setCustomWordInput('');
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
          Political Spin &amp; Word-Swap Simulator
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
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl relative">
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
          <div className="flex flex-wrap gap-2 text-base font-medium leading-relaxed bg-[#0B0F17] p-5 sm:p-6 rounded-xl border border-slate-800 min-h-[140px] items-center relative">
            {tokens.map((word, idx) => {
              const options = lookupSynonyms(word);
              const hasPresetSynonyms = options.length > 0;
              const isSelected = activeTokenIdx === idx;

              return (
                <div key={`${idx}-${word}`} className="relative inline-block">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTokenIdx(isSelected ? null : idx);
                      setCustomWordInput('');
                    }}
                    className={`px-3 py-1.5 rounded-xl transition-all font-mono text-xs sm:text-sm border font-bold cursor-pointer select-none relative z-10 ${
                      hasPresetSynonyms
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 shadow-[0_0_8px_#F59E0B22]'
                        : 'bg-[#111827] text-slate-200 border-slate-700 hover:border-slate-500'
                    } ${isSelected ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/30 text-white' : ''}`}
                  >
                    <span>{word}</span>
                    {hasPresetSynonyms && (
                      <span className="ml-1 text-[9px] text-amber-400 opacity-90">▾</span>
                    )}
                  </button>

                  {/* Popover for Synonym Selection & Custom Word Input */}
                  {isSelected && (
                    <>
                      {/* Transparent Backdrop to close on clicking anywhere outside */}
                      <div
                        className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTokenIdx(null);
                        }}
                      />

                      {/* Dropdown Popover */}
                      <div
                        className="fixed inset-x-4 top-1/3 sm:absolute sm:top-full sm:mt-2 sm:left-0 sm:inset-x-auto z-50 bg-[#1E293B] border border-amber-500/40 p-4 rounded-2xl max-w-xs sm:max-w-[300px] w-auto sm:w-[280px] space-y-3 font-mono shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider truncate mr-2">
                            Edit: &quot;{word}&quot;
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTokenIdx(null)}
                            className="text-xs text-slate-400 hover:text-white font-sans px-1.5 py-0.5 rounded hover:bg-slate-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Preset Options if Available */}
                        {hasPresetSynonyms ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Suggested Substitutes:
                            </span>
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                              {options.map((syn) => (
                                <button
                                  type="button"
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
                                  <span className="truncate">→ {syn.word}</span>
                                  <span className="text-[9px] uppercase font-bold opacity-80 flex-shrink-0 ml-1">
                                    {syn.impact === 'positive' ? '🟢 Fact' : syn.impact === 'negative' ? '🔴 Spin' : '🟡 Neutral'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            Type any custom word below to evaluate its effect on the model prediction:
                          </p>
                        )}

                        {/* Custom Word Input */}
                        <div className="pt-2 border-t border-slate-700 space-y-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Or Type Custom Word:
                          </span>
                          <div className="flex gap-1.5">
                            <input
                              ref={inputRef}
                              type="text"
                              value={customWordInput}
                              onChange={(e) => setCustomWordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCustomWordSubmit(idx);
                                }
                              }}
                              placeholder="e.g. verified, zero, record..."
                              className="flex-1 bg-[#0B0F17] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleCustomWordSubmit(idx)}
                              disabled={!customWordInput.trim()}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        {/* Delete Word Option */}
                        <div className="pt-1.5 border-t border-slate-700">
                          <button
                            type="button"
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  PredictionResult,
  SpeakerCredit,
  predictTruthfulness,
  predictWithSpeakerCredit,
  LABEL_COLORS,
  LABEL_DISPLAY_NAMES,
} from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import { Sliders, UserCheck, Info, RotateCcw, ShieldCheck, Database } from 'lucide-react';
import { TruthometerGauge } from './TruthometerGauge';

interface PoliticianPreset {
  name: string;
  party: string;
  credit: SpeakerCredit;
}

const PRESETS: PoliticianPreset[] = [
  {
    name: 'Barack Obama',
    party: 'Democrat',
    credit: { pants_fire_c: 9, false_c: 71, half_true_c: 160, mostly_true_c: 165, true_c: 124 },
  },
  {
    name: 'Donald Trump',
    party: 'Republican',
    credit: { pants_fire_c: 160, false_c: 340, half_true_c: 190, mostly_true_c: 110, true_c: 50 },
  },
  {
    name: 'Bernie Sanders',
    party: 'Independent',
    credit: { pants_fire_c: 0, false_c: 16, half_true_c: 42, mostly_true_c: 58, true_c: 40 },
  },
  {
    name: 'Hillary Clinton',
    party: 'Democrat',
    credit: { pants_fire_c: 7, false_c: 45, half_true_c: 75, mostly_true_c: 92, true_c: 81 },
  },
  {
    name: 'Joe Biden',
    party: 'Democrat',
    credit: { pants_fire_c: 14, false_c: 62, half_true_c: 98, mostly_true_c: 104, true_c: 76 },
  },
  {
    name: 'Deceptive Synthetic',
    party: 'Benchmark',
    credit: { pants_fire_c: 200, false_c: 150, half_true_c: 10, mostly_true_c: 0, true_c: 0 },
  },
  {
    name: 'Truthful Synthetic',
    party: 'Benchmark',
    credit: { pants_fire_c: 0, false_c: 0, half_true_c: 10, mostly_true_c: 150, true_c: 200 },
  },
];

export const SpeakerCredibilitySimulator: React.FC = () => {
  const { model } = useModel();
  const [statement, setStatement] = useState<string>(
    'Under my tax cut plan, the average family saved $2,000 every single year.'
  );
  const [speakerCredit, setSpeakerCredit] = useState<SpeakerCredit>({
    pants_fire_c: 10,
    false_c: 20,
    half_true_c: 30,
    mostly_true_c: 40,
    true_c: 50,
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [textOnlyPrediction, setTextOnlyPrediction] = useState<PredictionResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('Custom');

  useEffect(() => {
    if (!model || !statement.trim()) {
      setPrediction(null);
      setTextOnlyPrediction(null);
      return;
    }
    const base = predictTruthfulness(statement, '', model);
    const textOnlyRes = base;
    const conditionedRes = predictWithSpeakerCredit(base, speakerCredit);
    setTextOnlyPrediction(textOnlyRes);
    setPrediction(conditionedRes);
  }, [statement, speakerCredit, model]);

  const handleSelectPreset = (preset: PoliticianPreset) => {
    setSelectedPreset(preset.name);
    setSpeakerCredit(preset.credit);
  };

  const handleSliderChange = (key: keyof SpeakerCredit, val: number) => {
    setSelectedPreset('Custom');
    setSpeakerCredit((prev) => ({ ...prev, [key]: val }));
  };

  const totalRulings =
    speakerCredit.pants_fire_c +
    speakerCredit.false_c +
    (speakerCredit.barely_true_c || 0) +
    speakerCredit.half_true_c +
    speakerCredit.mostly_true_c +
    (speakerCredit.true_c || 0);

  // Compute Speaker Historical Credibility Score (0-100%)
  const trueCount = speakerCredit.true_c || 0;
  const barelyCount = speakerCredit.barely_true_c || 0;
  const weightedScore = totalRulings > 0
    ? ((trueCount * 1.0 + speakerCredit.mostly_true_c * 0.8 + speakerCredit.half_true_c * 0.5 + barelyCount * 0.2) / totalRulings) * 100
    : 50;
  const speakerCredibilityScore = Math.round(weightedScore);

  const getCredibilityBadge = (score: number) => {
    if (score >= 65) return { label: 'High Historical Credibility', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (score >= 45) return { label: 'Moderate / Mixed Record', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'High Historical Deceptive Risk', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  };

  const credBadge = getCredibilityBadge(speakerCredibilityScore);

  const deltaTruthScore = (prediction?.truthScore || 0) - (textOnlyPrediction?.truthScore || 0);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Speaker Prior Conditioning • Feature Engineering</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Speaker Credibility & Historical Track Record Simulator
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Test how a speaker&apos;s historical ruling vector conditions the Bayesian prior distribution of truthfulness predictions.
        </p>
      </div>

      {/* Presets & Dataset Citation Banner */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Historical Track Record Presets (PolitiFact LIAR-PLUS Archive):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                  selectedPreset === p.name
                    ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {p.name} ({p.party})
              </button>
            ))}
          </div>
        </div>

        {/* Dataset Citation Notice */}
        <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-400 font-mono">
          <Database className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Dataset Sourcing Citation:</strong> Preset ruling distributions reflect historical claim samples from the <em className="text-indigo-300">LIAR-PLUS Benchmark Dataset</em> (Wang et al., 2018; PolitiFact sample archive). Preset values serve as empirical sample distributions for prior-conditioning NLP experiments.
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Statement Input (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Claim Input Box */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <label className="block text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center">
              <span>Test Statement Claim</span>
              <span className="text-slate-400 text-[10px]">Editable Input</span>
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-800 focus:border-indigo-500/80 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none leading-relaxed"
              placeholder="Enter a claim..."
            />
          </div>

          {/* Speaker Ruling Counts Sliders & Credibility Index Meter */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Speaker Ruling Counts ({totalRulings} total claims)
              </span>
              <button
                onClick={() =>
                  setSpeakerCredit({
                    pants_fire_c: 0,
                    false_c: 0,
                    half_true_c: 0,
                    mostly_true_c: 0,
                    true_c: 0,
                  })
                }
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Counts
              </button>
            </div>

            {/* Historical Credibility Meter */}
            <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Historical Credibility Rating:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${credBadge.color}`}>
                  {credBadge.label}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-200">{selectedPreset} Track Record Score</span>
                <span className="text-amber-400">{speakerCredibilityScore}% Credible</span>
              </div>
              <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${speakerCredibilityScore}%` }}
                />
              </div>
            </div>

            {/* 5 Sliders */}
            <div className="space-y-4 font-mono">
              <SliderRow
                label="Pants on Fire Rulings"
                val={speakerCredit.pants_fire_c}
                color="#DC2626"
                onChange={(v) => handleSliderChange('pants_fire_c', v)}
              />
              <SliderRow
                label="False Rulings"
                val={speakerCredit.false_c}
                color="#EA580C"
                onChange={(v) => handleSliderChange('false_c', v)}
              />
              <SliderRow
                label="Half-True Rulings"
                val={speakerCredit.half_true_c}
                color="#CA8A04"
                onChange={(v) => handleSliderChange('half_true_c', v)}
              />
              <SliderRow
                label="Mostly-True Rulings"
                val={speakerCredit.mostly_true_c}
                color="#65A30D"
                onChange={(v) => handleSliderChange('mostly_true_c', v)}
              />
              <SliderRow
                label="True Rulings"
                val={speakerCredit.true_c || 0}
                color="#059669"
                onChange={(v) => handleSliderChange('true_c', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Bayesian Shift Comparison & Radial Truthometer Gauge (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Bayesian Shift Delta Card */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Live Bayesian Prior Shift Analysis
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Text-Only (No Prior)</span>
                <span className="text-sm font-bold text-white block">
                  {textOnlyPrediction?.topLabel ? LABEL_DISPLAY_NAMES[textOnlyPrediction.topLabel] : 'False'}
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Score: {textOnlyPrediction?.truthScore || 50}/100
                </span>
              </div>

              <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-amber-500/30 space-y-1">
                <span className="text-[10px] text-amber-400 uppercase block font-bold">Speaker Conditioned</span>
                <span className="text-sm font-bold text-amber-300 block">
                  {prediction?.topLabel ? LABEL_DISPLAY_NAMES[prediction.topLabel] : 'False'}
                </span>
                <span className="text-amber-400 text-[11px] block font-bold">
                  Score: {prediction?.truthScore || 50}/100 ({deltaTruthScore >= 0 ? `+${deltaTruthScore}` : deltaTruthScore} Shift)
                </span>
              </div>
            </div>
          </div>

          {/* Truthometer & Probabilities */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider text-center border-b border-slate-800 pb-3">
              Speaker Prior Conditioned Verdict
            </h3>

            {prediction ? (
              <>
                <TruthometerGauge
                  score={prediction.truthScore}
                  topLabel={prediction.topLabel}
                  confidence={prediction.confidence}
                />

                {/* Probabilities Distribution */}
                <div className="space-y-2 pt-4 border-t border-slate-800 font-mono">
                  {prediction.probabilities.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{LABEL_DISPLAY_NAMES[item.label]}</span>
                        <span className="font-bold text-white">
                          {Math.round(item.prob * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(item.prob * 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12">Loading simulator...</p>
            )}
          </div>

          <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
              <Info className="w-4 h-4" />
              <span>Bayesian Conditioning Note:</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Combining text TF-IDF vectors with 5-dimensional speaker credit metadata (<code className="text-amber-300 font-mono">scipy.sparse.hstack</code>) conditions prior likelihoods, adjusting posterior probabilities according to historical speaker credibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

interface SliderRowProps {
  label: string;
  val: number;
  color: string;
  onChange: (val: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, val, color, onChange }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-300 flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{label}</span>
        </span>
        <span className="font-mono font-bold text-white">{val}</span>
      </div>
      <input
        type="range"
        min={0}
        max={300}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#0B0F17] rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );
};

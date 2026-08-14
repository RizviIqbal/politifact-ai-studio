'use client';

import React, { useState, useEffect } from 'react';
import {
  ModelPayload,
  PredictionResult,
  predictTruthfulness,
  LABEL_COLORS,
  LABEL_DISPLAY_NAMES,
} from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import { Sliders, Settings2, RefreshCw, HelpCircle, Zap, Info, Sparkles } from 'lucide-react';
import { TruthometerGauge } from './TruthometerGauge';

export const HyperparameterSandbox: React.FC = () => {
  const { model: baseModel } = useModel();
  const [statement, setStatement] = useState<string>(
    'The federal administration passed a new tax bill to expand middle class healthcare coverage.'
  );

  // Hyperparameters State
  const [regC, setRegC] = useState<number>(1.0);
  const [sublinearTf, setSublinearTf] = useState<boolean>(false);
  const [ngramMode, setNgramMode] = useState<'unigram' | 'both'>('both');
  const [customPrediction, setCustomPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    if (!baseModel || !statement.trim()) {
      setCustomPrediction(null);
      return;
    }

    const tunedModel: ModelPayload = {
      ...baseModel,
      sublinear_tf: sublinearTf,
      ngram_range: ngramMode === 'unigram' ? [1, 1] : [1, 2],
      coefficients: baseModel.coefficients.map((row) =>
        row.map((val) => val * Math.sqrt(regC))
      ),
    };

    const res = predictTruthfulness(statement, '', tunedModel);
    setCustomPrediction(res);
  }, [statement, regC, sublinearTf, ngramMode, baseModel]);

  const handleResetHyperparams = () => {
    setRegC(1.0);
    setSublinearTf(false);
    setNgramMode('both');
  };

  // Dynamic Plain-English Explanation Banner Text
  const getLiveEffectText = () => {
    const cDescription =
      regC < 0.5
        ? 'Model is cautious & heavily regularized (-50% keyword sensitivity).'
        : regC > 2.0
        ? 'Model is strict & aggressive (+100% keyword sensitivity).'
        : 'Model is at standard baseline strictness (C = 1.0).';

    const ngramDescription =
      ngramMode === 'both'
        ? 'Analyzing 2-word phrase patterns (e.g. "middle class", "tax bill").'
        : 'Analyzing single isolated words only.';

    const tfDescription = sublinearTf
      ? 'Sublinear term frequency active: tf_scaled = 1 + log(tf).'
      : 'Standard linear term frequency active.';

    return `${cDescription} ${ngramDescription} ${tfDescription}`;
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Settings2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive Model Optimization & Hyperparameter Studio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Live Model Hyperparameter Sandbox
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Adjust model strictness (L2 penalty $C$), phrase n-gram memory, and sublinear TF scaling in real time. Observe how tuning parameters shifts probability calibration.
        </p>
      </div>

      {/* Academic Purpose Callout */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-3 font-sans shadow-xl">
        <div className="flex items-center space-x-2 text-purple-300 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider border-b border-slate-800 pb-3">
          <Info className="w-4 h-4 text-purple-400" />
          <span>&quot;What is the Purpose of Hyperparameter Tuning?&quot; (Engineering Rationale)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          In natural language processing, an untuned model might overreact to a single highly weighted term like <em className="text-white font-mono">&quot;tax&quot;</em> and produce extreme peak probabilities. <strong className="text-white">Hyperparameters</strong> allow NLP engineers to regularize weight magnitudes, evaluate bigram collocations like <em className="text-white font-mono">&quot;middle class&quot;</em>, and dampen term repetition through logarithmic sublinear scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs sm:text-sm font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Hyperparameter Controls
              </span>
              <button
                onClick={handleResetHyperparams}
                className="text-xs font-mono text-purple-300 hover:text-white flex items-center gap-1 font-bold bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            </div>

            {/* Test Claim Box */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                Test Claim Sentence (Editable):
              </label>
              <textarea
                rows={2}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm font-sans text-white focus:outline-none focus:border-purple-500 font-medium resize-none"
                placeholder="Enter any claim to test tuning sensitivity..."
              />
            </div>

            {/* Control 1: Regularization Inverse C */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-white font-bold">
                  1. Regularization Constant (Inverse Penalty C):
                </span>
                <span className="text-purple-300 font-bold">C = {regC.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={5.0}
                step={0.05}
                value={regC}
                onChange={(e) => setRegC(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-xs text-slate-300 font-sans leading-normal bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
                💡 <strong className="text-purple-300 font-mono">Low C (&lt;0.5):</strong> Strong L2 penalty (smooth, cautious probabilities). <strong className="text-purple-300 font-mono">High C (&gt;2.0):</strong> Weak penalty (amplified sensitivity to distinct tokens).
              </p>
            </div>

            {/* Control 2: N-gram Range */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs sm:text-sm font-mono text-white block font-bold">
                2. N-Gram Vocabulary Extraction Window:
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <button
                  onClick={() => setNgramMode('unigram')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm border transition-all font-bold ${
                    ngramMode === 'unigram'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Unigrams (1,1) Only
                </button>
                <button
                  onClick={() => setNgramMode('both')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm border transition-all font-bold ${
                    ngramMode === 'both'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Unigrams + Bigrams (1,2)
                </button>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-normal bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
                💡 Adding bigrams enables the model to evaluate multi-word political collocations like <em className="text-white font-mono">&quot;middle class&quot;</em> or <em className="text-white font-mono">&quot;tax cut&quot;</em>.
              </p>
            </div>

            {/* Control 3: Sublinear TF */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono text-white font-bold">3. Sublinear Term Frequency Scaling</span>
                <button
                  onClick={() => setSublinearTf(!sublinearTf)}
                  className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-mono border transition-all ${
                    sublinearTf
                      ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md'
                      : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {sublinearTf ? 'Active (1 + log(tf))' : 'Disabled (Linear)'}
                </button>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-normal bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
                💡 Applies logarithmic damping to term frequencies, preventing repeated words from dominating the logit calculation.
              </p>
            </div>

            {/* Dynamic Effect Banner */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 space-y-1">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Model Parameter Calibration:</span>
              </span>
              <p className="font-sans text-slate-200 text-xs leading-relaxed">{getLiveEffectText()}</p>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white text-center font-masthead border-b border-slate-800 pb-3">
              Tuned Model Prediction & Calibration Distribution
            </h3>

            {customPrediction ? (
              <>
                <TruthometerGauge
                  score={customPrediction.truthScore}
                  topLabel={customPrediction.topLabel}
                  confidence={customPrediction.confidence}
                />

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    Tuned Softmax Probability Spectrum:
                  </span>
                  {customPrediction.probabilities.map((item) => (
                    <div key={item.label} className="space-y-1 font-sans">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{LABEL_DISPLAY_NAMES[item.label]}</span>
                        <span className="text-indigo-400 font-mono font-bold">
                          {(item.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0B0F17] rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(item.prob * 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  <span>Shannon Entropy: {customPrediction.entropy} bits</span>
                  <span>Latency: {customPrediction.latency} ms</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8 font-mono">Calculating tuned model weights...</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

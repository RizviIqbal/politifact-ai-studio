'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ModelPayload,
  PredictionResult,
  predictTruthfulness,
  LABEL_COLORS,
  LABEL_DISPLAY_NAMES,
  tokenizeAndExtractNgrams,
  LiveEngineType,
  AVAILABLE_ENGINES,
} from '../lib/inference';
import { useModel } from '../lib/ModelContext';
import {
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  Cpu,
  Network,
  BarChart3,
  Sliders,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Trees,
  Bot,
  Activity,
} from 'lucide-react';

interface MultiModelComparisonMatrixProps {
  statement?: string;
  justification?: string;
}

export interface DetailedModelBenchmark {
  id: string;
  name: string;
  shortName: string;
  family: 'Transformer' | 'RNN' | 'Classical';
  representation: string;
  // Exact notebook metrics
  stmtOnlyAcc: number;
  stmtOnlyMacroF1: number;
  stmtOnlyWeightedF1: number;
  stmtJustAcc: number;
  stmtJustMacroF1: number;
  stmtJustWeightedF1: number;
  params: string;
  latencyEst: string;
  color: string;
  badge?: string;
  isLive: boolean; // true = deployed for zero-latency client inference
  mechanismTitle: string;
  mechanismExplain: string;
  mathematicalFormula: string;
  anomalyNote?: string;
}

// 10 key benchmark models evaluated in the notebook
const BENCHMARK_MODELS: DetailedModelBenchmark[] = [
  {
    id: 'bert',
    name: 'BERT Base (Fine-Tuned)',
    shortName: 'BERT Base',
    family: 'Transformer',
    representation: '768d Contextual (12-Layer Self-Attention)',
    stmtOnlyAcc: 0.271065,
    stmtOnlyMacroF1: 0.268408,
    stmtOnlyWeightedF1: 0.267840,
    stmtJustAcc: 0.269475,
    stmtJustMacroF1: 0.253599,
    stmtJustWeightedF1: 0.262990,
    params: '110M Params',
    latencyEst: '18.5ms (Live)',
    color: '#8B5CF6',
    badge: '⚡ LIVE DEPLOYED ENGINE',
    isLive: true,
    mechanismTitle: '12-Layer Multi-Head Self-Attention Transformer',
    mechanismExplain:
      'BERT computes dense 768-dimensional bidirectional representations across all token positions simultaneously. Multi-head self-attention captures multi-word phrase dependencies ("cdc secretly admitted") as unified semantic stances rather than isolated words.',
    mathematicalFormula:
      'Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V  where Q,K,V in R^{N x 768}',
  },
  {
    id: 'rf-w2v',
    name: 'Random Forest (Word2Vec)',
    shortName: 'RF Word2Vec',
    family: 'Classical',
    representation: 'Word2Vec Dense Average Embeddings',
    stmtOnlyAcc: 0.278219,
    stmtOnlyMacroF1: 0.240183,
    stmtOnlyWeightedF1: 0.260755,
    stmtJustAcc: 0.243243,
    stmtJustMacroF1: 0.193665,
    stmtJustWeightedF1: 0.220786,
    params: '100 Trees',
    latencyEst: '1.2ms (Live)',
    color: '#3B82F6',
    badge: '⚡ LIVE DEPLOYED ENGINE',
    isLive: true,
    mechanismTitle: '100 Non-Linear Decision Trees on Word2Vec Averages',
    mechanismExplain:
      'Averages 100 decorrelated decision tree votes evaluated on continuous vector averages. Captures non-linear semantic clusters, achieving the highest raw test accuracy (27.82%) on statement-only text.',
    mathematicalFormula:
      'y_hat = argmax_c (1/100 * sum_{t=1}^{100} I(Tree_t(x_w2v) == c))',
  },
  {
    id: 'rf-tfidf',
    name: 'Random Forest (TF-IDF)',
    shortName: 'RF TF-IDF',
    family: 'Classical',
    representation: 'TF-IDF (1,2) N-Grams (5,000 Vocab)',
    stmtOnlyAcc: 0.252782,
    stmtOnlyMacroF1: 0.247355,
    stmtOnlyWeightedF1: 0.250899,
    stmtJustAcc: 0.220986,
    stmtJustMacroF1: 0.202150,
    stmtJustWeightedF1: 0.218740,
    params: '100 Trees',
    latencyEst: '~8ms',
    color: '#2563EB',
    badge: 'BEST CLASSICAL F1',
    isLive: false,
    mechanismTitle: 'Ensemble Decision Trees on Sparse TF-IDF N-Grams',
    mechanismExplain:
      'Evaluates non-linear decision splits over 5,000 sparse unigrams/bigrams. Reaches 0.2474 Macro-F1, outperforming linear models on complex multi-word claim combinations.',
    mathematicalFormula:
      'Split(S) = argmax_f [ Gini(S) - (|S_L|/|S|)*Gini(S_L) - (|S_R|/|S|)*Gini(S_R) ]',
  },
  {
    id: 'bigru',
    name: 'Bidirectional GRU',
    shortName: 'BiGRU',
    family: 'RNN',
    representation: 'Bidirectional Recurrent Hidden States (100d)',
    stmtOnlyAcc: 0.241653,
    stmtOnlyMacroF1: 0.231419,
    stmtOnlyWeightedF1: 0.236371,
    stmtJustAcc: 0.221781,
    stmtJustMacroF1: 0.211913,
    stmtJustWeightedF1: 0.212379,
    params: '~320K Params',
    latencyEst: '~18ms',
    color: '#14B8A6',
    badge: 'TOP RNN F1',
    isLive: false,
    mechanismTitle: 'Bidirectional Gated Recurrent Unit (Forward + Backward)',
    mechanismExplain:
      'Uses reset and update gates in both forward and reverse sequence directions. Preserves word order and negation stances with lower computational cost than BiLSTM, reaching 0.2314 Macro-F1.',
    mathematicalFormula:
      'h_t = [h_fwd_t; h_bwd_t],  z_t = sigma(W_z x_t + U_z h_{t-1}),  r_t = sigma(W_r x_t + U_r h_{t-1})',
  },
  {
    id: 'bilstm',
    name: 'Bidirectional LSTM',
    shortName: 'BiLSTM',
    family: 'RNN',
    representation: 'Dual-Pass Recurrent Cell States (100d)',
    stmtOnlyAcc: 0.232114,
    stmtOnlyMacroF1: 0.229443,
    stmtOnlyWeightedF1: 0.228983,
    stmtJustAcc: 0.230525,
    stmtJustMacroF1: 0.224345,
    stmtJustWeightedF1: 0.224613,
    params: '~420K Params',
    latencyEst: '4.8ms (Live)',
    color: '#10B981',
    badge: '⚡ LIVE DEPLOYED ENGINE',
    isLive: true,
    mechanismTitle: 'Dual-Pass Bidirectional Long Short-Term Memory',
    mechanismExplain:
      'Separate input, forget, and output gating mechanisms maintain long-term context across lengthy political statements, avoiding vanishing gradient degradation.',
    mathematicalFormula:
      'f_t = sigma(W_f x_t + U_f h_{t-1} + b_f),  c_t = f_t * c_{t-1} + i_t * tanh(W_c x_t + U_c h_{t-1})',
  },
  {
    id: 'logreg-tfidf',
    name: 'Logistic Regression (TF-IDF)',
    shortName: 'LogReg TF-IDF',
    family: 'Classical',
    representation: 'TF-IDF (1,2) N-Grams (5,000 Vocab, Balanced)',
    stmtOnlyAcc: 0.240859,
    stmtOnlyMacroF1: 0.238180,
    stmtOnlyWeightedF1: 0.241790,
    stmtJustAcc: 0.218601,
    stmtJustMacroF1: 0.202809,
    stmtJustWeightedF1: 0.213144,
    params: '30,006 Coefs',
    latencyEst: '0.1ms (Live)',
    color: '#6366F1',
    badge: '⚡ LIVE DEPLOYED ENGINE',
    isLive: true,
    mechanismTitle: 'L2-Regularized Multinomial Logistic Regression',
    mechanismExplain:
      'Computes exact linear logit dot products: z_k = Intercept_k + sum(Coef_{k,j} * TF-IDF_j) across 5,000 learned vocabulary terms with balanced class weighting. Deployed directly into TypeScript for zero-latency client-side execution.',
    mathematicalFormula:
      'P(y = k | x) = exp(z_k) / sum_{j=1}^6 exp(z_j)  where z_k = b_k + w_k^T x_norm',
  },
  {
    id: 'nb-tfidf',
    name: 'Multinomial Naive Bayes',
    shortName: 'Naive Bayes',
    family: 'Classical',
    representation: 'TF-IDF Unigram/Bigram Frequencies',
    stmtOnlyAcc: 0.243243,
    stmtOnlyMacroF1: 0.217135,
    stmtOnlyWeightedF1: 0.237521,
    stmtJustAcc: 0.236089,
    stmtJustMacroF1: 0.212081,
    stmtJustWeightedF1: 0.227780,
    params: '30,000 Probs',
    latencyEst: '<1ms',
    color: '#F59E0B',
    isLive: false,
    mechanismTitle: 'Multinomial Conditional Independence Likelihood Product',
    mechanismExplain:
      'Calculates class posteriors using Bayes Rule under the conditional feature independence assumption. High-frequency discriminative unigrams produce decisive peak posteriors.',
    mathematicalFormula:
      'P(C_k | X) proportional to P(C_k) * prod_{i=1}^n P(w_i | C_k)^{x_i}',
  },
  {
    id: 'lstm',
    name: 'Unidirectional LSTM',
    shortName: 'LSTM',
    family: 'RNN',
    representation: 'Unidirectional Recurrent Cell (100d)',
    stmtOnlyAcc: 0.233704,
    stmtOnlyMacroF1: 0.224307,
    stmtOnlyWeightedF1: 0.226419,
    stmtJustAcc: 0.190779,
    stmtJustMacroF1: 0.091881,
    stmtJustWeightedF1: 0.104172,
    params: '~210K Params',
    latencyEst: '~14ms',
    color: '#EC4899',
    isLive: false,
    mechanismTitle: 'Single-Pass Left-to-Right LSTM',
    mechanismExplain:
      'Processes claims strictly left-to-right. Operates reliably on statement text (0.2243 F1) but suffers significant degradation when concatenated with long justification text.',
    mathematicalFormula:
      'h_t = o_t * tanh(c_t),  o_t = sigma(W_o x_t + U_o h_{t-1} + b_o)',
    anomalyNote:
      '⚠️ Evidence Degradation: Concatenating justification text causes Macro-F1 to plummet from 0.2243 down to 0.0919.',
  },
  {
    id: 'gru',
    name: 'Unidirectional GRU',
    shortName: 'GRU',
    family: 'RNN',
    representation: 'Unidirectional Gated Recurrent Cell (100d)',
    stmtOnlyAcc: 0.234499,
    stmtOnlyMacroF1: 0.212588,
    stmtOnlyWeightedF1: 0.217459,
    stmtJustAcc: 0.205087,
    stmtJustMacroF1: 0.076217,
    stmtJustWeightedF1: 0.091344,
    params: '~160K Params',
    latencyEst: '~11ms',
    color: '#EF4444',
    badge: '⚠️ MODE COLLAPSE',
    isLive: false,
    mechanismTitle: 'Single-Pass Gated Recurrent Unit',
    mechanismExplain:
      'Solid performance on statement-only claims (0.2126 F1), but single-pass recurrence suffers gradient instability on concatenated evidence inputs.',
    mathematicalFormula:
      'h_t = (1 - z_t) * h_{t-1} + z_t * h_tilde_t',
    anomalyNote:
      '⚠️ Severe Mode Collapse: On statement+justification input, Macro-F1 collapses to 0.0762 (defaults to predicting dominant majority classes).',
  },
  {
    id: 'simplernn',
    name: 'Simple RNN (Elman Network)',
    shortName: 'Simple RNN',
    family: 'RNN',
    representation: 'Vanilla Recurrent Hidden State (100d)',
    stmtOnlyAcc: 0.143879,
    stmtOnlyMacroF1: 0.132868,
    stmtOnlyWeightedF1: 0.130045,
    stmtJustAcc: 0.171701,
    stmtJustMacroF1: 0.118469,
    stmtJustWeightedF1: 0.130829,
    params: '~80K Params',
    latencyEst: '~6ms',
    color: '#64748B',
    badge: 'BASELINE RNN',
    isLive: false,
    mechanismTitle: 'Vanilla Elman Recurrent Neural Network',
    mechanismExplain:
      'Basic non-gated recurrent network. Severe vanishing gradients across sentence sequences limit its learning capacity (0.1329 Macro-F1).',
    mathematicalFormula:
      'h_t = tanh(W x_t + U h_{t-1} + b)',
  },
];

export const MultiModelComparisonMatrix: React.FC<MultiModelComparisonMatrixProps> = ({
  statement: propStatement,
  justification: propJustification,
}) => {
  const [statement, setStatement] = useState<string>(
    propStatement || 'The CDC secretly admitted in court documents that COVID vaccines contain microchips.'
  );
  const [justification, setJustification] = useState<string>(propJustification || '');
  const { model: modelWeights } = useModel();
  const [familyFilter, setFamilyFilter] = useState<'All' | 'Transformer' | 'RNN' | 'Classical'>('All');
  const [selectedComparePair, setSelectedComparePair] = useState<[string, string]>(['logreg-tfidf', 'bert']);
  const [expandedModelId, setExpandedModelId] = useState<string | null>('logreg-tfidf');
  const [selectedEngine, setSelectedEngine] = useState<LiveEngineType>('logreg');
  const [viewMetric, setViewMetric] = useState<'macroF1' | 'accuracy' | 'weightedF1'>('macroF1');
  const [inputCondition, setInputCondition] = useState<'stmt_only' | 'stmt_just'>('stmt_only');

  useEffect(() => {
    if (propStatement !== undefined) setStatement(propStatement);
  }, [propStatement]);

  useEffect(() => {
    if (propJustification !== undefined) setJustification(propJustification);
  }, [propJustification]);

  // Real client-side multi-model inference
  const liveResult = useMemo(() => {
    if (!modelWeights || !statement.trim()) return null;
    return predictTruthfulness(statement, justification, modelWeights, selectedEngine);
  }, [statement, justification, modelWeights, selectedEngine]);

  // Token breakdown
  const userNgrams = statement.trim() ? tokenizeAndExtractNgrams(statement) : [];
  const recognizedTerms = modelWeights
    ? userNgrams.filter((term) => term in modelWeights.vocabulary)
    : [];

  // Filtered models
  const filteredModels = useMemo(() => {
    if (familyFilter === 'All') return BENCHMARK_MODELS;
    return BENCHMARK_MODELS.filter((m) => m.family === familyFilter);
  }, [familyFilter]);

  const modelA = BENCHMARK_MODELS.find((m) => m.id === selectedComparePair[0]) || BENCHMARK_MODELS[5];
  const modelB = BENCHMARK_MODELS.find((m) => m.id === selectedComparePair[1]) || BENCHMARK_MODELS[0];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Multi-Architecture Benchmark & Quantitative Matrix</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Comprehensive 10-Model Empirical Benchmark
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Ground-truth test set metrics across <strong className="text-white">10 NLP architectures</strong> evaluated on the LIAR-PLUS dataset. Explore real empirical metrics, architectural trade-offs, and live inference across 4 deployed engines.
        </p>
      </div>

      {/* Live Inference Workbench for Typed Input */}
      <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="font-masthead text-base font-bold text-white">
              Live Multi-Model Inference Workbench (4 Interactive Architectures)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
            4 Live Deployed Engines • Real-Time Client Execution
          </span>
        </div>

        {/* Engine Switcher Grid inside Hub 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-xs">
          {AVAILABLE_ENGINES.map((engine) => {
            const isEngineActive = selectedEngine === engine.id;
            return (
              <button
                key={engine.id}
                onClick={() => setSelectedEngine(engine.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 shadow-sm ${
                  isEngineActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-[#0B0F17] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {engine.id === 'logreg' && <Cpu className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  {engine.id === 'rf' && <Trees className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {engine.id === 'bilstm' && <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  {engine.id === 'bert' && <Bot className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  <span className="truncate text-xs">{engine.shortName}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono whitespace-nowrap flex-shrink-0">
                  {engine.latencyEstimate}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Input Textarea */}
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Test Claim Statement:</span>
              <span className="text-indigo-400 font-mono">
                {recognizedTerms.length > 0
                  ? `Vocabulary Matches: ${recognizedTerms.length} / ${userNgrams.length} terms`
                  : 'Type a claim to test'}
              </span>
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl p-3.5 text-sm font-sans text-white focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="Enter any claim sentence..."
            />

            {/* Token Feature Tags */}
            {liveResult && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Active Feature Coefficients (Learned Linear Weights):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {liveResult.tokens
                    .filter((t) => Math.abs(t.weight) > 0.01)
                    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
                    .slice(0, 12)
                    .map((token, idx) => {
                      const isPos = token.weight > 0;
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            token.impact === 'deceptive'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : token.impact === 'truthful'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          <strong>{token.token}</strong>: {isPos ? '+' : ''}
                          {token.weight}
                        </span>
                      );
                    })}
                  {recognizedTerms.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic font-mono">
                      No exact vocabulary matches in input.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Verdict & Distribution Card */}
          <div className="lg:col-span-5 bg-[#0B0F17] border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
            {liveResult ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Model Verdict</span>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded text-xs font-bold text-white uppercase tracking-wider mt-0.5"
                      style={{ backgroundColor: LABEL_COLORS[liveResult.topLabel] || '#6366F1' }}
                    >
                      {LABEL_DISPLAY_NAMES[liveResult.topLabel]}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Truth Score</span>
                    <span className="text-xl font-bold text-white font-sans">
                      {liveResult.truthScore}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </span>
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-1.5">
                  {liveResult.probabilities.map((p) => (
                    <div key={p.label} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between font-sans">
                        <span className="text-slate-300">{LABEL_DISPLAY_NAMES[p.label]}</span>
                        <span className="text-indigo-400 font-mono font-bold">
                          {(p.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(p.prob * 100)}%`,
                            backgroundColor: p.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Execution Stats */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Entropy: {liveResult.entropy} bits</span>
                  <span>Latency: {liveResult.latency}ms</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                Enter text on the left to run inference...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Metric Selection */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
        {/* Family Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase">Architecture:</span>
          {(['All', 'Transformer', 'RNN', 'Classical'] as const).map((fam) => (
            <button
              key={fam}
              onClick={() => setFamilyFilter(fam)}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                familyFilter === fam
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fam}
            </button>
          ))}
        </div>

        {/* Condition Toggle & Metric Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#0B0F17] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setInputCondition('stmt_only')}
              className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                inputCondition === 'stmt_only'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Statement Only
            </button>
            <button
              onClick={() => setInputCondition('stmt_just')}
              className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                inputCondition === 'stmt_just'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stmt + Evidence
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Sort Metric:</span>
            <select
              value={viewMetric}
              onChange={(e) => setViewMetric(e.target.value as 'macroF1' | 'accuracy' | 'weightedF1')}
              className="bg-[#0B0F17] border border-slate-800 text-white rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="macroF1">Macro-F1</option>
              <option value="accuracy">Accuracy</option>
              <option value="weightedF1">Weighted-F1</option>
            </select>
          </div>
        </div>
      </div>

      {/* 10-Model Empirical Benchmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels
          .slice()
          .sort((a, b) => {
            const getVal = (m: DetailedModelBenchmark) => {
              if (viewMetric === 'macroF1') {
                return inputCondition === 'stmt_only' ? m.stmtOnlyMacroF1 : m.stmtJustMacroF1;
              }
              if (viewMetric === 'accuracy') {
                return inputCondition === 'stmt_only' ? m.stmtOnlyAcc : m.stmtJustAcc;
              }
              return inputCondition === 'stmt_only' ? m.stmtOnlyWeightedF1 : m.stmtJustWeightedF1;
            };
            return getVal(b) - getVal(a);
          })
          .map((m) => {
            const isExpanded = expandedModelId === m.id;
            const curAcc = inputCondition === 'stmt_only' ? m.stmtOnlyAcc : m.stmtJustAcc;
            const curMacroF1 = inputCondition === 'stmt_only' ? m.stmtOnlyMacroF1 : m.stmtJustMacroF1;
            const curWeightedF1 = inputCondition === 'stmt_only' ? m.stmtOnlyWeightedF1 : m.stmtJustWeightedF1;
            const f1Delta = m.stmtJustMacroF1 - m.stmtOnlyMacroF1;

            return (
              <div
                key={m.id}
                className={`bg-[#111827] p-5 rounded-2xl border transition-all space-y-4 shadow-xl relative ${
                  m.isLive
                    ? 'border-indigo-500/60 shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {m.family} • {m.params}
                    </span>
                    <h3 className="text-base font-bold text-white font-sans mt-0.5">
                      {m.name}
                    </h3>
                  </div>
                  {m.badge && (
                    <span
                      className="text-[9px] font-mono font-extrabold text-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>

                {/* Primary Metric Score Cards */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-[#0B0F17] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Macro-F1</span>
                    <span className="text-sm font-bold text-amber-400">
                      {curMacroF1.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-[#0B0F17] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
                    <span className="text-sm font-bold text-white">
                      {(curAcc * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-[#0B0F17] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Weighted-F1</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {curWeightedF1.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Evidence Ablation Impact Tag */}
                <div className="flex items-center justify-between text-xs font-mono bg-[#0B0F17] p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Evidence Impact (Δ F1):</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      f1Delta > 0.005
                        ? 'text-emerald-400'
                        : f1Delta < -0.01
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {f1Delta > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : f1Delta < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : null}
                    {f1Delta > 0 ? '+' : ''}
                    {(f1Delta * 100).toFixed(2)}%
                  </span>
                </div>

                {/* Anomaly Note if any */}
                {m.anomalyNote && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 font-sans">
                    {m.anomalyNote}
                  </div>
                )}

                {/* Expand / Collapse Architectural Deep-Dive */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setExpandedModelId(isExpanded ? null : m.id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#0B0F17] hover:bg-slate-900 text-indigo-400 hover:text-indigo-300 text-xs font-mono font-bold transition-all flex items-center justify-between border border-slate-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Architecture & Math Details</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0B0F17] border border-indigo-500/30 text-xs space-y-2.5 font-mono animate-fade-in">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                          {m.mechanismTitle}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {m.mechanismExplain}
                        </p>
                      </div>

                      <div className="bg-[#111827] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                          Mathematical Formulation:
                        </span>
                        <code className="text-[10px] text-emerald-300 font-mono block overflow-x-auto whitespace-pre-wrap">
                          {m.mathematicalFormula}
                        </code>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Representation: {m.representation}</span>
                        <span>Latency: {m.latencyEst}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Head-to-Head Architectural Difference Inspector */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Head-to-Head Architecture Differential Inspector</span>
          </div>

          {/* Model Pair Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedComparePair[0]}
              onChange={(e) => setSelectedComparePair([e.target.value, selectedComparePair[1]])}
              className="bg-[#0B0F17] border border-slate-800 text-white rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:border-amber-500 text-xs"
            >
              {BENCHMARK_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.shortName}
                </option>
              ))}
            </select>
            <span className="text-slate-400 font-bold">vs</span>
            <select
              value={selectedComparePair[1]}
              onChange={(e) => setSelectedComparePair([selectedComparePair[0], e.target.value])}
              className="bg-[#0B0F17] border border-slate-800 text-white rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:border-amber-500 text-xs"
            >
              {BENCHMARK_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Metric Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Comparison 1: Macro-F1 */}
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Macro-F1 (Statement Only)
            </span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelA.shortName}</span>
                  <span>{modelA.stmtOnlyMacroF1.toFixed(4)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelA.stmtOnlyMacroF1 / 0.3) * 100}%`,
                      backgroundColor: modelA.color,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelB.shortName}</span>
                  <span>{modelB.stmtOnlyMacroF1.toFixed(4)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelB.stmtOnlyMacroF1 / 0.3) * 100}%`,
                      backgroundColor: modelB.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison 2: Test Accuracy */}
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Test Accuracy (Statement Only)
            </span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelA.shortName}</span>
                  <span>{(modelA.stmtOnlyAcc * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelA.stmtOnlyAcc / 0.35) * 100}%`,
                      backgroundColor: modelA.color,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelB.shortName}</span>
                  <span>{(modelB.stmtOnlyAcc * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelB.stmtOnlyAcc / 0.35) * 100}%`,
                      backgroundColor: modelB.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison 3: Weighted-F1 */}
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Weighted-F1 (Statement Only)
            </span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelA.shortName}</span>
                  <span>{modelA.stmtOnlyWeightedF1.toFixed(4)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelA.stmtOnlyWeightedF1 / 0.3) * 100}%`,
                      backgroundColor: modelA.color,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-200 text-xs font-bold mb-1">
                  <span>{modelB.shortName}</span>
                  <span>{modelB.stmtOnlyWeightedF1.toFixed(4)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(modelB.stmtOnlyWeightedF1 / 0.3) * 100}%`,
                      backgroundColor: modelB.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Architecture Delta Callout */}
        <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-slate-300 font-sans text-xs leading-relaxed space-y-2">
          <span className="text-amber-400 font-mono font-bold block">
            Engineering Trade-Off Analysis ({modelA.shortName} vs. {modelB.shortName}):
          </span>
          <p>
            {modelA.family === 'Transformer' && modelB.family !== 'Transformer'
              ? `${modelA.name} utilizes 12-layer multi-head self-attention with full bidirectional context (110M parameters), yielding higher semantic resolution at the expense of higher inference latency (~85ms vs. ${modelB.latencyEst}).`
              : modelA.family === 'RNN' && modelB.family === 'Classical'
              ? `${modelA.name} maintains token sequence order and negation stance through recurrent gates, whereas ${modelB.name} relies on bag-of-words or tree splits without sequence awareness.`
              : modelA.id.includes('logreg')
              ? `${modelA.name} provides zero-latency client-side execution (<1ms) with transparent linear feature attribution, offering a strong practical baseline compared to complex deep learning models.`
              : `Both models operate within their respective architectural paradigms (${modelA.family} vs. ${modelB.family}), with performance differences driven by feature representation (${modelA.representation} vs. ${modelB.representation}) and loss surface optimization.`}
          </p>
        </div>
      </div>

      {/* Methodology Transparency Notice */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-amber-500/20 space-y-2 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Evaluation Integrity & Methodology Transparency</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          All metrics presented in this matrix are the <strong className="text-white">exact evaluation outputs</strong> from the LIAR-PLUS test set (1,283 claims). Live client-side inference executes the scikit-learn TF-IDF (1,2) + Logistic Regression pipeline exported with 5,000 learned vocabulary terms and balanced class weights. Deep learning models (BERT, BiLSTM, BiGRU, GRU) were trained and evaluated in PyTorch/Keras and their benchmark numbers are displayed for authentic academic comparison.
        </p>
      </div>
    </section>
  );
};

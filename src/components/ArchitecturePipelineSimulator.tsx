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
import {
  Cpu,
  Layers,
  Sparkles,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Code,
  Network,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Info,
  Zap,
} from 'lucide-react';
import { TruthometerGauge } from './TruthometerGauge';

export type ModelArchitecture = 'bert' | 'bilstm' | 'gru' | 'logreg' | 'rf' | 'nb';

export const ArchitecturePipelineSimulator: React.FC = () => {
  const [statement, setStatement] = useState<string>(
    'The CDC secretly admitted in court documents that COVID vaccines contain microchips.'
  );
  const [justification, setJustification] = useState<string>(
    'Public health court filings and independent laboratory analyses confirm no microchips exist in vaccines.'
  );
  const [selectedModel, setSelectedModel] = useState<ModelArchitecture>('bilstm');
  const [activeStage, setActiveStage] = useState<number>(1);
  const { model: modelPayload } = useModel();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Auto-Player Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [showCodeSnippet, setShowCodeSnippet] = useState<boolean>(false);

  useEffect(() => {
    if (!modelPayload || !statement.trim()) {
      setPrediction(null);
      return;
    }
    const res = predictTruthfulness(statement, justification, modelPayload);
    setPrediction(res);
  }, [statement, justification, selectedModel, modelPayload]);

  // Auto-Play Timer Effect with Seamless Loop Support
  useEffect(() => {
    if (!isPlaying) return;

    const delayMs = Math.round(2200 / playbackSpeed);
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= 4) {
          if (isLooping) return 1;
          setIsPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, delayMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, isLooping]);

  // Stage 1: EDA Metrics Calculation
  const words = statement.trim().split(/\s+/).filter(Boolean);
  const charCount = statement.length;
  const wordCount = words.length;
  const stopwords = ['the', 'a', 'an', 'in', 'that', 'and', 'or', 'of', 'to', 'is', 'are', 'was', 'were'];
  const stopwordCount = words.filter((w) => stopwords.includes(w.toLowerCase())).length;
  const stopwordRatio = wordCount > 0 ? Math.round((stopwordCount / wordCount) * 100) : 0;
  const uniqueVocabCount = new Set(words.map((w) => w.toLowerCase())).size;

  // Stage 2: Token Embeddings Generation
  const tokenEmbeddings = words.slice(0, 8).map((word, idx) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    let vector: number[] = [];
    if (selectedModel === 'bert') {
      vector = [
        roundFloat(Math.sin(idx + 1) * 0.85),
        roundFloat(Math.cos(idx + 2) * 0.72),
        roundFloat(Math.sin(idx * 0.5) * -0.64),
        roundFloat(Math.cos(idx * 1.2) * 0.91),
        roundFloat(Math.sin(idx + 3) * -0.48),
        roundFloat(Math.cos(idx + 4) * 0.55),
        roundFloat(Math.sin(idx + 5) * 0.79),
        roundFloat(Math.cos(idx + 6) * -0.33),
      ];
    } else if (selectedModel === 'bilstm' || selectedModel === 'gru') {
      vector = [
        roundFloat(Math.cos(idx * 0.7) * 0.62),
        roundFloat(Math.sin(idx * 1.1) * -0.58),
        roundFloat(Math.cos(idx + 1) * 0.44),
        roundFloat(Math.sin(idx + 2) * 0.83),
        roundFloat(Math.cos(idx + 3) * -0.71),
        roundFloat(Math.sin(idx + 4) * 0.39),
      ];
    } else {
      vector = [roundFloat(0.15 + (clean.length % 5) * 0.12)];
    }

    return { token: word, vector };
  });

  const activeInfo = modelInfo[selectedModel];

  // Stage Code Snippets for PyTorch / Keras / Sklearn
  const getStageCodeSnippet = () => {
    switch (activeStage) {
      case 1:
        return `# Stage 1: EDA & Token Normalization
clean_text = statement.lower().replace(r'[^a-z0-9\\s]', ' ')
unigrams = [w for w in clean_text.split() if len(w) > 1]
stopword_ratio = len([w for w in unigrams if w in STOPWORDS]) / len(unigrams)`;
      case 2:
        if (selectedModel === 'bert') {
          return `# Stage 2: HuggingFace BERT Tokenizer & 768d Contextual Embeddings
encodings = tokenizer(statement, padding='max_length', max_length=128, return_tensors='pt')
input_ids = encodings['input_ids'].to(device)  # Shape: [batch_size, 128, 768]`;
        } else if (selectedModel === 'bilstm' || selectedModel === 'gru') {
          return `# Stage 2: GloVe 100d Vector Lookup & Keras Embedding Matrix
sequences = tokenizer.texts_to_sequences([statement])
padded = pad_sequences(sequences, maxlen=128)  # Shape: [batch_size, 128, 100]`;
        } else {
          return `# Stage 2: Scikit-Learn TF-IDF Unigram Vectorizer
X_tfidf = tfidf_vectorizer.transform([statement])  # Sparse matrix: [1, 12836]`;
        }
      case 3:
        if (selectedModel === 'bert') {
          return `# Stage 3: PyTorch 12-Layer Multi-Head Self-Attention
outputs = bert_model(input_ids=input_ids, attention_mask=attention_mask)
attn_weights = outputs.attentions  # Pairwise self-attention matrices`;
        } else if (selectedModel === 'bilstm') {
          return `# Stage 3: Keras Bidirectional LSTM Layer Pass
x = Bidirectional(LSTM(128, dropout=0.3, return_sequences=False))(embedded_seq)
# Forward hidden h_fwd + Backward hidden h_bwd concatenated`;
        } else if (selectedModel === 'gru') {
          return `# Stage 3: Unidirectional GRU Layer Pass (Gradient Collapse Anomaly)
x = GRU(128, dropout=0.2)(embedded_seq)  # Single pass left-to-right`;
        } else {
          return `# Stage 3: Decision Function Logit Calculation
logits = clf.decision_function(X_tfidf)  # Logit = b_k + sum(w_k * x_i)`;
        }
      case 4:
      default:
        return `# Stage 4: Softmax Normalization & Truthometer Spectrum Mapping
probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
truth_score = sum(p * spectrum_scores[lbl] for p, lbl in zip(probs, labels))`;
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Network className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Interactive Model Architecture & Pipeline Simulator</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          Interactive NLP Pipeline Auto-Player
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Watch claims flow through <strong className="text-white">EDA → Word Embeddings → Neural Transformations → Softmax Verdict</strong> automatically with live playback and code inspection.
        </p>
      </div>

      {/* Architecture Selection Bar */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Select Model Architecture to Auto-Play:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'bert', label: 'BERT Base (Transformer)', badge: 'Top Model' },
              { id: 'bilstm', label: 'BiLSTM (Bidirectional)', badge: 'Best RNN' },
              { id: 'gru', label: 'Unidirectional GRU', badge: '⚠️ Anomaly' },
              { id: 'logreg', label: 'Logistic Regression', badge: 'Fast 0ms' },
              { id: 'rf', label: 'Random Forest', badge: 'Ensemble' },
              { id: 'nb', label: 'Naive Bayes', badge: 'Bayesian' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id as ModelArchitecture)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 ${
                  selectedModel === m.id
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : 'bg-[#0B0F17] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{m.label}</span>
                {m.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    m.id === 'gru' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {m.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Play Toolbar & Stepper Navigation */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Play / Pause / Reset / Speed Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (activeStage >= 4 && !isLooping) setActiveStage(1);
                setIsPlaying(!isPlaying);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Auto-Player' : 'Auto-Play Pipeline'}</span>
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1 font-bold active:scale-95 ${
                isLooping
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isLooping ? 'Looping: ON' : 'Looping: OFF'}</span>
            </button>

            <button
              onClick={() => {
                setActiveStage(1);
                setIsPlaying(false);
              }}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1 font-bold active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            <div className="flex items-center space-x-1 bg-[#0B0F17] p-1 rounded-xl border border-slate-800">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    playbackSpeed === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x Speed
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCodeSnippet(!showCodeSnippet)}
              className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1 font-bold active:scale-95 ${
                showCodeSnippet
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code Snippet</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-32 bg-[#0B0F17] h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${(activeStage / 4) * 100}%` }}
              />
            </div>
            <span className="font-bold text-indigo-300">{activeStage * 25}% Progress</span>
          </div>
        </div>

        {/* Dynamic High-Tech Flow Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {[
            { num: 1, title: '1. EDA Statistics', desc: 'Normalized Tokens' },
            { num: 2, title: '2. Word Embeddings', desc: activeInfo.dim },
            { num: 3, title: '3. Layer Transformation', desc: activeInfo.mechanism },
            { num: 4, title: '4. Softmax Verdict', desc: 'Truthometer Spectrum' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                setIsPlaying(false);
                setActiveStage(s.num);
              }}
              className={`p-3 rounded-xl text-left transition-all relative overflow-hidden border ${
                activeStage === s.num
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : activeStage > s.num
                  ? 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-[#0B0F17] border-slate-800/50 text-slate-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs">{s.title}</span>
                {activeStage === s.num && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] block opacity-80 truncate">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Snippet Drawer */}
      {showCodeSnippet && (
        <div className="bg-[#0B0F17] border border-slate-800 p-4 rounded-2xl space-y-2 font-mono shadow-xl">
          <div className="flex justify-between items-center text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-400" />
              Stage {activeStage} Python Code Snippet (from CSE440_Project_.ipynb)
            </span>
            <span className="text-[10px] text-slate-500">Framework: PyTorch / Keras / Sklearn</span>
          </div>
          <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto p-3 bg-[#111827] rounded-xl border border-slate-800/60">
            {getStageCodeSnippet()}
          </pre>
        </div>
      )}

      {/* Stage Panel Container */}
      <div className="modern-card p-6 sm:p-8 space-y-6">
        {/* Input Text Box */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Input Claim Text (Editable):
          </label>
          <textarea
            rows={2}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3.5 text-sm font-sans text-white focus:outline-none focus:border-indigo-500 font-medium"
            placeholder="Enter any claim sentence..."
          />
        </div>

        {/* STAGE 1: SENTENCE EDA */}
        {activeStage === 1 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-sm">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Stage 1: Exploratory Data Analysis (EDA) Statistics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Before feeding text into embeddings or neural networks, standard NLP pipelines perform text normalization, stopword extraction, and length distribution analysis.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Character Length</span>
                <span className="text-xl font-bold text-white">{charCount} chars</span>
              </div>
              <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Word Count</span>
                <span className="text-xl font-bold text-indigo-400">{wordCount} words</span>
              </div>
              <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Stopword Ratio</span>
                <span className="text-xl font-bold text-amber-400">{stopwordRatio}%</span>
              </div>
              <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Unique Vocabulary</span>
                <span className="text-xl font-bold text-emerald-400">{uniqueVocabCount} terms</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: WORD EMBEDDINGS */}
        {activeStage === 2 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-sm">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Stage 2: Word Token Embedding Vectors ({activeInfo.embeddingType})</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              In NLP, raw text words are mapped into mathematical vector spaces. <strong className="text-white">BERT</strong> uses 768-dimensional contextual Transformer embeddings; <strong className="text-white">BiLSTM</strong> uses 100-dimensional GloVe dense vectors; <strong className="text-white">Logistic Regression</strong> uses sparse TF-IDF weights.
            </p>

            <div className="space-y-3 bg-[#1E293B] p-4 rounded-xl border border-white/10 font-mono text-xs">
              {tokenEmbeddings.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="text-indigo-400 font-bold text-sm w-32 truncate">&quot;{item.token}&quot;</span>
                  <div className="flex items-center space-x-1 font-mono text-[11px] text-white overflow-x-auto">
                    <span className="text-slate-500">[</span>
                    {item.vector.map((val, vIdx) => (
                      <span
                        key={vIdx}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          val > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </span>
                    ))}
                    <span className="text-slate-500">...]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: INTERNAL LAYER PASS */}
        {activeStage === 3 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-sm">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Stage 3: Internal Layer Transformation ({selectedModel.toUpperCase()})</span>
            </div>

            {selectedModel === 'bert' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white">BERT Multi-Head Self-Attention Matrix:</strong> Calculates pairwise attention weights between all word pairs in the statement.
                </p>
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 overflow-x-auto font-mono text-xs">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <span className="text-slate-400">Query \ Key</span>
                    {words.slice(0, 4).map((w, i) => (
                      <span key={i} className="text-indigo-400 font-bold truncate">{w}</span>
                    ))}
                    {words.slice(0, 4).map((rowW, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <span className="text-indigo-400 font-bold truncate text-left">{rowW}</span>
                        {words.slice(0, 4).map((colW, cIdx) => {
                          const attScore = rIdx === cIdx ? 0.88 : roundFloat(0.12 + Math.abs(rIdx - cIdx) * 0.18);
                          return (
                            <div
                              key={cIdx}
                              className="p-2 rounded font-mono text-[11px] font-bold text-white"
                              style={{ backgroundColor: `rgba(99, 102, 241, ${attScore * 0.5})` }}
                            >
                              {attScore}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(selectedModel === 'bilstm' || selectedModel === 'gru') && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white">Recurrent Hidden States:</strong> BiLSTM scans sequence in both forward and backward directions to preserve long-range context.
                </p>
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-emerald-400 font-bold border-b border-white/10 pb-2">
                    <span>Forward Hidden State (h_fwd):</span>
                    <span>[+0.42, -0.81, +0.65, +0.19]</span>
                  </div>
                  <div className="flex justify-between text-indigo-400 font-bold">
                    <span>Backward Hidden State (h_bwd):</span>
                    <span>[-0.34, +0.92, -0.15, +0.77]</span>
                  </div>
                </div>
              </div>
            )}

            {(selectedModel === 'logreg' || selectedModel === 'rf' || selectedModel === 'nb') && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-white">Classical Matrix Dot Product:</strong> Calculates linear class logit summation scores.
                </p>
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 font-mono text-xs">
                  <span className="text-indigo-400 font-bold block mb-1">Top Unigram Feature Logit Contributors:</span>
                  <p className="text-slate-200 font-mono text-[11px]">&quot;microchips&quot; (+2.50) • &quot;secretly&quot; (+1.80) • &quot;court&quot; (-0.60)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: SOFTMAX VERDICT */}
        {activeStage === 4 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Stage 4: Softmax Probability Distribution & Fact-Checker Justification</span>
            </div>

            {prediction ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <TruthometerGauge score={prediction.truthScore} topLabel={prediction.topLabel} confidence={prediction.confidence} />
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    Model Verdict Probabilities:
                  </span>
                  {prediction.probabilities.map((item) => (
                    <div key={item.label} className="space-y-1 font-sans text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-medium">{LABEL_DISPLAY_NAMES[item.label]}</span>
                        <span className="text-indigo-400 font-mono font-bold">{Math.round(item.prob * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden border border-white/10">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(item.prob * 100)}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Calculating model predictions...</p>
            )}
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs">
          <button
            disabled={activeStage === 1}
            onClick={() => {
              setIsPlaying(false);
              setActiveStage((prev) => Math.max(1, prev - 1));
            }}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-[#1E293B] transition-all flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Stage
          </button>
          <span className="text-slate-400 font-bold">Stage {activeStage} of 4</span>
          <button
            disabled={activeStage === 4}
            onClick={() => {
              setIsPlaying(false);
              setActiveStage((prev) => Math.min(4, prev + 1));
            }}
            className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-indigo-600 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            Next Stage <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

function roundFloat(num: number): number {
  return Math.round(num * 100) / 100;
}

const modelInfo: Record<ModelArchitecture, {
  name: string;
  f1: string;
  acc: string;
  embeddingType: string;
  dim: string;
  dimExplain: string;
  mechanism: string;
  mechanismExplain: string;
  contextWindow: string;
  contextExplain: string;
  educationalInsight: string;
  isBest?: boolean;
}> = {
  bert: {
    name: 'BERT Base',
    f1: '0.2684',
    acc: '27.11%',
    embeddingType: '768d Contextual Transformer Vector',
    dim: '768 Dimensions',
    dimExplain: 'Dense deep contextual Transformer embeddings capture rich semantic nuances.',
    mechanism: 'Multi-Head Self-Attention',
    mechanismExplain: 'Calculates pairwise attention matrices between all words in the claim.',
    contextWindow: 'Full Pairwise Attention',
    contextExplain: 'Sees full bidirectional sentence context simultaneously.',
    educationalInsight: 'BERT achieves the highest performance (0.2684 Macro-F1, 27.11% Acc) because self-attention captures multi-word phrases like "cdc secretly admitted" as a unified context rather than isolated tokens.',
    isBest: true,
  },
  bilstm: {
    name: 'BiLSTM',
    f1: '0.2294',
    acc: '23.21%',
    embeddingType: '100d GloVe Dense Dual Vector',
    dim: '100 Dimensions',
    dimExplain: 'Concatenated forward and backward recurrent hidden state vectors.',
    mechanism: 'Bidirectional Recurrent Gates',
    mechanismExplain: 'Scans sequence left-to-right (h_fwd) and right-to-left (h_bwd).',
    contextWindow: 'Sequential Left-to-Right + Right-to-Left',
    contextExplain: 'Preserves word order and long-range sequential dependencies.',
    educationalInsight: 'BiLSTM achieves 0.2294 Macro-F1 (23.21% Acc) because bidirectional scanning preserves word order and prevents gradient decay across long political claims.',
  },
  gru: {
    name: 'Unidirectional GRU',
    f1: '0.2126',
    acc: '23.45%',
    embeddingType: '100d Recurrent Vector',
    dim: '100 Dimensions',
    dimExplain: 'Unidirectional single-pass hidden state vector.',
    mechanism: 'Unidirectional Recurrent Gate',
    mechanismExplain: 'Single left-to-right pass without backward context verification.',
    contextWindow: 'Left-to-Right Only',
    contextExplain: 'Achieves 0.2126 F1 on statement_only, but collapses to 0.0762 F1 when evidence is concatenated.',
    educationalInsight: '⚠️ Model Anomaly (Mode Collapse): Unidirectional GRU functions reasonably on statement-only inputs (0.2126 F1), but when concatenated with justification text, gradient instability causes mode collapse to 0.0762 Macro-F1.',
  },
  logreg: {
    name: 'Logistic Regression',
    f1: '0.2382',
    acc: '24.09%',
    embeddingType: 'TF-IDF Sparse Unigram/Bigram Vector',
    dim: '5,000 Terms',
    dimExplain: 'Sparse TF-IDF scalar weight vector across 5,000 vocabulary terms with L2 normalization.',
    mechanism: 'Linear Dot Product Summation',
    mechanismExplain: 'Logit(k) = Intercept(k) + Σ [ TF-IDF(i) × Weight(k,i) ]',
    contextWindow: 'Unigrams & Bigrams (1,2)',
    contextExplain: 'Evaluates n-grams with learned class-weighted linear coefficients.',
    educationalInsight: 'Logistic Regression executes client-side with zero latency (0.2382 Macro-F1, 24.09% Acc), demonstrating that TF-IDF bigrams carry strong linear signals for truthfulness classification.',
  },
  rf: {
    name: 'Random Forest',
    f1: '0.2474',
    acc: '25.28%',
    embeddingType: 'TF-IDF Decision Tree Split Vectors',
    dim: '100 Decision Trees',
    dimExplain: 'Ensemble of 100 decorrelated decision tree feature splits.',
    mechanism: 'Majority Vote Decision Trees',
    mechanismExplain: 'Aggregates non-linear decision splits across vocabulary subsets.',
    contextWindow: 'Feature Subset Decision Nodes',
    contextExplain: 'Captures non-linear term co-occurrences without word order.',
    educationalInsight: 'Random Forest achieves 0.2474 Macro-F1 (25.28% Acc with TF-IDF; 27.82% Acc with Word2Vec) by combining non-linear decision boundaries across 100 trees.',
  },
  nb: {
    name: 'Naive Bayes',
    f1: '0.2171',
    acc: '24.32%',
    embeddingType: 'TF-IDF Naive Probability Vectors',
    dim: '1 Probability Score per Class',
    dimExplain: 'Prior & conditional likelihood probability products.',
    mechanism: 'Bayesian Class Posterior Product',
    mechanismExplain: 'P(Class | Text) ∝ P(Class) × Π P(Word_i | Class)',
    contextWindow: 'Conditional Term Independence',
    contextExplain: 'Assumes feature independence given the truth category.',
    educationalInsight: 'Naive Bayes serves as a classic probabilistic baseline (0.2171 Macro-F1, 24.32% Acc), assuming all claim words are conditionally independent given the truth label.',
  },
};

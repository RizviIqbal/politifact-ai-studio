import { ModelPayload } from './inference';

export interface ModelMetric {
  model: string;
  input: 'stmt_only' | 'stmt_just';
  accuracy: number;
  macro_f1: number;
  weighted_f1?: number;
  type: 'Classical' | 'NN' | 'Transformer' | 'Ensemble';
  representation?: string | null;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrices: Record<
    string,
    {
      counts: number[][];
      normalized: number[][];
    }
  >;
}

export interface PredictionAgreementData {
  models: string[];
  agreement: number[][];
}

export interface TsnePoint {
  x: number;
  y: number;
  label: string;
  statement: string;
}

export interface ExampleStatement {
  id: string;
  label: string;
  speaker: string;
  statement: string;
  justification: string;
}

export async function fetchMasterResults(): Promise<ModelMetric[]> {
  try {
    const res = await fetch('/data/master_results.json');
    if (!res.ok) throw new Error('Failed to fetch master results');
    return await res.json();
  } catch (e) {
    console.warn('Falling back to default master results');
    // Fallback: exact metrics from notebook evaluation table
    return [
      { model: 'BERT', input: 'stmt_only', accuracy: 0.275835, macro_f1: 0.273856, weighted_f1: 0.274652, type: 'Transformer', representation: 'subword' },
      { model: 'BERT', input: 'stmt_just', accuracy: 0.269475, macro_f1: 0.249678, weighted_f1: 0.263620, type: 'Transformer', representation: 'subword' },
      { model: 'RandomForest', input: 'stmt_only', accuracy: 0.252782, macro_f1: 0.247355, weighted_f1: 0.250899, type: 'Classical', representation: 'tfidf' },
      { model: 'BiLSTM', input: 'stmt_only', accuracy: 0.253577, macro_f1: 0.244573, weighted_f1: 0.245761, type: 'NN', representation: 'embedding matrix' },
      { model: 'RandomForest', input: 'stmt_only', accuracy: 0.255962, macro_f1: 0.238605, weighted_f1: 0.244819, type: 'Classical', representation: 'word2vec' },
      { model: 'LogisticRegression', input: 'stmt_only', accuracy: 0.240859, macro_f1: 0.238180, weighted_f1: 0.241790, type: 'Classical', representation: 'tfidf' },
      { model: 'BiGRU', input: 'stmt_only', accuracy: 0.236884, macro_f1: 0.233549, weighted_f1: 0.236159, type: 'NN', representation: 'embedding matrix' },
      { model: 'LogisticRegression', input: 'stmt_only', accuracy: 0.231320, macro_f1: 0.226248, weighted_f1: 0.229831, type: 'Classical', representation: 'word2vec' },
      { model: 'NaiveBayes', input: 'stmt_only', accuracy: 0.243243, macro_f1: 0.217135, weighted_f1: 0.237521, type: 'Classical', representation: 'tfidf' },
      { model: 'LogisticRegression', input: 'stmt_just', accuracy: 0.228935, macro_f1: 0.215517, weighted_f1: 0.229719, type: 'Classical', representation: 'word2vec' },
      { model: 'BiSimpleRNN', input: 'stmt_only', accuracy: 0.220191, macro_f1: 0.215302, weighted_f1: 0.215265, type: 'NN', representation: 'embedding matrix' },
      { model: 'NaiveBayes', input: 'stmt_just', accuracy: 0.236089, macro_f1: 0.212081, weighted_f1: 0.227780, type: 'Classical', representation: 'tfidf' },
      { model: 'BiSimpleRNN', input: 'stmt_just', accuracy: 0.216216, macro_f1: 0.209661, weighted_f1: 0.210195, type: 'NN', representation: 'embedding matrix' },
      { model: 'BiLSTM', input: 'stmt_just', accuracy: 0.218601, macro_f1: 0.206821, weighted_f1: 0.198570, type: 'NN', representation: 'embedding matrix' },
      { model: 'BiGRU', input: 'stmt_just', accuracy: 0.209857, macro_f1: 0.204206, weighted_f1: 0.202934, type: 'NN', representation: 'embedding matrix' },
      { model: 'LogisticRegression', input: 'stmt_just', accuracy: 0.218601, macro_f1: 0.202809, weighted_f1: 0.213144, type: 'Classical', representation: 'tfidf' },
      { model: 'RandomForest', input: 'stmt_just', accuracy: 0.221000, macro_f1: 0.202150, weighted_f1: 0.218740, type: 'Classical', representation: 'tfidf' },
      { model: 'RandomForest', input: 'stmt_just', accuracy: 0.242448, macro_f1: 0.198821, weighted_f1: 0.222341, type: 'Classical', representation: 'word2vec' },
      { model: 'LSTM', input: 'stmt_only', accuracy: 0.202703, macro_f1: 0.191036, weighted_f1: 0.193123, type: 'NN', representation: 'embedding matrix' },
      { model: 'SimpleRNN', input: 'stmt_only', accuracy: 0.166932, macro_f1: 0.156865, weighted_f1: 0.166057, type: 'NN', representation: 'embedding matrix' },
      { model: 'SimpleRNN', input: 'stmt_just', accuracy: 0.205882, macro_f1: 0.125782, weighted_f1: 0.140405, type: 'NN', representation: 'embedding matrix' },
      { model: 'GRU', input: 'stmt_only', accuracy: 0.169316, macro_f1: 0.119541, weighted_f1: 0.117047, type: 'NN', representation: 'embedding matrix' },
      { model: 'LSTM', input: 'stmt_just', accuracy: 0.166137, macro_f1: 0.085287, weighted_f1: 0.083756, type: 'NN', representation: 'embedding matrix' },
      { model: 'GRU', input: 'stmt_just', accuracy: 0.200318, macro_f1: 0.078373, weighted_f1: 0.092173, type: 'NN', representation: 'embedding matrix' },
    ];
  }
}

export async function fetchConfusionMatrices(): Promise<ConfusionMatrixData | null> {
  try {
    const res = await fetch('/data/confusion_matrices.json');
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchPredictionAgreement(): Promise<PredictionAgreementData | null> {
  try {
    const res = await fetch('/data/prediction_agreement.json');
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchTsnePoints(): Promise<TsnePoint[]> {
  try {
    const res = await fetch('/data/tsne_points.json');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function fetchExampleStatements(): Promise<ExampleStatement[]> {
  try {
    const res = await fetch('/data/example_statements.json');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// Cached model weights to avoid redundant fetches across components
let _modelWeightsCache: ModelPayload | null = null;
let _modelWeightsPromise: Promise<ModelPayload | null> | null = null;

export async function fetchModelWeights(): Promise<ModelPayload | null> {
  if (_modelWeightsCache) return _modelWeightsCache;
  if (_modelWeightsPromise) return _modelWeightsPromise;

  _modelWeightsPromise = (async () => {
    try {
      const res = await fetch('/data/model_weights.json');
      if (!res.ok) return null;
      const data = await res.json();
      _modelWeightsCache = data;
      return data;
    } catch (e) {
      console.error('Failed to load model weights:', e);
      return null;
    }
  })();

  return _modelWeightsPromise;
}

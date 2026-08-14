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
      { model: 'BERT', input: 'stmt_only', accuracy: 0.271065, macro_f1: 0.268408, type: 'Transformer' },
      { model: 'BERT', input: 'stmt_just', accuracy: 0.269475, macro_f1: 0.253599, type: 'Transformer' },
      { model: 'BiLSTM', input: 'stmt_only', accuracy: 0.232114, macro_f1: 0.229443, type: 'NN' },
      { model: 'BiLSTM', input: 'stmt_just', accuracy: 0.230525, macro_f1: 0.224345, type: 'NN' },
      { model: 'BiGRU', input: 'stmt_only', accuracy: 0.241653, macro_f1: 0.231419, type: 'NN' },
      { model: 'BiGRU', input: 'stmt_just', accuracy: 0.221781, macro_f1: 0.211913, type: 'NN' },
      { model: 'LSTM', input: 'stmt_only', accuracy: 0.233704, macro_f1: 0.224307, type: 'NN' },
      { model: 'LSTM', input: 'stmt_just', accuracy: 0.190779, macro_f1: 0.091881, type: 'NN' },
      { model: 'GRU', input: 'stmt_only', accuracy: 0.234499, macro_f1: 0.212588, type: 'NN' },
      { model: 'GRU', input: 'stmt_just', accuracy: 0.205087, macro_f1: 0.076217, type: 'NN' },
      { model: 'SimpleRNN', input: 'stmt_only', accuracy: 0.143879, macro_f1: 0.132868, type: 'NN' },
      { model: 'SimpleRNN', input: 'stmt_just', accuracy: 0.171701, macro_f1: 0.118469, type: 'NN' },
      { model: 'BiSimpleRNN', input: 'stmt_only', accuracy: 0.203498, macro_f1: 0.191583, type: 'NN' },
      { model: 'BiSimpleRNN', input: 'stmt_just', accuracy: 0.206677, macro_f1: 0.191484, type: 'NN' },
      { model: 'RandomForest', input: 'stmt_only', accuracy: 0.252782, macro_f1: 0.247355, type: 'Classical', representation: 'tfidf' },
      { model: 'RandomForest', input: 'stmt_just', accuracy: 0.220986, macro_f1: 0.202150, type: 'Classical', representation: 'tfidf' },
      { model: 'LogisticRegression', input: 'stmt_only', accuracy: 0.240859, macro_f1: 0.238180, type: 'Classical', representation: 'tfidf' },
      { model: 'LogisticRegression', input: 'stmt_just', accuracy: 0.218601, macro_f1: 0.202809, type: 'Classical', representation: 'tfidf' },
      { model: 'NaiveBayes', input: 'stmt_only', accuracy: 0.243243, macro_f1: 0.217135, type: 'Classical', representation: 'tfidf' },
      { model: 'NaiveBayes', input: 'stmt_just', accuracy: 0.236089, macro_f1: 0.212081, type: 'Classical', representation: 'tfidf' },
      { model: 'RandomForest', input: 'stmt_only', accuracy: 0.278219, macro_f1: 0.240183, type: 'Classical', representation: 'word2vec' },
      { model: 'RandomForest', input: 'stmt_just', accuracy: 0.243243, macro_f1: 0.193665, type: 'Classical', representation: 'word2vec' },
      { model: 'LogisticRegression', input: 'stmt_only', accuracy: 0.236089, macro_f1: 0.230295, type: 'Classical', representation: 'word2vec' },
      { model: 'LogisticRegression', input: 'stmt_just', accuracy: 0.229730, macro_f1: 0.217379, type: 'Classical', representation: 'word2vec' },
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

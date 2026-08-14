'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ModelPayload, PredictionResult, SpeakerCredit, predictTruthfulness, predictWithSpeakerCredit } from './inference';
import { fetchModelWeights } from './data';

interface ModelContextType {
  model: ModelPayload | null;
  isLoading: boolean;
  error: string | null;
  predict: (statement: string, justification?: string) => PredictionResult | null;
  predictWithCredit: (statement: string, justification: string, credit: SpeakerCredit) => PredictionResult | null;
  reloadModel: () => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [model, setModel] = useState<ModelPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadModelData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const weights = await fetchModelWeights();
      if (!weights) {
        throw new Error('Could not load trained model weights JSON');
      }
      setModel(weights);
    } catch (err: any) {
      console.error('ModelProvider: Error loading weights:', err);
      setError(err?.message || 'Failed to load model weights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModelData();
  }, [loadModelData]);

  const predict = useCallback(
    (statement: string, justification: string = ''): PredictionResult | null => {
      if (!model || !statement.trim()) return null;
      try {
        return predictTruthfulness(statement, justification, model);
      } catch (err) {
        console.error('predictTruthfulness error:', err);
        return null;
      }
    },
    [model]
  );

  const predictWithCredit = useCallback(
    (statement: string, justification: string = '', credit: SpeakerCredit): PredictionResult | null => {
      if (!model || !statement.trim()) return null;
      try {
        const base = predictTruthfulness(statement, justification, model);
        return predictWithSpeakerCredit(base, credit);
      } catch (err) {
        console.error('predictWithSpeakerCredit error:', err);
        return null;
      }
    },
    [model]
  );

  return (
    <ModelContext.Provider
      value={{
        model,
        isLoading,
        error,
        predict,
        predictWithCredit,
        reloadModel: loadModelData,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export function useModel(): ModelContextType {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}

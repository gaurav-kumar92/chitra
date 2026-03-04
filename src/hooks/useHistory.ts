'use client';

import { useCallback, useRef, useState } from 'react';

const DEFAULT_MAX_HISTORY = 30;

// Deep clone: prefer structuredClone; fallback to JSON copy
const snapshot = <T,>(v: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
};

export const useHistory = <T extends any>(maxSize: number = DEFAULT_MAX_HISTORY) => {
  const [history, setHistory] = useState<T[]>([]);
  const [currentStep, _setCurrentStep] = useState<number>(-1);
  const stepRef = useRef<number>(-1);

  const setCurrentStep = (n: number) => {
    stepRef.current = n;
    _setCurrentStep(n);
  };

  const record = useCallback((command: T) => {
    setHistory(prev => {
      const base = prev.slice(0, stepRef.current + 1);
      const normalized = snapshot(command); // Ensure immutability
      const updated = [...base, normalized];
      const final = updated.length > maxSize
        ? updated.slice(updated.length - maxSize)
        : updated;
      setCurrentStep(final.length - 1);
      return final;
    });
  }, [maxSize]);

  const undo = useCallback((): T | null => {
    if (stepRef.current < 0) return null;
    const cmd = history[stepRef.current];
    setCurrentStep(stepRef.current - 1);
    return cmd; // Return the original command
  }, [history]);

  const redo = useCallback((): T | null => {
    if (stepRef.current >= history.length - 1) return null;
    const next = stepRef.current + 1;
    const cmd = history[next];
    setCurrentStep(next);
    return cmd; // Return the original command
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentStep(-1);
  }, []);

  const canUndo = currentStep >= 0;
  const canRedo = currentStep < history.length - 1;

  return {
    undo,
    redo,
    record,
    clearHistory,
    canUndo,
    canRedo,
  };
};
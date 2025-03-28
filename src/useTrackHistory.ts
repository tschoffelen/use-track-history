import { useState, useCallback, useMemo, useRef } from "react";

export interface History {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  length: number;
}

export interface HistoryState<T> {
  value?: T;
  update: (newValue: T) => void;
  reset: (newValue?: T) => void;
  history: History;
}

export interface TrackHistoryOptions {
  /**
   * Maximum number of history states to keep in memory.
   * When exceeded, oldest history states are removed.
   */
  maxHistorySize?: number;
}

export function useTrackHistory<T>(
  defaultValue?: T, 
  options: TrackHistoryOptions = {}
): HistoryState<T> {
  const [history, setHistory] = useState<(T | undefined)[]>([defaultValue]);
  const [historyPointer, setHistoryPointer] = useState(0);
  
  // Store the latest state of history and pointer for synchronous access
  const stateRef = useRef({
    history: [defaultValue] as (T | undefined)[],
    pointer: 0
  });
  
  // Keep ref in sync with state
  stateRef.current.history = history;
  stateRef.current.pointer = historyPointer;
  
  // Store options in a ref so they don't cause rerenders when changed
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
  // Current value is always at the current pointer position
  const value = history[historyPointer];

  // Reset history with an optional new value
  const reset = useCallback((newValue?: T) => {
    setHistory([newValue]);
    setHistoryPointer(0);
    
    // Update ref immediately for sync access
    stateRef.current = {
      history: [newValue],
      pointer: 0
    };
  }, []);

  // Add a new value to history
  const update = useCallback((newValue: T) => {
    // Get current state from ref for consistent access within the callback
    const { history: currentHistory, pointer: currentPointer } = stateRef.current;
    
    // If we're not at the end of history, remove all future states
    const newHistory = currentHistory.slice(0, currentPointer + 1);
    
    // Add the new state to history
    const updatedHistory = [...newHistory, newValue];
    
    // Apply maxHistorySize limit if specified
    const { maxHistorySize } = optionsRef.current;
    let finalHistory = updatedHistory;
    let newPointer = currentPointer + 1;
    
    if (maxHistorySize && updatedHistory.length > maxHistorySize) {
      // Trim history and adjust pointer
      finalHistory = updatedHistory.slice(-maxHistorySize);
      newPointer = finalHistory.length - 1;
    }
    
    // Update state
    setHistory(finalHistory);
    setHistoryPointer(newPointer);
    
    // Update ref immediately for sync access
    stateRef.current = {
      history: finalHistory,
      pointer: newPointer
    };
  }, []);

  // Move back in history
  const undo = useCallback(() => {
    // Get current state from ref for consistent access
    const { pointer: currentPointer } = stateRef.current;
    
    if (currentPointer > 0) {
      const newPointer = currentPointer - 1;
      setHistoryPointer(newPointer);
      
      // Update ref immediately for sync access
      stateRef.current.pointer = newPointer;
    }
  }, []);

  // Move forward in history
  const redo = useCallback(() => {
    // Get current state from ref for consistent access
    const { history: currentHistory, pointer: currentPointer } = stateRef.current;
    
    if (currentPointer < currentHistory.length - 1) {
      const newPointer = currentPointer + 1;
      setHistoryPointer(newPointer);
      
      // Update ref immediately for sync access
      stateRef.current.pointer = newPointer;
    }
  }, []);

  // Memoize the history object to prevent unnecessary rerenders
  const historyObject = useMemo(() => ({
    undo,
    redo,
    canUndo: () => historyPointer > 0,
    canRedo: () => historyPointer < history.length - 1,
    length: history.length,
  }), [undo, redo, historyPointer, history.length]);

  return {
    value,
    update,
    reset,
    history: historyObject,
  };
}
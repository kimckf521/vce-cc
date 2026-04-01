"use client";

import { useEffect, useCallback, useRef } from "react";

const STORAGE_PREFIX = "vce-exam-progress:";

interface AutoSaveData {
  selections: Record<string, string>;
  statuses: Record<string, string>;
  elapsedSeconds: number;
  savedAt: number;
}

/**
 * Auto-saves exam progress to localStorage and warns on unload.
 *
 * - Saves selections/statuses every `intervalMs` (default 5s)
 * - Warns user before closing/navigating away during an active session
 * - Provides `restore()` to recover saved state and `clear()` to clean up
 */
export function useAutoSave(sessionKey: string, intervalMs = 5000) {
  const storageKey = STORAGE_PREFIX + sessionKey;
  const dataRef = useRef<AutoSaveData>({
    selections: {},
    statuses: {},
    elapsedSeconds: 0,
    savedAt: 0,
  });
  const submittedRef = useRef(false);

  const save = useCallback(() => {
    if (submittedRef.current) return;
    try {
      dataRef.current.savedAt = Date.now();
      localStorage.setItem(storageKey, JSON.stringify(dataRef.current));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [storageKey]);

  // Periodic auto-save
  useEffect(() => {
    const id = setInterval(save, intervalMs);
    return () => clearInterval(id);
  }, [save, intervalMs]);

  // Warn before unload
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (submittedRef.current) return;
      save();
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [save]);

  const updateSelections = useCallback((selections: Record<string, string>) => {
    dataRef.current.selections = selections;
  }, []);

  const updateStatuses = useCallback((statuses: Record<string, string>) => {
    dataRef.current.statuses = statuses;
  }, []);

  const updateElapsed = useCallback((seconds: number) => {
    dataRef.current.elapsedSeconds = seconds;
  }, []);

  const markSubmitted = useCallback(() => {
    submittedRef.current = true;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const restore = useCallback((): AutoSaveData | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw) as AutoSaveData;
      // Only restore if saved within the last 4 hours
      if (Date.now() - data.savedAt > 4 * 60 * 60 * 1000) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, [storageKey]);

  return {
    updateSelections,
    updateStatuses,
    updateElapsed,
    markSubmitted,
    restore,
  };
}

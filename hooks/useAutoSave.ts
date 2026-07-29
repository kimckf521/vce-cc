"use client";

import { useEffect, useCallback, useRef } from "react";

const STORAGE_PREFIX = "vce-exam-progress:";
/** Saved sessions older than this are discarded on restore (and swept on mount). */
const MAX_AGE_MS = 4 * 60 * 60 * 1000;

interface AutoSaveData {
  selections: Record<string, string>;
  statuses: Record<string, string>;
  elapsedSeconds: number;
  savedAt: number;
  /**
   * Self-mark values keyed by part id. Only populated during the
   * post-submit marking phase; the server (per-question PATCH) holds the
   * durable copy — this covers the gap between a stepper click and the
   * debounced PATCH landing.
   */
  selfMarks: Record<string, number>;
  /** True once the exam was submitted (self-marking may still be in progress). */
  submitted: boolean;
  /**
   * Server-side ExamSession id, saved so a refresh mid-marking can keep
   * PATCHing marks to the same session row.
   */
  sessionId: string | null;
}

/**
 * Auto-saves exam progress to localStorage and warns on unload.
 *
 * - Saves selections/statuses/self-marks every `intervalMs` (default 5s)
 * - Warns user before closing/navigating away during an active session
 * - Provides `restore()` to recover saved state and `clear()` to clean up
 * - `markSubmitted(true)` keeps persistence alive through the post-submit
 *   self-marking phase; `markSubmitted()` ends the session immediately
 *   (auto-graded modes with no marking phase)
 */
export function useAutoSave(sessionKey: string, intervalMs = 5000) {
  const storageKey = STORAGE_PREFIX + sessionKey;
  const dataRef = useRef<AutoSaveData>({
    selections: {},
    statuses: {},
    elapsedSeconds: 0,
    savedAt: 0,
    selfMarks: {},
    submitted: false,
    sessionId: null,
  });
  // True once persistence for this session has ended (submitted with no
  // marking phase, or marking finished via clear()).
  const stoppedRef = useRef(false);

  const save = useCallback(() => {
    if (stoppedRef.current) return;
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

  // Sweep expired entries from OTHER sessions so abandoned exams don't pile
  // up (each key is only self-cleaned when its own session is revisited).
  useEffect(() => {
    try {
      const now = Date.now();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
        try {
          const raw = localStorage.getItem(key);
          const data = raw ? (JSON.parse(raw) as AutoSaveData) : null;
          if (!data || now - data.savedAt > MAX_AGE_MS) {
            localStorage.removeItem(key);
          }
        } catch {
          // Unparseable entry — drop it
          localStorage.removeItem(key);
        }
      }
    } catch {
      // localStorage unavailable — ignore
    }
  }, []);

  // Warn before unload
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (stoppedRef.current) return;
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

  const updateSelfMarks = useCallback((selfMarks: Record<string, number>) => {
    dataRef.current.selfMarks = selfMarks;
  }, []);

  const updateSessionId = useCallback((sessionId: string | null) => {
    dataRef.current.sessionId = sessionId;
  }, []);

  /**
   * Record submission. With `keepAlive` (self-marking modes), persistence
   * continues — the submitted flag is saved immediately so a refresh
   * mid-marking restores the results/marking view; call `clear()` once
   * marking finishes. Without it (auto-graded modes), the saved state is
   * removed and further saves stop — the pre-change behaviour.
   */
  const markSubmitted = useCallback(
    (keepAlive = false) => {
      if (keepAlive) {
        dataRef.current.submitted = true;
        save();
        return;
      }
      stoppedRef.current = true;
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    },
    [storageKey, save]
  );

  /** End the session: remove saved state and stop persisting. */
  const clear = useCallback(() => {
    stoppedRef.current = true;
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
      const parsed = JSON.parse(raw) as Partial<AutoSaveData>;
      // Only restore if saved within the last 4 hours
      if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
        localStorage.removeItem(storageKey);
        return null;
      }
      // Normalise pre-existing payloads that lack the newer fields.
      const data: AutoSaveData = {
        selections: parsed.selections ?? {},
        statuses: parsed.statuses ?? {},
        elapsedSeconds: parsed.elapsedSeconds ?? 0,
        savedAt: parsed.savedAt ?? 0,
        selfMarks: parsed.selfMarks ?? {},
        submitted: parsed.submitted ?? false,
        sessionId: parsed.sessionId ?? null,
      };
      // Seed the in-memory copy so the next periodic save re-writes the
      // restored payload rather than overwriting it with an empty one.
      dataRef.current = { ...data };
      return data;
    } catch {
      return null;
    }
  }, [storageKey]);

  return {
    updateSelections,
    updateStatuses,
    updateElapsed,
    updateSelfMarks,
    updateSessionId,
    markSubmitted,
    clear,
    restore,
  };
}

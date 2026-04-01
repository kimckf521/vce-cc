"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutHandlers {
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onNeedsReview?: () => void;
  onShowSolution?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

/**
 * Keyboard shortcuts for question interaction:
 * - c: Mark correct
 * - x: Mark incorrect
 * - r: Mark needs review
 * - s: Show solution
 * - j / ArrowDown: Next question
 * - k / ArrowUp: Previous question
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      switch (e.key) {
        case "c":
          handlers.onCorrect?.();
          break;
        case "x":
          handlers.onIncorrect?.();
          break;
        case "r":
          handlers.onNeedsReview?.();
          break;
        case "s":
          handlers.onShowSolution?.();
          break;
        case "j":
        case "ArrowDown":
          e.preventDefault();
          handlers.onNext?.();
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          handlers.onPrevious?.();
          break;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
}

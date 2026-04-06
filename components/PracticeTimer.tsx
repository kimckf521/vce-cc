"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Play, Pause, X, AlertTriangle, GripVertical, SkipForward, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "reading" | "writing" | "finished";

interface PracticeTimerProps {
  /** Reading time in seconds (default 900 = 15 min) */
  readingSeconds?: number;
  /** Writing time in seconds (default 3600 = 60 min) */
  writingSeconds?: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PracticeTimer({
  readingSeconds = 15 * 60,
  writingSeconds = 60 * 60,
}: PracticeTimerProps) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [remaining, setRemaining] = useState(readingSeconds);
  const [running, setRunning] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fiveMinWarned = useRef(false);

  // Drag state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pillRef = useRef<HTMLDivElement>(null);

  // Initialise position to top-right on mount (clamped for small screens)
  useEffect(() => {
    const pillWidth = 210;
    const x = Math.max(8, window.innerWidth - pillWidth - 12);
    setPosition({ x, y: 80 });
  }, []);

  // Show a temporary banner notification
  const showBanner = useCallback((msg: string, durationMs = 8000) => {
    setBanner(msg);
    if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    bannerTimeout.current = setTimeout(() => setBanner(null), durationMs);
  }, []);

  // Tick every second when running
  useEffect(() => {
    if (!running || dismissed) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (phase === "reading") {
            setPhase("writing");
            showBanner("Reading time is over — you may now start writing.", 10000);
            return writingSeconds;
          } else {
            setPhase("finished");
            showBanner("Time is up!", 15000);
            setRunning(false);
            return 0;
          }
        }

        if (phase === "writing" && prev - 1 === 5 * 60 && !fiveMinWarned.current) {
          fiveMinWarned.current = true;
          showBanner("5 minutes remaining!", 10000);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, dismissed, phase, writingSeconds, showBanner]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    };
  }, []);

  // Drag handlers — pointer events for mouse + touch
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    const rect = pillRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const pill = pillRef.current;
    if (!pill) return;
    const w = pill.offsetWidth;
    const h = pill.offsetHeight;
    const newX = Math.max(0, Math.min(window.innerWidth - w, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - h, e.clientY - dragOffset.current.y));
    setPosition({ x: newX, y: newY });
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Skip current phase immediately
  const handleSkipPhase = useCallback(() => {
    if (phase === "reading") {
      setPhase("writing");
      setRemaining(writingSeconds);
      showBanner("Reading time skipped — you may now start writing.", 10000);
    } else if (phase === "writing") {
      setPhase("finished");
      setRemaining(0);
      setRunning(false);
      showBanner("Time is up!", 15000);
    }
  }, [phase, writingSeconds, showBanner]);

  if (dismissed || position.x < 0) return null;

  const phaseLabel = phase === "reading" ? "Reading Time" : phase === "writing" ? "Writing Time" : "Time Up";
  const isLow = phase === "writing" && remaining <= 5 * 60 && remaining > 0;
  const isFinished = phase === "finished";

  return (
    <>
      {/* Banner notification */}
      {banner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none animate-in slide-in-from-top duration-300">
          <div className="pointer-events-auto mt-4 mx-4 flex items-center gap-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 shadow-2xl max-w-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-600 shrink-0" />
            <span className="text-sm lg:text-base font-medium">{banner}</span>
            <button onClick={() => setBanner(null)} className="ml-2 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Draggable floating timer pill */}
      <div
        ref={pillRef}
        style={{ left: position.x, top: position.y }}
        className={cn(
          "fixed z-40 flex items-center gap-1.5 rounded-2xl shadow-lg border px-3 py-2 transition-colors select-none",
          dragging && "shadow-2xl scale-105 cursor-grabbing",
          isFinished
            ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
            : isLow
            ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
            : phase === "reading"
            ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        )}
      >
        {/* Drag handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={cn(
            "flex items-center justify-center rounded-lg p-0.5 -ml-1 touch-none",
            dragging ? "cursor-grabbing" : "cursor-grab"
          )}
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-500" />
        </div>

        <Clock className={cn(
          "h-4 w-4 lg:h-5 lg:w-5 shrink-0",
          isFinished ? "text-red-500 dark:text-red-400" : isLow ? "text-yellow-600 dark:text-yellow-400" : phase === "reading" ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
        )} />

        <div className="flex flex-col leading-tight">
          <span className={cn(
            "text-[10px] lg:text-xs font-semibold uppercase tracking-wider",
            isFinished ? "text-red-500 dark:text-red-400" : isLow ? "text-yellow-600 dark:text-yellow-400" : phase === "reading" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
          )}>
            {phaseLabel}
          </span>
          <span className={cn(
            "text-lg lg:text-xl font-bold tabular-nums",
            isFinished ? "text-red-600 dark:text-red-400" : isLow ? "text-yellow-700 dark:text-yellow-400" : phase === "reading" ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
          )}>
            {formatTime(remaining)}
          </span>
        </div>

        {/* Play/Pause */}
        {!isFinished && (
          <button
            onClick={() => !locked && setRunning((v) => !v)}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              locked
                ? "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                : running
                ? "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950"
            )}
            title={locked ? "Unlock timer to pause" : running ? "Pause timer" : "Resume timer"}
            disabled={locked}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}

        {/* Skip / Finish phase */}
        {!isFinished && (
          <button
            onClick={() => !locked && handleSkipPhase()}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              locked
                ? "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                : "text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
            )}
            title={locked ? "Unlock timer to skip" : phase === "reading" ? "Skip to writing time" : "Finish now"}
            disabled={locked}
          >
            <SkipForward className="h-4 w-4" />
          </button>
        )}

        {/* Lock/Unlock toggle */}
        {!isFinished && (
          <button
            onClick={() => setLocked((v) => !v)}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              locked
                ? "text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
                : "text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            title={locked ? "Unlock timer controls" : "Lock timer controls"}
          >
            {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={() => !locked && setShowDismissConfirm(true)}
          className={cn(
            "transition-colors",
            locked ? "text-gray-200 dark:text-gray-700 cursor-not-allowed" : "text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
          )}
          title={locked ? "Unlock timer to dismiss" : "Dismiss timer"}
          disabled={locked}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dismiss confirmation dialog */}
      {showDismissConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Close Timer?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to close the timer? You won&apos;t be able to bring it back.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowDismissConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep Timer
              </button>
              <button
                onClick={() => {
                  setShowDismissConfirm(false);
                  setDismissed(true);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Close Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

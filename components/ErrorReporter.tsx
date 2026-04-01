"use client";

import { useEffect } from "react";

export default function ErrorReporter() {
  useEffect(() => {
    function reportError(payload: Record<string, unknown>) {
      fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    function handleError(event: ErrorEvent) {
      reportError({
        message: event.message,
        stack: event.error?.stack?.slice(0, 2000),
        source: `${event.filename}:${event.lineno}:${event.colno}`,
      });
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportError({
        message: reason?.message ?? String(reason),
        stack: reason?.stack?.slice(0, 2000),
        type: "unhandledrejection",
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}

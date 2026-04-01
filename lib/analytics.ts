/** Lightweight analytics client — fires events to /api/analytics */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      properties,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {});
}

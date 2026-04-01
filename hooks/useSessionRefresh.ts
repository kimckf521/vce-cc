"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Silently refreshes the Supabase auth session at a regular interval
 * to prevent token expiry during long exam sessions.
 *
 * Default: refresh every 10 minutes.
 */
export function useSessionRefresh(intervalMs = 10 * 60 * 1000) {
  useEffect(() => {
    const supabase = createClient();

    const id = setInterval(async () => {
      await supabase.auth.getSession();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
}

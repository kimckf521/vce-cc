"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Couldn't reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-green-200/70 dark:border-green-800/70 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/40 dark:to-emerald-950/30 p-10 lg:p-14 text-center shadow-sm">
        {/* Soft glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-green-300/30 dark:bg-green-500/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex rounded-full bg-green-100 dark:bg-green-900 p-4 mb-5 ring-8 ring-white/50 dark:ring-gray-900/30">
            <CheckCircle2 className="h-7 w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Message sent.
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Thanks for reaching out — we&apos;ll get back to you within two business days.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-6 inline-flex text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors underline-offset-4 hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3 lg:py-3.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all";

  return (
    <div className="relative">
      {/* Decorative glows behind the card */}
      <div className="pointer-events-none absolute -inset-4 -z-10">
        <div className="absolute -top-10 -left-8 h-40 w-40 rounded-full bg-brand-200/40 dark:bg-brand-700/20 blur-3xl" />
        <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-amber-200/30 dark:bg-amber-700/15 blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:shadow-md"
      >
        {/* Gradient accent strip at the top */}
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-amber-400" />

        {/* Header inside the card */}
        <div className="px-6 lg:px-10 pt-8 lg:pt-10 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="inline-flex rounded-xl bg-brand-100 dark:bg-brand-900/60 p-2">
              <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
              Send a message
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12 lg:ml-13">
            Real humans read every one. Usually back to you within 1–2 days.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 lg:px-10 pb-8 lg:pb-10 pt-6 space-y-5">
          {/* Honeypot — hidden from users, visible to naive bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5"
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                maxLength={100}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={200}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind…"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              className={cn(inputClass, "resize-y min-h-[140px] leading-relaxed")}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              We&apos;ll only use your email to reply. Promise.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 lg:px-7 py-3 lg:py-3.5 text-base font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

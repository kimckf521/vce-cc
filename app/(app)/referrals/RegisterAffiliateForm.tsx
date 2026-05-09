"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, Sparkles, DollarSign, Gift, Heart, Infinity as InfinityIcon } from "lucide-react";

type Track = "STUDENT_REFERRAL" | "TUTOR_AFFILIATE" | "INFLUENCER_AFFILIATE";

export default function RegisterAffiliateForm({
  availableTracks,
}: {
  availableTracks: Track[];
}) {
  const router = useRouter();
  // If only one track is available, skip the picker and go straight to its form.
  const [track, setTrack] = useState<Track | null>(
    availableTracks.length === 1 ? availableTracks[0] : null
  );
  const [abn, setAbn] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [platformHandle, setPlatformHandle] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!track) return;
    setError(null);
    setLoading(true);

    const body: Record<string, unknown> = { type: track };
    if (track !== "STUDENT_REFERRAL") body.abn = abn.replace(/\s+/g, "");
    if (track === "INFLUENCER_AFFILIATE") {
      body.platform = platform;
      body.platformHandle = platformHandle;
      if (followerCount) body.followerCount = Number(followerCount);
    }

    const res = await fetch("/api/affiliates/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to register");
      return;
    }
    router.refresh();
  }

  if (track === null) {
    const gridCols =
      availableTracks.length === 1
        ? "grid-cols-1"
        : availableTracks.length === 2
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-3";
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {availableTracks.includes("STUDENT_REFERRAL") && (
          <TrackCard
            icon={Users}
            title="Student"
            subtitle="Refer your classmates"
            reward="$5 platform credit per referral"
            onClick={() => setTrack("STUDENT_REFERRAL")}
          />
        )}
        {availableTracks.includes("TUTOR_AFFILIATE") && (
          <TrackCard
            icon={GraduationCap}
            title="Tutor"
            subtitle="Refer your students"
            reward="$10 cash per referral"
            requiresApproval
            onClick={() => setTrack("TUTOR_AFFILIATE")}
          />
        )}
        {availableTracks.includes("INFLUENCER_AFFILIATE") && (
          <TrackCard
            icon={Sparkles}
            title="Influencer"
            subtitle="Promote on social media"
            reward="$10 cash + content fee"
            requiresApproval
            onClick={() => setTrack("INFLUENCER_AFFILIATE")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6">
      {availableTracks.length > 1 && (
        <button
          onClick={() => setTrack(null)}
          className="text-sm text-brand-600 dark:text-brand-400 mb-4 hover:underline"
        >
          ← Back
        </button>
      )}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {track === "STUDENT_REFERRAL"
          ? "Refer friends, earn credit"
          : track === "TUTOR_AFFILIATE"
            ? "Apply as a tutor"
            : "Apply as an influencer"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {track === "STUDENT_REFERRAL"
          ? "Activate your referral link in one click — no application needed."
          : "Your application will be reviewed by our team. We'll notify you once approved."}
      </p>

      {/* Student referral benefits */}
      {track === "STUDENT_REFERRAL" && (
        <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-4">
            What you get
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BenefitRow
              icon={DollarSign}
              title="$5 credit per referral"
              detail="Whenever a friend signs up via your link and subscribes, you get $5 credit — that's roughly 50% off your next month."
            />
            <BenefitRow
              icon={Gift}
              title="Auto-applied to your next bill"
              detail="No coupon codes to remember. Stripe automatically deducts your credit from your next invoice."
            />
            <BenefitRow
              icon={Heart}
              title="Your friend saves too"
              detail="Friends who use your link get 50% off their first month — pay just $4.99 instead of $9.99."
            />
            <BenefitRow
              icon={InfinityIcon}
              title="No referral limit"
              detail="Refer as many classmates as you want. Credits never expire and stack — 2 referrals equal a free month."
            />
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-4 leading-relaxed">
            Track your referrals and credit balance from this page after activating.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {track !== "STUDENT_REFERRAL" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            ABN (11 digits)
          </label>
          <input
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
            placeholder="12345678901"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Required for tax purposes. You can register one free at abr.gov.au.
          </p>
        </div>
      )}

      {track === "INFLUENCER_AFFILIATE" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option>YouTube</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Channel / handle
            </label>
            <input
              value={platformHandle}
              onChange={(e) => setPlatformHandle(e.target.value)}
              placeholder="@yourhandle or channel URL"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Approximate follower count
            </label>
            <input
              type="number"
              value={followerCount}
              onChange={(e) => setFollowerCount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3 hover:bg-brand-700 transition disabled:opacity-60"
      >
        {loading ? "Submitting…" : track === "STUDENT_REFERRAL" ? "Activate" : "Submit application"}
      </button>
    </div>
  );
}

function TrackCard({
  icon: Icon,
  title,
  subtitle,
  reward,
  requiresApproval,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  reward: string;
  requiresApproval?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
    >
      <Icon className="h-7 w-7 text-brand-500 mb-3" />
      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{reward}</p>
      {requiresApproval && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Requires admin approval</p>
      )}
    </button>
  );
}

function BenefitRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900 p-2">
        <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{title}</p>
        <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed mt-0.5">
          {detail}
        </p>
      </div>
    </div>
  );
}

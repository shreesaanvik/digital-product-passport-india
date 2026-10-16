"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clusterById, ROSTER } from "@/lib/data";

const lalita = ROSTER.find((artisan) => artisan.id === "KUT-4410");

const SAMPLE_RECORDS = {
  "KUT-4410": {
    name: lalita?.name ?? "Lalita Rabari",
    craft: lalita?.craft ?? "Ajrakh block-print",
    cluster: clusterById("kutch").name,
    years: 18,
    status: "Verified",
  },
  "VAR-9982": {
    name: "Meera Devi",
    craft: "Zari Brocade",
    cluster: "Varanasi",
    years: 24,
    status: "Verified",
  },
  "KUT-4540": {
    name: "Hansa Marwada",
    craft: "Kutch embroidery",
    cluster: "Kutch",
    years: 9,
    status: "Verification Pending",
  },
} as const;

type SampleId = keyof typeof SAMPLE_RECORDS;

export type VerifiedGovId = {
  id: SampleId;
  name: string;
  craft: string;
  cluster: string;
  years: number;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[#66BB6A]" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="M6 10.2 8.7 12.9 14.2 7.2"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[#f16f0f]" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 6v4.2l2.6 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SAMPLE_IDS = Object.keys(SAMPLE_RECORDS) as SampleId[];

function isSampleId(value: string): value is SampleId {
  return Object.prototype.hasOwnProperty.call(SAMPLE_RECORDS, value);
}

type Phase = "idle" | "searching" | "found" | "missing";

type Props = {
  onVerified?: (profile: VerifiedGovId | null) => void;
};

export function GovIdSyncDemo({ onVerified }: Props = {}) {
  const [id, setId] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [profile, setProfile] = useState<(typeof SAMPLE_RECORDS)[SampleId] | null>(
    null,
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  function clearTimer() {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function check(raw: string) {
    const key = raw.trim().toUpperCase();
    setId(key);
    clearTimer();
    setProfile(null);

    if (!isSampleId(key)) {
      setPhase("missing");
      onVerified?.(null);
      return;
    }

    const record = SAMPLE_RECORDS[key];
    setPhase("searching");
    onVerified?.(null);
    timer.current = window.setTimeout(() => {
      setProfile(record);
      setPhase("found");
      onVerified?.({
        id: key,
        name: record.name,
        craft: record.craft,
        cluster: record.cluster,
        years: record.years,
      });
      timer.current = null;
    }, 1500);
  }

  return (
    <div className="space-y-4">
      <label htmlFor="gov-artisan-id" className="block text-sm font-medium text-fm-ink">
        Artisan ID Number
      </label>
      <div className="flex items-stretch gap-2">
        <input
          id="gov-artisan-id"
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="e.g. KUT-4410"
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            setPhase("idle");
            setProfile(null);
            clearTimer();
            onVerified?.(null);
          }}
          className="min-h-[52px] min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 text-lg text-fm-ink placeholder:text-slate-400 focus:border-fm-blue focus:outline-none"
        />
        <button
          type="button"
          onClick={() => check(id)}
          className="min-h-[52px] shrink-0 whitespace-nowrap rounded-xl bg-fm-btn-bg px-6 text-lg font-semibold text-white shadow-md hover:bg-fm-btn-text"
        >
          Check ID
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm text-fm-muted">Sample IDs</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_IDS.map((sampleId) => {
            const selected = id.trim().toUpperCase() === sampleId;
            return (
              <button
                key={sampleId}
                type="button"
                aria-pressed={selected}
                onClick={() => check(sampleId)}
                className={
                  selected
                    ? "min-h-[44px] rounded-full border border-fm-btn-bg bg-fm-btn-bg px-4 text-sm font-semibold text-white"
                    : "min-h-[44px] rounded-full border border-fm-blue/30 bg-fm-btn-light px-4 text-sm font-semibold text-fm-btn-text"
                }
              >
                {sampleId}
              </button>
            );
          })}
        </div>
      </div>

      {phase === "searching" && (
        <p
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-fm-surface px-4 py-3 text-fm-ink"
          role="status"
        >
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-fm-blue/30 border-t-fm-blue motion-reduce:animate-none"
            aria-hidden
          />
          Contacting national registry
        </p>
      )}

      {phase === "missing" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="status">
          ID not found.
        </p>
      )}

      <AnimatePresence>
        {phase === "found" && profile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-fm-green/25 bg-fm-green-soft px-4 py-4"
            role="status"
          >
            <p className="font-display text-xl font-semibold text-fm-ink">{profile.name}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#0f0e0e]">Craft</dt>
                <dd className="text-right text-fm-ink">{profile.craft}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#0f0e0e]">Cluster</dt>
                <dd className="text-right text-fm-ink">{profile.cluster}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#0f0e0e]">Years of practice</dt>
                <dd className="text-right text-fm-ink">{profile.years}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-2 font-semibold text-fm-ink">
              {profile.status === "Verified" ? <CheckIcon /> : <ClockIcon />}
              {profile.status}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

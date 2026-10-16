"use client";

import { useState } from "react";
import { DemoSheet } from "./demos/DemoSheet";
import { EsprCheckDemo } from "./demos/EsprCheckDemo";
import { EscrowPayoutsDemo } from "./demos/EscrowPayoutsDemo";
import { ESPR_SAMPLE_FIELDS } from "./demos/esprFields";
import { FingerprintDemo } from "./demos/FingerprintDemo";
import { GovIdSyncDemo } from "./demos/GovIdSyncDemo";
import { PassportViewerDemo } from "./demos/PassportViewerDemo";
import { ProofOfHandDemo } from "./demos/ProofOfHandDemo";

type FeatureId = "passport" | "gov-id" | "fingerprint" | "escrow" | "espr" | "proof";

type Capability = {
  id: FeatureId;
  name: string;
  description: string;
};

const CAPABILITIES: Capability[] = [
  {
    id: "passport",
    name: "Passport viewer",
    description: "The page a buyer or customs officer opens from the label QR code.",
  },
  {
    id: "gov-id",
    name: "Government ID Sync",
    description: "Pull a verified artisan profile from a national ID database.",
  },
  {
    id: "fingerprint",
    name: "Tamper-proof fingerprint",
    description: "A unique fingerprint of the passport data so any later change is detectable.",
  },
  {
    id: "escrow",
    name: "Escrow payouts",
    description: "Buyer funds are held and released to the artisan at each verified milestone.",
  },
  {
    id: "espr",
    name: "ESPR field check",
    description: "Check a passport against required EU fields before shipping.",
  },
  {
    id: "proof",
    name: "Proof of Hand capture",
    description: "The steward records geo-tagged, time-stamped evidence of the artisan's work.",
  },
];

const DATA_HANDLING = [
  "Consent is given verbally, in the artisan's language, and recorded by the steward.",
  "Artisans do not need an account, device or fees.",
  "Data storage location and access rules are to be confirmed with government partners.",
];

const PRESENT_FIELDS = ESPR_SAMPLE_FIELDS.filter((field) => field.present).map(
  (field) => field.label,
);
const MISSING_FIELDS = ESPR_SAMPLE_FIELDS.filter((field) => !field.present).map(
  (field) => field.label,
);

type Props = {
  onOpenPassport: () => void;
};

export function FeaturesScreen({ onOpenPassport }: Props) {
  const [activeId, setActiveId] = useState<FeatureId | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const active = CAPABILITIES.find((item) => item.id === activeId) ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-fm-blue">Features</h1>
        <p className="mt-2 text-fm-muted">Try each part of the platform.</p>
      </header>

      <ul className="flex flex-col gap-3">
        {CAPABILITIES.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-neu"
          >
            <p className="font-display text-lg font-semibold text-fm-ink">{item.name}</p>
            <p className="mt-1 text-sm text-fm-muted">{item.description}</p>
            <button
              type="button"
              onClick={() => setActiveId(item.id)}
              className="btn-outline mt-3 min-h-[48px] w-full font-semibold"
            >
              Try it
            </button>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
        <h2 className="font-display text-lg font-semibold text-fm-ink">How data is handled</h2>
        <ul className="mt-2 space-y-2 text-sm text-fm-ink">
          {DATA_HANDLING.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
        <h2 className="font-display text-lg font-semibold text-fm-ink">
          ESPR fields in this passport
        </h2>
        <p className="mt-2 text-sm text-fm-ink">Present: {PRESENT_FIELDS.join(", ")}.</p>
        <p className="mt-1 text-sm text-fm-ink">Missing: {MISSING_FIELDS.join(", ")}.</p>
      </section>

      <DemoSheet
        open={active != null}
        title={active?.name ?? "Feature"}
        onClose={() => setActiveId(null)}
        onReset={() => setResetKey((value) => value + 1)}
      >
        {active?.id === "passport" && (
          <PassportViewerDemo
            key={resetKey}
            onOpenPassport={() => {
              setActiveId(null);
              onOpenPassport();
            }}
          />
        )}
        {active?.id === "gov-id" && <GovIdSyncDemo key={resetKey} />}
        {active?.id === "fingerprint" && <FingerprintDemo key={resetKey} />}
        {active?.id === "escrow" && <EscrowPayoutsDemo key={resetKey} />}
        {active?.id === "espr" && <EsprCheckDemo key={resetKey} />}
        {active?.id === "proof" && <ProofOfHandDemo key={resetKey} />}
      </DemoSheet>
    </div>
  );
}

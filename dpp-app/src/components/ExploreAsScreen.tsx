"use client";

import Image from "next/image";
import { PHONE_PAGE_ID } from "@/lib/appScrollLock";
import { EXPLORE_CARDS, type Role } from "@/lib/roles";

type Props = {
  onSelect: (role: Role) => void;
};

export function ExploreAsScreen({ onSelect }: Props) {
  return (
    <main id={PHONE_PAGE_ID} className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt="Fashion Mingle"
          width={280}
          height={32}
          className="h-8 w-auto"
          style={{ width: "auto", height: "32px" }}
          priority
        />
        <h1 className="font-display mt-8 text-3xl font-semibold text-fm-blue">
          Explore as
        </h1>
        <p className="mt-2 text-fm-muted">
          Demo with sample data. No account needed.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {EXPLORE_CARDS.map((card) => (
          <li key={card.role}>
            <button
              type="button"
              onClick={() => onSelect(card.role)}
              className="w-full rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-neu transition-colors hover:bg-fm-surface min-h-[88px]"
            >
              <span className="block font-display text-xl font-semibold text-fm-ink">
                {card.title}
              </span>
              <span className="mt-1 block text-sm text-fm-muted">{card.line}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import {
  makersForCluster,
  profileById,
  type ClusterId,
  type Profile,
} from "@/lib/data";
import { BackLink } from "./BackLink";

const LocationMap = dynamic(() => import("./IndiaMap").then((m) => m.IndiaMap), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[200px] w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100 text-sm text-fm-muted shadow-neu"
      role="status"
      aria-live="polite"
    >
      Loading map…
    </div>
  ),
});

type Props = {
  profileId: string;
  onBack: () => void;
  onOpen: (id: string) => void;
};

export function ProfileMark({
  profile,
  size = "md",
}: {
  profile: Profile;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-11 w-11 text-lg" : "h-16 w-16 text-2xl";

  if (profile.logo) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 ${box}`}
        aria-hidden
      >
        <Image
          src={profile.logo}
          alt=""
          width={128}
          height={128}
          className="h-auto w-auto max-h-full max-w-full object-contain"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </span>
    );
  }

  const initial = profile.avatar?.initial ?? profile.name.charAt(0);
  const color = profile.avatar?.color ?? "#b55194";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${box}`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function ClusterMakers({
  clusterId,
  onOpen,
}: {
  clusterId: ClusterId;
  onOpen: (id: string) => void;
}) {
  const makers = makersForCluster(clusterId);

  return (
    <section className="mt-4" aria-labelledby="cluster-makers-heading">
      <h2 id="cluster-makers-heading" className="font-display text-lg font-semibold text-fm-ink">
        Makers in this cluster
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {makers.map((maker) => (
          <li key={maker.id}>
            <button
              type="button"
              onClick={() => onOpen(maker.id)}
              className="flex w-full min-h-[44px] items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-neu"
            >
              <ProfileMark profile={maker} size="sm" />
              <span className="min-w-0">
                <span className="block font-semibold text-fm-ink">{maker.name}</span>
                <span className="block text-sm text-fm-muted">{maker.typeLabel}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProfilePage({ profileId, onBack, onOpen }: Props) {
  const profile = profileById(profileId);
  const [openStockist, setOpenStockist] = useState<number | null>(null);

  if (!profile) {
    return (
      <div className="min-w-0 text-fm-ink">
        <BackLink onClick={onBack} />
        <p className="mt-4">This profile is not available.</p>
      </div>
    );
  }

  const related = profile.worksWith.flatMap((id) => {
    const linked = profileById(id);
    return linked ? [linked] : [];
  });

  return (
    <div className="min-w-0 text-fm-ink">
      <BackLink onClick={onBack} />

      <header className="mt-2 flex items-start gap-3">
        <ProfileMark profile={profile} />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold leading-tight text-fm-ink">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm font-semibold text-fm-btn-text">{profile.typeLabel}</p>
          <p className="mt-1 text-fm-ink">{profile.description}</p>
        </div>
      </header>

      <section className="mt-6" aria-labelledby="profile-location-heading">
        <h2 id="profile-location-heading" className="font-display text-lg font-semibold text-fm-ink">
          Location
        </h2>
        <div className="mt-2">
          <LocationMap
            pin={{
              lat: profile.location.lat,
              lng: profile.location.lng,
              label: profile.location.name,
            }}
          />
        </div>
        <p className="mt-2 text-fm-ink">{profile.location.name}</p>
      </section>

      {profile.experience.length > 0 && (
        <section className="mt-6" aria-labelledby="profile-experience-heading">
          <h2
            id="profile-experience-heading"
            className="font-display text-lg font-semibold text-fm-ink"
          >
            Supply chain experience
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {profile.experience.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {(profile.exportStatus || profile.markets) && (
        <section className="mt-6" aria-labelledby="profile-export-heading">
          <h2 id="profile-export-heading" className="font-display text-lg font-semibold text-fm-ink">
            Export readiness
          </h2>
          {profile.exportStatus && <p className="mt-2">{profile.exportStatus}</p>}
          {profile.exportCode && <p>{profile.exportCode}</p>}
          {profile.markets && <p className="mt-1">Markets served: {profile.markets}</p>}
        </section>
      )}

      <section className="mt-6" aria-labelledby="profile-stockists-heading">
        <h2 id="profile-stockists-heading" className="font-display text-lg font-semibold text-fm-ink">
          Stockists
        </h2>
        {profile.stockists.length === 0 ? (
          <p className="mt-2">none listed yet</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {profile.stockists.map((stockist, index) => {
              const open = openStockist === index;
              return (
                <li key={`${stockist.name}-${stockist.city}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenStockist(open ? null : index)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left shadow-neu ${
                      open ? "border-fm-blue" : "border-slate-100"
                    }`}
                  >
                    <span className="block font-semibold text-fm-ink">{stockist.name}</span>
                    <span className="mt-1 block text-fm-muted">
                      {stockist.city}, {stockist.country}
                    </span>
                    {stockist.via && <span className="mt-1 block text-sm">{stockist.via}</span>}
                    {open && (
                      <span className="mt-2 block">
                        <span className="block">{stockist.stocks}</span>
                        <span className="block">Stocking since {stockist.since}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-6" aria-labelledby="profile-works-heading">
          <h2 id="profile-works-heading" className="font-display text-lg font-semibold text-fm-ink">
            Works with
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {related.map((linked) => (
              <li key={linked.id}>
                <button
                  type="button"
                  onClick={() => onOpen(linked.id)}
                  className="flex w-full min-h-[44px] items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-neu"
                >
                  <ProfileMark profile={linked} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-fm-btn-text">{linked.name}</span>
                    <span className="block text-sm text-fm-muted">{linked.typeLabel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

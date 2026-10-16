"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { CLUSTERS, profileById } from "@/lib/data";
import {
  BOTTOM_TABS,
  defaultScreen,
  isRole,
  roleTooltip,
  type AppScreen,
  type Role,
} from "@/lib/roles";
import { PHONE_PAGE_ID, scrollPhoneToTop } from "@/lib/appScrollLock";
import { NavMenuDrawer } from "./NavMenuDrawer";
import { ExploreAsScreen } from "./ExploreAsScreen";
import { PassportPanel } from "./PassportPanel";
import { PayCategoryScreen } from "./PayCategoryScreen";
import { RfpCategoryScreen } from "./RfpCategoryScreen";
import { FeaturesScreen } from "./FeaturesScreen";
import { ArtisanHome, type ArtisanPanel } from "./ArtisanHome";
import { ClusterMakers, ProfilePage } from "./ProfilePage";
import { ArtisanStory } from "./ArtisanStory";
import { StewardExperience } from "./StewardExperience";
import { ManufacturerExperience } from "./ManufacturerExperience";

const IndiaMap = dynamic(
  () => import("./IndiaMap").then((m) => m.IndiaMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full min-h-[260px] max-h-[320px] rounded-2xl bg-gradient-to-b from-slate-100 to-white shadow-neu border border-slate-200/80 flex items-center justify-center text-fm-muted text-sm"
        role="status"
        aria-live="polite"
      >
        Loading map…
      </div>
    ),
  },
);

function BuiltLater() {
  return (
    <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-fm-ink shadow-neu">
      This view is being built
    </p>
  );
}

export function HomeExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role: Role | null = isRole(roleParam) ? roleParam : null;

  const [clusterId, setClusterId] = useState("kutch");
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<AppScreen>(role ? defaultScreen(role) : "home");
  const [screenRole, setScreenRole] = useState<Role | null>(role);
  const [artisanPanel, setArtisanPanel] = useState<ArtisanPanel>("home");
  const [profileStack, setProfileStack] = useState<string[]>([]);
  const seenRole = useRef(role);
  const profileId =
    role != null && screenRole === role ? (profileStack[profileStack.length - 1] ?? null) : null;

  const activeScreen: AppScreen =
    role == null
      ? "home"
      : screenRole === role
        ? screen
        : defaultScreen(role);

  useEffect(() => {
    if (seenRole.current === role) return;
    seenRole.current = role;
    setScreenRole(role);
    setScreen(role ? defaultScreen(role) : "home");
    setArtisanPanel("home");
    setMenuOpen(false);
    setProfileStack([]);
  }, [role]);

  useEffect(() => {
    scrollPhoneToTop();
  }, [role, activeScreen, profileId]);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.scrollTo(0, 0);
    }
  }, [profileId]);

  const setRole = useCallback(
    (next: Role | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("role", next);
      else params.delete("role");
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const openProfile = useCallback((id: string) => {
    setProfileStack((stack) => (stack[stack.length - 1] === id ? stack : [...stack, id]));
  }, []);

  const closeProfile = useCallback(() => {
    setProfileStack((stack) => stack.slice(0, -1));
  }, []);

  const cluster = CLUSTERS.find((c) => c.id === clusterId) ?? null;
  const avatarProfileId =
    role === "steward" ? "karigar" : role === "artisan" ? "lalita" : role === "manufacturer" ? "bhujodi" : null;

  if (!role) {
    return <ExploreAsScreen onSelect={setRole} />;
  }

  const tabs = BOTTOM_TABS[role];
  const bottomActive = tabs.some((tab) => tab.id === activeScreen) ? activeScreen : null;

  return (
    <>
      <AppHeader
        menuOpen={menuOpen}
        onMenuClick={() => setMenuOpen((open) => !open)}
        role={role}
        tooltip={roleTooltip(role)}
        onAvatarClick={
          avatarProfileId && profileById(avatarProfileId)
            ? () => openProfile(avatarProfileId)
            : undefined
        }
      />

      <NavMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSwitchRole={() => {
          setMenuOpen(false);
          setRole(null);
        }}
        onOpenScreen={(next) => {
          setProfileStack([]);
          setScreen(next);
          setMenuOpen(false);
        }}
        activeScreen={activeScreen}
      />

      <div id={PHONE_PAGE_ID}>
      <main className={`mx-auto max-w-lg px-4 pt-4 ${tabs.length > 0 ? "pb-28" : "pb-8"}`}>
        {profileId && (
          <ProfilePage key={profileId} profileId={profileId} onBack={closeProfile} onOpen={openProfile} />
        )}
        <div hidden={profileId !== null}>
        {activeScreen === "clusters" && (
          <>
            <IndiaMap selectedId={clusterId} onSelect={setClusterId} />
            {cluster && (
              <div
                className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-neu"
                role="region"
                aria-live="polite"
              >
                <div className="relative h-[120px] w-full">
                  <Image
                    src={cluster.image}
                    alt={cluster.imageAlt}
                    fill
                    sizes="(max-width: 512px) 100vw, 512px"
                    className="rounded-t-2xl object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display text-xl font-semibold text-fm-ink">{cluster.name}</p>
                  <p className="text-fm-muted">{cluster.craft}</p>
                  <p className="mt-2 text-fm-ink">
                    <strong>{cluster.orders}</strong> active orders ·{" "}
                    <strong>{cluster.artisans}</strong> artisans
                  </p>
                </div>
              </div>
            )}
            {role === "creative" && cluster && (
              <ClusterMakers clusterId={cluster.id} onOpen={openProfile} />
            )}
            <button
              type="button"
              onClick={() => setScreen("passport")}
              className="btn-primary mt-4 w-full min-h-[52px] text-lg font-semibold"
            >
              See a product passport
            </button>
          </>
        )}

        {role === "steward" &&
          (activeScreen === "artisans" || activeScreen === "passports") && (
            <StewardExperience screen={activeScreen} onOpenProfile={openProfile} />
          )}

        {role === "manufacturer" &&
          (activeScreen === "order" || activeScreen === "passport") && (
            <ManufacturerExperience screen={activeScreen} onScreen={setScreen} />
          )}

        {activeScreen === "passport" && role !== "manufacturer" && (
          <PassportPanel
            clusterId={cluster?.id ?? "kutch"}
            defaultShowTech={role === "government"}
          />
        )}

        {activeScreen === "rfps" && <RfpCategoryScreen />}

        {activeScreen === "pay" && <PayCategoryScreen />}

        {activeScreen === "story" && (
          <ArtisanStory
            onOpenPassport={() => {
              if (role === "artisan") {
                setArtisanPanel("passport");
                setScreen("home");
                return;
              }
              setClusterId("kutch");
              setScreen(role === "steward" ? "passports" : "passport");
            }}
          />
        )}

        {activeScreen === "whats-live" && (
          <FeaturesScreen
            onOpenPassport={() =>
              setScreen(role === "steward" ? "passports" : "passport")
            }
          />
        )}

        {role === "artisan" && activeScreen === "home" && (
          <ArtisanHome
            panel={artisanPanel}
            onPanel={setArtisanPanel}
            onOpenProfile={() => openProfile("lalita")}
          />
        )}

        {((activeScreen === "order" && role !== "manufacturer") ||
          (activeScreen === "home" && role !== "artisan") ||
          (activeScreen === "artisans" && role !== "steward")) && <BuiltLater />}
        </div>
      </main>
      </div>

      {tabs.length > 0 && (
        <BottomNav
          tabs={tabs}
          active={bottomActive}
          onChange={(next) => {
            setProfileStack([]);
            setScreen(next);
          }}
        />
      )}
    </>
  );
}

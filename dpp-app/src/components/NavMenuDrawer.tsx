"use client";

import { useEffect } from "react";
import { lockAppScroll } from "@/lib/appScrollLock";
import type { AppScreen } from "@/lib/roles";
import { PhoneOverlay } from "./PhoneOverlay";

type MenuScreen = Extract<AppScreen, "story" | "pay" | "whats-live">;

type Props = {
  open: boolean;
  onClose: () => void;
  onSwitchRole: () => void;
  onOpenScreen: (screen: MenuScreen) => void;
  activeScreen: AppScreen | null;
};

const ITEMS: { id: "switch-role" | MenuScreen; title: string }[] = [
  { id: "switch-role", title: "Switch role" },
  { id: "story", title: "Artisan's story" },
  { id: "pay", title: "Pay" },
  { id: "whats-live", title: "Features" },
];

export function NavMenuDrawer({
  open,
  onClose,
  onSwitchRole,
  onOpenScreen,
  activeScreen,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    return lockAppScroll();
  }, [open]);

  return (
    <PhoneOverlay>
    <>
      <div
        className={`fixed inset-0 z-[60] bg-fm-ink/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <div
        id="app-nav-drawer"
        className={`fixed left-0 top-0 z-[70] flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <p className="font-display text-lg font-semibold text-fm-blue">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 min-w-[44px] items-center justify-center rounded-xl text-fm-muted hover:bg-fm-surface hover:text-fm-ink"
            aria-label="Close menu"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="App sections">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((item) => {
              const isActive = item.id !== "switch-role" && activeScreen === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.id === "switch-role") onSwitchRole();
                      else onOpenScreen(item.id);
                    }}
                    className={`w-full min-h-[52px] rounded-xl px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "bg-fm-btn-light border border-fm-blue/25"
                        : "hover:bg-fm-surface border border-transparent"
                    }`}
                  >
                    <span
                      className={`block font-display font-semibold ${
                        isActive ? "text-fm-btn-text" : "text-fm-ink"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
    </PhoneOverlay>
  );
}

"use client";

import Image from "next/image";
import type { Role } from "@/lib/roles";
import { RoleAvatar } from "./RoleAvatar";

type Props = {
  onMenuClick: () => void;
  menuOpen: boolean;
  role: Role;
  tooltip: string;
  onAvatarClick?: () => void;
};

export function AppHeader({ onMenuClick, menuOpen, role, tooltip, onAvatarClick }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-fm-surface/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl bg-white shadow-neu text-fm-blue"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="app-nav-drawer"
        >
          <span className="block h-0.5 w-5 rounded-full bg-current" aria-hidden />
          <span className="block h-0.5 w-5 rounded-full bg-current" aria-hidden />
          <span className="block h-0.5 w-5 rounded-full bg-current" aria-hidden />
        </button>
        <div className="text-center flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Fashion Mingle"
            width={148}
            height={24}
            className="h-[24px] w-auto max-w-none shrink-0 object-contain"
            style={{
              width: "auto",
              height: "24px",
              maxWidth: "none",
              objectFit: "contain",
              aspectRatio: "4117 / 669",
            }}
            priority
          />
          <p className="text-xs text-fm-ink -mt-0.5">
            Digital Product Passport
          </p>
          <span className="mt-1 inline-flex items-center rounded-full border-[1.5px] border-[#0081A1] bg-white px-2 py-0.5 text-[11px] font-semibold leading-none text-[#006E8A]">
            Demo
          </span>
        </div>
        <RoleAvatar role={role} label={tooltip} onClick={onAvatarClick} />
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import { ROLE_COLORS, ROLE_PROFILES, type Role } from "@/lib/roles";

type Props = {
  role: Role;
  size?: "md" | "lg";
  label?: string;
};

export function RoleAvatar({ role, size = "md", label }: Props) {
  const box = size === "lg" ? "h-24 w-24 text-4xl" : "h-11 w-11 text-xl";
  const named = label
    ? { title: label, "aria-label": label }
    : { "aria-hidden": true as const };

  if (role === "steward") {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 ${box}`}
        {...named}
      >
        <Image
          src="/karigar-logo.png"
          alt=""
          width={200}
          height={200}
          className="h-auto w-auto max-h-full max-w-full object-contain"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${box}`}
      style={{ backgroundColor: ROLE_COLORS[role].edge }}
      {...named}
    >
      {ROLE_PROFILES[role].initial}
    </div>
  );
}

export const ROLES = [
  "steward",
  "artisan",
  "creative",
  "manufacturer",
  "government",
] as const;

export type Role = (typeof ROLES)[number];

export type AppScreen =
  | "home"
  | "artisans"
  | "passports"
  | "clusters"
  | "passport"
  | "rfps"
  | "order"
  | "whats-live"
  | "story"
  | "pay";

export type BottomTab = {
  id: AppScreen;
  label: string;
  icon: string;
};

export type RoleProfile = {
  initial: string;
  name: string;
  roleLabel: string;
};

export function isRole(value: string | null): value is Role {
  return value != null && (ROLES as readonly string[]).includes(value);
}

export const ROLE_PROFILES: Record<Role, RoleProfile> = {
  steward: { initial: "P", name: "Priya", roleLabel: "Fair Trade Enterprise" },
  artisan: { initial: "L", name: "Lalita", roleLabel: "Artisan" },
  creative: { initial: "M", name: "Maren", roleLabel: "Creative" },
  manufacturer: { initial: "D", name: "Devan", roleLabel: "Manufacturer" },
  government: {
    initial: "G",
    name: "Government / Trade Groups",
    roleLabel: "Government / Trade Groups",
  },
};

/** Edge color is the role color. Title is a darker same hue only when the role color is too light on white. */
export const ROLE_COLORS: Record<Role, { edge: string; title: string }> = {
  steward: { edge: "#66BB6A", title: "#3a823e" },
  artisan: { edge: "#b55194", title: "#b55194" },
  creative: { edge: "#f16f0f", title: "#c1570b" },
  manufacturer: { edge: "#9351b5", title: "#9351b5" },
  government: { edge: "#1799b5", title: "#1799b5" },
};

export function roleTooltip(role: Role): string {
  if (role === "steward") {
    return "Priya Chauhan, Field coordinator, Karigar Collective";
  }
  const { name, roleLabel } = ROLE_PROFILES[role];
  if (name === roleLabel) return roleLabel;
  return `${name}, ${roleLabel}`;
}

export const EXPLORE_CARDS: { role: Role; title: string; line: string }[] = [
  {
    role: "steward",
    title: "Fair Trade Enterprise",
    line: "Onboard artisans and record proof of their work",
  },
  {
    role: "artisan",
    title: "Artisan",
    line: "Profile, Payments, and Passports",
  },
  {
    role: "creative",
    title: "Creative",
    line: "Discover Artisans, Post RFPs, View Passports",
  },
  {
    role: "manufacturer",
    title: "Manufacturer",
    line: "Track pooled orders back to each maker",
  },
  {
    role: "government",
    title: "Government / Trade Groups",
    line: "Passport Review and Export Data Tracking.",
  },
];

export const BOTTOM_TABS: Record<Role, BottomTab[]> = {
  steward: [
    { id: "artisans", label: "Artisans", icon: "☺" },
    { id: "passports", label: "Passports", icon: "▣" },
  ],
  artisan: [],
  creative: [
    { id: "clusters", label: "Clusters", icon: "◎" },
    { id: "passport", label: "Passport", icon: "▣" },
    { id: "rfps", label: "RFPs", icon: "📁" },
  ],
  manufacturer: [
    { id: "order", label: "Order", icon: "☰" },
    { id: "passport", label: "Passport", icon: "▣" },
  ],
  government: [
    { id: "clusters", label: "Clusters", icon: "◎" },
    { id: "passport", label: "Passport", icon: "▣" },
    { id: "whats-live", label: "Features", icon: "●" },
  ],
};

export function defaultScreen(role: Role): AppScreen {
  return BOTTOM_TABS[role][0]?.id ?? "home";
}

export const SAMPLE_INR_PER_USD = 84;

export const PASSPORT_COUNTRY = "IN";

export const CLUSTERS = [
  {
    id: "vns",
    name: "Varanasi",
    craft: "Zari Brocade",
    orders: 24,
    artisans: 890,
    x: 62,
    y: 42,
    lat: 25.3176,
    lng: 82.9739,
    image: "/clusters/varanasi.jpg",
    imageAlt: "Banarasi zari brocade pattern, Varanasi",
  },
  {
    id: "kutch",
    name: "Kutch",
    craft: "Ajrakh Block-Print",
    orders: 12,
    artisans: 250,
    x: 38,
    y: 58,
    lat: 23.242,
    lng: 69.6669,
    image: "/clusters/kutch.jpg",
    imageAlt: "Ajrakh block-print pattern, Kutch",
  },
  {
    id: "kanchi",
    name: "Kanchipuram",
    craft: "Temple Silk",
    orders: 18,
    artisans: 410,
    x: 52,
    y: 88,
    lat: 12.8342,
    lng: 79.7036,
    image: "/clusters/kanchipuram.jpg",
    imageAlt: "Kanchipuram temple silk pattern",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    craft: "Bandhani & Gems",
    orders: 31,
    artisans: 620,
    x: 35,
    y: 48,
    lat: 26.9124,
    lng: 75.7873,
    image: "/clusters/jaipur.jpg",
    imageAlt: "Bandhani tie-dye pattern, Jaipur",
  },
  {
    id: "murshidabad",
    name: "Murshidabad",
    craft: "Murshidabad Silk",
    orders: 9,
    artisans: 180,
    x: 58,
    y: 52,
    lat: 24.1839,
    lng: 88.2717,
    image: "/clusters/murshidabad.jpg",
    imageAlt: "Murshidabad printed silk pattern",
  },
] as const;

export const BHUJODI_PATTERN = {
  image: "/clusters/bhujodi.jpg",
  imageAlt: "Bhujodi handloom weave pattern",
} as const;

export type ClusterId = (typeof CLUSTERS)[number]["id"];

export function clusterById(id: ClusterId) {
  const cluster = CLUSTERS.find((item) => item.id === id);
  if (!cluster) {
    throw new Error(`Unknown cluster ${id}`);
  }
  return cluster;
}

function originGeo(id: ClusterId): string {
  const cluster = clusterById(id);
  return `${cluster.lat},${cluster.lng}`;
}

export type ClusterPassport = {
  product: string;
  material: string;
  artisan: string;
  stages: readonly string[];
  currentStage: string;
  origin_geo: string;
};

export const CLUSTER_PASSPORTS: Record<ClusterId, ClusterPassport> = {
  kutch: {
    product: "Ajrakh cotton fabric",
    material: "Cotton, natural indigo and madder dyes",
    artisan: "Lalita Rabari, Ajrakhpur",
    stages: [
      "Fabric preparation",
      "Block printing",
      "Dyeing and washing",
      "Quality check",
      "Shipped",
    ],
    currentStage: "Quality check",
    origin_geo: originGeo("kutch"),
  },
  vns: {
    product: "Banarasi silk saree",
    material: "Mulberry silk, zari",
    artisan: "Lakshmi Devi, Varanasi",
    stages: ["Loom setup", "Weaving", "Quality check", "Shipped"],
    currentStage: "Weaving",
    origin_geo: originGeo("vns"),
  },
  kanchi: {
    product: "Kanchipuram silk saree",
    material: "Mulberry silk, zari",
    artisan: "Weaver, Kanchipuram co-operative",
    stages: ["Loom setup", "Weaving", "Quality check", "Shipped"],
    currentStage: "Quality check",
    origin_geo: originGeo("kanchi"),
  },
  jaipur: {
    product: "Bandhani dupatta",
    material: "Cotton, natural dyes",
    artisan: "Artisan, Jaipur co-operative",
    stages: ["Tying", "Dyeing", "Opening and finishing", "Quality check", "Shipped"],
    currentStage: "Dyeing",
    origin_geo: originGeo("jaipur"),
  },
  murshidabad: {
    product: "Murshidabad silk stole",
    material: "Mulberry silk",
    artisan: "Weaver, Murshidabad co-operative",
    stages: ["Loom setup", "Weaving", "Quality check", "Shipped"],
    currentStage: "Loom setup",
    origin_geo: originGeo("murshidabad"),
  },
};

export function stageIndex(stages: readonly string[], current: string): number {
  const index = stages.indexOf(current);
  return index < 0 ? 0 : index;
}

export function inrFromUsd(usd: number): number {
  return usd * SAMPLE_INR_PER_USD;
}

type Milestone = {
  usd: number;
  release: string;
  paymentLabel: string;
  status: "paid" | "waiting";
  date?: string;
};

export const MAIN_ORDER = {
  code: "FM-KUT-2026",
  buyer: "Maren Voss studio",
  product: "Ajrakh cotton fabric, 20 metres",
  routeFrom: "Kutch, India",
  routeTo: "New York, USA",
  dutyNote: "HTS 5208.52 (printed cotton fabric)",
  buyerPays: 625,
  split: {
    artisan: { usd: 500, share: 80 },
    logistics: { usd: 93.75, share: 15, shipping: 62.75, importDuty: 31 },
    platformFee: { usd: 31.25, share: 5 },
  },
  milestones: [
    {
      usd: 150,
      release: "Block printing done",
      paymentLabel: "Order started",
      status: "paid",
      date: "12 Sep",
    },
    {
      usd: 200,
      release: "Quality check passed",
      paymentLabel: "After quality check",
      status: "waiting",
    },
    {
      usd: 150,
      release: "Shipped",
      paymentLabel: "After shipping",
      status: "waiting",
    },
  ] satisfies Milestone[],
};

export const OLD_PAYOUT_SHARES = [
  { label: "Exporter", share: 40 },
  { label: "Middlemen", share: 30 },
  { label: "Other costs", share: 15 },
  { label: "Artisan", share: 15 },
] as const;

export const MINGLE_PAYOUT_SHARES = [
  { label: "Platform fee", share: MAIN_ORDER.split.platformFee.share },
  { label: "Logistics", share: MAIN_ORDER.split.logistics.share },
  { label: "Artisan", share: MAIN_ORDER.split.artisan.share },
] as const;

export const LANDED_COST_LINES = [
  {
    label: "Artisan payout",
    amount: MAIN_ORDER.split.artisan.usd,
    note: "Paid on this order",
    prominent: true,
  },
  {
    label: "Shipping",
    amount: MAIN_ORDER.split.logistics.shipping,
    note: "Negotiated DHL / India Post rate",
    prominent: false,
  },
  {
    label: "Import duty",
    amount: MAIN_ORDER.split.logistics.importDuty,
    note: MAIN_ORDER.dutyNote,
    prominent: false,
  },
  {
    label: "Platform fee",
    amount: MAIN_ORDER.split.platformFee.usd,
    note: "Connects supply & compliance",
    prominent: false,
  },
] as const;

export type ArtisanPayment = {
  label: string;
  amount: number;
  status: "paid" | "waiting";
  date?: string;
};

export const ARTISAN = {
  name: "Lalita Rabari",
  craft: "Ajrakh block-print",
  cluster: "Kutch, Gujarat",
  generation: "Third-generation block-printer",
  steward: {
    name: "Priya Chauhan",
    role: "Field coordinator, Karigar Collective",
    lastVisit: "28 Sep",
  },
  order: {
    code: MAIN_ORDER.code,
    product: MAIN_ORDER.product,
    buyer: MAIN_ORDER.buyer,
  },
  stages: CLUSTER_PASSPORTS.kutch.stages,
  currentStage: stageIndex(
    CLUSTER_PASSPORTS.kutch.stages,
    CLUSTER_PASSPORTS.kutch.currentStage,
  ),
  payments: MAIN_ORDER.milestones.map(
    (milestone): ArtisanPayment => ({
      label: milestone.paymentLabel,
      amount: inrFromUsd(milestone.usd),
      status: milestone.status,
      ...(milestone.date ? { date: milestone.date } : {}),
    }),
  ),
  currency: "INR",
};

export const STEWARD = {
  name: "Priya Chauhan",
  role: "Steward",
  area: "Kutch, Gujarat",
} as const;

export type RosterStatus = "Verified" | "Needs Visit" | "Consent Pending";

export type StewardConsent = {
  date: string;
  language: string;
};

export type RosterArtisan = {
  id: string;
  name: string;
  craft: string;
  village: string;
  status: RosterStatus;
  consent: StewardConsent | null;
  orderCode: string | null;
};

export const ROSTER: RosterArtisan[] = [
  {
    id: "KUT-4410",
    name: "Lalita Rabari",
    craft: "Ajrakh block-print",
    village: "Ajrakhpur",
    status: "Verified",
    consent: { date: "2 Sep", language: "Kutchi" },
    orderCode: MAIN_ORDER.code,
  },
  {
    id: "KUT-4417",
    name: "Aamir Khatri",
    craft: "Ajrakh block-print",
    village: "Ajrakhpur",
    status: "Verified",
    consent: { date: "3 Sep", language: "Kutchi" },
    orderCode: null,
  },
  {
    id: "KUT-4502",
    name: "Rekha Vankar",
    craft: "Handloom weaving",
    village: "Bhujodi",
    status: "Needs Visit",
    consent: { date: "20 Aug", language: "Gujarati" },
    orderCode: "FM-KUT-2031",
  },
  {
    id: "KUT-4521",
    name: "Kanku Ahir",
    craft: "Ahir embroidery",
    village: "Dhaneti",
    status: "Consent Pending",
    consent: null,
    orderCode: null,
  },
  {
    id: "KUT-4533",
    name: "Hasina Khatri",
    craft: "Bandhani",
    village: "Bhuj",
    status: "Verified",
    consent: { date: "5 Sep", language: "Kutchi" },
    orderCode: null,
  },
];

export const MANUFACTURER = {
  name: "Devan Kapoor",
  org: "Bhujodi Weavers Co-operative",
  area: "Bhujodi, Kutch",
} as const;

export type PooledMaterials = {
  yarn: string;
  yarnSource: string;
  dye: string;
};

export type PooledPiece = {
  id: string;
  makerId: string;
  carton: "A" | "B";
  wovenDate: string;
  recordedBy: string;
};

const POOLED_MAKERS = [
  { id: "KUT-4502", name: "Rekha Vankar", village: "Bhujodi", pieces: 10 },
  { id: "KUT-4606", name: "Mavji Vankar", village: "Bhujodi", pieces: 8 },
  { id: "KUT-4611", name: "Shamji Vankar", village: "Bhujodi", pieces: 8 },
  { id: "KUT-4615", name: "Lakshmi Vankar", village: "Sarli", pieces: 7 },
  { id: "KUT-4620", name: "Naran Vankar", village: "Sarli", pieces: 7 },
] as const;

function wovenDateForIndex(index: number): string {
  const day = 1 + Math.round((index * 24) / 39);
  return `${day} Sep`;
}

function buildPooledPieces(): PooledPiece[] {
  const pieces: PooledPiece[] = [];
  let number = 1;
  for (const maker of POOLED_MAKERS) {
    for (let count = 0; count < maker.pieces; count += 1) {
      pieces.push({
        id: `SH-${String(number).padStart(2, "0")}`,
        makerId: maker.id,
        carton: number <= 20 ? "A" : "B",
        wovenDate: wovenDateForIndex(number - 1),
        recordedBy: STEWARD.name,
      });
      number += 1;
    }
  }
  return pieces;
}

export const POOLED_PIECES: PooledPiece[] = buildPooledPieces();

export const POOLED_ORDER = {
  code: "FM-KUT-2031",
  product: "Handwoven wool shawl",
  buyer: "Maren Voss studio",
  totalPieces: 40,
  stage: "Packed for shipping",
  materials: {
    yarn: "Merino wool",
    yarnSource: "Spun locally in Kutch",
    dye: "Natural indigo",
  } satisfies PooledMaterials,
  makers: POOLED_MAKERS,
  cartons: [
    { id: "Carton A", pieces: "SH-01 to SH-20" },
    { id: "Carton B", pieces: "SH-21 to SH-40" },
  ],
} as const;

export const POOLED_PASSPORT = {
  product: POOLED_ORDER.product,
  material: `${POOLED_ORDER.materials.yarn}, ${POOLED_ORDER.materials.dye}`,
  stages: ["Loom setup", "Weaving", "Quality check", "Ship to warehouse"] as const,
  currentStage: "Quality check",
  origin_geo: originGeo("kutch"),
};

export type EvidenceEntry = {
  stage: string;
  date: string;
};

export const EVIDENCE_GPS = "23.24 N, 69.67 E";

export const EVIDENCE_LOG: EvidenceEntry[] = [
  { stage: "Fabric preparation", date: "12 Sep, 10:14" },
  { stage: "Block printing", date: "18 Sep, 11:02" },
  { stage: "Dyeing and washing", date: "24 Sep, 09:40" },
  { stage: "Quality check started", date: "28 Sep, 15:25" },
];

export function formatInr(amount: number): string {
  const grouped = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${grouped.replace(/\s/g, "")}`;
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function passportJsonLd(input: {
  product: string;
  material: string;
  artisan?: string;
  origin_geo: string;
  stages: readonly string[];
  currentStage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.product,
    material: input.material,
    ...(input.artisan ? { artisan: input.artisan } : {}),
    countryOfOrigin: { "@type": "Country", name: PASSPORT_COUNTRY },
    additionalProperty: [{ name: "origin_geo", value: input.origin_geo }],
    stages: [...input.stages],
    currentStage: input.currentStage,
  };
}

export function artisanPaymentTotals(payments: readonly ArtisanPayment[]) {
  let received = 0;
  let waiting = 0;
  for (const payment of payments) {
    if (payment.status === "paid") received += payment.amount;
    else waiting += payment.amount;
  }
  return { received, waiting };
}

export function artisanPaymentStatus(payment: ArtisanPayment): string {
  if (payment.status === "paid") return payment.date ? `Paid ${payment.date}` : "Paid";
  if (payment.label === "After quality check") return "When quality check is done";
  if (payment.label === "After shipping") return "When shipped";
  return "Waiting";
}

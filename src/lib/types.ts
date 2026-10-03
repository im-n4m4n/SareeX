import type { ColorOption } from "@/db/schema";

/** Shared facet shapes. Previously duplicated as 5 near-identical local types. */
export type Facet = {
  slug: string;
  name: string;
  image?: string | null;
  tagline?: string;
  region?: string;
  story?: string;
};

export type DiscoverCategory = {
  slug: string;
  name: string;
  description: string;
  image: string | null;
  pieceCount: number;
};

export type DiscoverCollection = DiscoverCategory;

export type { ColorOption };

/** The one canonical colour palette. The catalogue uses all of these names. */
export const COLOR_SWATCHES: ReadonlyArray<{ name: string; hex: string }> = [
  { name: "Maroon", hex: "#6B1E2A" },
  { name: "Ruby", hex: "#9B1B30" },
  { name: "Emerald", hex: "#0F5132" },
  { name: "Gold", hex: "#C9A24B" },
  { name: "Marigold", hex: "#E0A21B" },
  { name: "Saffron", hex: "#E2711D" },
  { name: "Peacock Blue", hex: "#1E5A7A" },
  { name: "Blush", hex: "#E8B4B8" },
  { name: "Ivory", hex: "#F1E7D3" },
  { name: "Indigo", hex: "#1F2A44" },
  { name: "Noir", hex: "#1C1512" },
  { name: "Mint", hex: "#A9CDB5" },
  { name: "Lilac", hex: "#B79AC8" },
];

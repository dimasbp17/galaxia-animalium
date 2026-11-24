export interface Region {
  slug: string;
  label: string;
  /** ID place di iNaturalist */
  placeId: number;
}

export const INDONESIA: Region = {
  slug: "indonesia",
  label: "Indonesia",
  placeId: 6966,
};

export const REGIONS: Region[] = [INDONESIA];

export function getRegion(slug: string | null | undefined) {
  return REGIONS.find((r) => r.slug === slug);
}

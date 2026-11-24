import type { ConservationStatus, Taxon } from "@/types/animal";

export interface IucnCategory {
  code: string;
  label: string;
  /** Kelas Tailwind untuk badge */
  className: string;
}

/** Kategori Daftar Merah IUCN, dipetakan dari kode numerik iNaturalist. */
const IUCN: Record<number, IucnCategory> = {
  5: { code: "DD", label: "Kurang Data", className: "bg-stone-200 text-stone-700" },
  10: { code: "LC", label: "Risiko Rendah", className: "bg-emerald-100 text-emerald-800" },
  20: { code: "NT", label: "Hampir Terancam", className: "bg-lime-100 text-lime-800" },
  30: { code: "VU", label: "Rentan", className: "bg-amber-100 text-amber-800" },
  40: { code: "EN", label: "Genting", className: "bg-orange-100 text-orange-800" },
  50: { code: "CR", label: "Kritis", className: "bg-red-100 text-red-800" },
  60: { code: "EW", label: "Punah di Alam Liar", className: "bg-purple-100 text-purple-800" },
  70: { code: "EX", label: "Punah", className: "bg-stone-800 text-stone-100" },
};

export function getIucnCategory(
  status: ConservationStatus | null | undefined
): IucnCategory | null {
  if (!status?.iucn) return null;
  return IUCN[status.iucn] ?? null;
}

/** Status IUCN global (bukan status per negara/wilayah). */
export function getGlobalStatus(taxon: Taxon): ConservationStatus | null {
  const global = taxon.conservation_statuses?.find(
    (s) => s.authority === "IUCN Red List" && !s.place
  );
  return global ?? taxon.conservation_status ?? null;
}

/** Status yang berlaku khusus di suatu tempat (mis. Indonesia). */
export function getPlaceStatus(
  taxon: Taxon,
  placeId: number
): ConservationStatus | null {
  return taxon.conservation_statuses?.find((s) => s.place?.id === placeId) ?? null;
}

/** Kartu hanya menampilkan badge untuk status Hampir Terancam ke atas. */
export function isNotable(status: ConservationStatus | null | undefined) {
  return (status?.iucn ?? 0) >= 20;
}

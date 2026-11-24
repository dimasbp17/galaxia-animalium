import { inaturalistApi } from "@/lib/api";
import { ALL_ANIMALS_TAXON_ID } from "@/lib/categories";
import { INDONESIA } from "@/lib/regions";
import type {
  ObservationBounds,
  PaginatedResponse,
  SpeciesCount,
  Taxon,
} from "@/types/animal";

export interface AnimalFilters {
  query?: string;
  /** Batasi ke kelompok tertentu (mis. Mamalia). Default: semua hewan. */
  taxonId?: number;
  /** Batasi ke wilayah (place_id iNaturalist), mis. Indonesia. */
  placeId?: number;
  /** Hanya spesies berstatus terancam (versi iNaturalist: NT ke atas). */
  threatened?: boolean;
}

/** iNaturalist membatasi paginasi sampai 10.000 hasil. */
export const MAX_RESULTS = 10000;

/**
 * Ambil daftar spesies hewan, diurutkan dari yang paling sering diamati.
 *
 * - Tanpa filter wilayah/terancam → endpoint `/taxa` (pencarian nama paling akurat).
 * - Dengan filter wilayah/terancam → endpoint `/observations/species_counts`,
 *   karena `/taxa` tidak mendukung kedua filter itu.
 */
export async function fetchAnimals(
  { query, taxonId = ALL_ANIMALS_TAXON_ID, placeId, threatened }: AnimalFilters,
  page = 1,
  perPage = 24
): Promise<PaginatedResponse<Taxon>> {
  const q = query?.trim() || undefined;

  if (placeId || threatened) {
    const { data } = await inaturalistApi.get<PaginatedResponse<SpeciesCount>>(
      "/observations/species_counts",
      {
        params: {
          q,
          taxon_id: taxonId,
          place_id: placeId,
          threatened: threatened || undefined,
          rank: "species",
          page,
          per_page: perPage,
        },
      }
    );
    return { ...data, page, per_page: perPage, results: data.results.map((r) => r.taxon) };
  }

  const { data } = await inaturalistApi.get<PaginatedResponse<Taxon>>("/taxa", {
    params: {
      q,
      taxon_id: taxonId,
      rank: "species",
      is_active: true,
      order_by: "observations_count",
      order: "desc",
      page,
      per_page: perPage,
    },
  });
  return { ...data, page, per_page: perPage };
}

/** Detail satu taxon (termasuk ancestors, taxon_photos, conservation_statuses). */
export async function getAnimalById(id: number): Promise<Taxon | null> {
  const { data } = await inaturalistApi.get<PaginatedResponse<Taxon>>(`/taxa/${id}`);
  return data.results[0] ?? null;
}

export interface ObservationSummary {
  /** Kotak batas observasi liar terverifikasi — untuk mengatur zoom peta. */
  bounds: ObservationBounds | null;
  indonesiaCount: number;
}

/** Ringkasan observasi untuk peta sebaran & statistik Indonesia. */
export async function getObservationSummary(
  taxonId: number
): Promise<ObservationSummary> {
  const [world, indonesia] = await Promise.all([
    // Hanya observasi liar (bukan kebun binatang) yang sudah terverifikasi,
    // supaya batas peta tidak melebar karena data penangkaran/salah lokasi.
    inaturalistApi.get<PaginatedResponse<unknown> & { total_bounds?: ObservationBounds }>(
      "/observations",
      {
        params: {
          taxon_id: taxonId,
          captive: false,
          quality_grade: "research",
          per_page: 0,
          return_bounds: true,
        },
      }
    ),
    inaturalistApi.get<PaginatedResponse<unknown>>("/observations", {
      params: { taxon_id: taxonId, place_id: INDONESIA.placeId, per_page: 0 },
    }),
  ]);
  return {
    bounds: world.data.total_bounds ?? null,
    indonesiaCount: indonesia.data.total_results,
  };
}

/** URL tile peta observasi iNaturalist (untuk Leaflet). */
export function observationTileUrl(
  type: "grid" | "points",
  taxonId: number,
  color: string
) {
  const base = inaturalistApi.defaults.baseURL ?? "https://api.inaturalist.org/v1";
  // captive=false → sembunyikan observasi di kebun binatang/penangkaran
  return `${base}/${type}/{z}/{x}/{y}.png?taxon_id=${taxonId}&captive=false&color=${encodeURIComponent(color)}`;
}

/** Ubah URL foto iNaturalist ke ukuran lain (square/small/medium/large). */
export function photoSize(
  url: string,
  size: "square" | "small" | "medium" | "large"
) {
  return url.replace(/\/(square|small|medium|large|original)\./, `/${size}.`);
}

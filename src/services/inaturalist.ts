import { inaturalistApi } from "@/lib/api";
import { ALL_ANIMALS_TAXON_ID } from "@/lib/categories";
import type { PaginatedResponse, Taxon } from "@/types/animal";

export interface SearchAnimalsParams {
  query?: string;
  /** Batasi ke kelompok tertentu (mis. Mamalia). Default: semua hewan. */
  taxonId?: number;
  page?: number;
  perPage?: number;
}

/**
 * Cari spesies hewan. Tanpa query → spesies paling sering diobservasi.
 */
export async function searchAnimals({
  query,
  taxonId = ALL_ANIMALS_TAXON_ID,
  page = 1,
  perPage = 24,
}: SearchAnimalsParams = {}): Promise<PaginatedResponse<Taxon>> {
  const { data } = await inaturalistApi.get<PaginatedResponse<Taxon>>(
    "/taxa",
    {
      params: {
        q: query?.trim() || undefined,
        taxon_id: taxonId,
        rank: "species",
        is_active: true,
        order_by: "observations_count",
        order: "desc",
        page,
        per_page: perPage,
      },
    }
  );
  return data;
}

/** Detail satu taxon (termasuk ancestors & taxon_photos). */
export async function getAnimalById(id: number): Promise<Taxon | null> {
  const { data } = await inaturalistApi.get<PaginatedResponse<Taxon>>(
    `/taxa/${id}`
  );
  return data.results[0] ?? null;
}

/** Ubah URL foto iNaturalist ke ukuran lain (square/small/medium/large). */
export function photoSize(
  url: string,
  size: "square" | "small" | "medium" | "large"
) {
  return url.replace(/\/(square|small|medium|large|original)\./, `/${size}.`);
}

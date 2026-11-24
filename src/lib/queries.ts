import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  fetchAnimals,
  getAnimalById,
  getObservationSummary,
  MAX_RESULTS,
  type AnimalFilters,
} from "@/services/inaturalist";
import { findWikiSummary } from "@/services/wikipedia";

/**
 * Semua query API dikumpulkan di sini supaya query key konsisten
 * dan hasilnya bisa dipakai ulang (cache) antar halaman.
 */

export const animalsQuery = (filters: AnimalFilters, perPage: number) =>
  queryOptions({
    queryKey: ["animals", "page", filters, perPage],
    queryFn: () => fetchAnimals(filters, 1, perPage),
  });

export const animalsInfiniteQuery = (filters: AnimalFilters, perPage: number) =>
  infiniteQueryOptions({
    queryKey: ["animals", "infinite", filters, perPage],
    queryFn: ({ pageParam }) => fetchAnimals(filters, pageParam, perPage),
    initialPageParam: 1,
    getNextPageParam: (last, all) => {
      const loaded = all.length * perPage;
      const total = Math.min(last.total_results, MAX_RESULTS);
      return last.results.length > 0 && loaded < total ? all.length + 1 : undefined;
    },
  });

export const animalQuery = (id: number) =>
  queryOptions({
    queryKey: ["animal", id],
    queryFn: () => getAnimalById(id),
    enabled: Number.isFinite(id),
  });

export const observationSummaryQuery = (taxonId: number) =>
  queryOptions({
    queryKey: ["observation-summary", taxonId],
    queryFn: () => getObservationSummary(taxonId),
  });

export const wikiQuery = (titles: (string | undefined)[]) =>
  queryOptions({
    queryKey: ["wiki", titles],
    // Kalau Wikipedia gagal, anggap saja tidak ada deskripsi.
    queryFn: () => findWikiSummary(titles).catch(() => null),
    staleTime: 60 * 60 * 1000,
  });

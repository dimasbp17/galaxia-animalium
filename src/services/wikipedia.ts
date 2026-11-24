import axios from "axios";
import { wikipediaApi } from "@/lib/api";
import type { WikiSummary } from "@/types/animal";

/**
 * Ambil ringkasan artikel Wikipedia. Mengembalikan null kalau artikel tidak ada.
 */
export async function getWikiSummary(title: string): Promise<WikiSummary | null> {
  const slug = encodeURIComponent(title.trim().replace(/ /g, "_"));
  try {
    const { data } = await wikipediaApi.get<WikiSummary>(
      `/page/summary/${slug}`
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/**
 * Coba beberapa judul berurutan (mis. nama umum lalu nama ilmiah),
 * kembalikan ringkasan pertama yang ditemukan.
 */
export async function findWikiSummary(
  titles: (string | undefined | null)[]
): Promise<WikiSummary | null> {
  for (const title of titles) {
    if (!title) continue;
    const summary = await getWikiSummary(title);
    if (summary?.extract) return summary;
  }
  return null;
}

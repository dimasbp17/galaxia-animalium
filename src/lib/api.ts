import axios from "axios";

/**
 * Client untuk iNaturalist API (data spesies + foto).
 * Docs: https://api.inaturalist.org/v1/docs/
 * Tidak butuh API key untuk request baca. Rate limit ~60 request/menit.
 */
export const inaturalistApi = axios.create({
  baseURL:
    import.meta.env.VITE_INATURALIST_API_URL ?? "https://api.inaturalist.org/v1",
  timeout: 15000,
  params: {
    locale: import.meta.env.VITE_API_LOCALE ?? "id",
  },
});

/**
 * Client untuk Wikipedia REST API (ringkasan/deskripsi).
 * Docs: https://en.wikipedia.org/api/rest_v1/
 */
export const wikipediaApi = axios.create({
  baseURL:
    import.meta.env.VITE_WIKIPEDIA_API_URL ??
    "https://id.wikipedia.org/api/rest_v1",
  timeout: 15000,
});

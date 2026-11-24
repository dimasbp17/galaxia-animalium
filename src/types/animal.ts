// ---- iNaturalist ----

export interface TaxonPhoto {
  id: number;
  square_url: string;
  medium_url: string;
  url: string;
  attribution: string;
  license_code: string | null;
}

export interface ConservationStatus {
  authority: string | null;
  status: string;
  status_name?: string;
  /** Kode numerik IUCN: 5 DD, 10 LC, 20 NT, 30 VU, 40 EN, 50 CR, 60 EW, 70 EX */
  iucn: number | null;
  place?: { id: number; name: string; display_name?: string } | null;
}

export interface Taxon {
  id: number;
  name: string; // nama ilmiah
  rank: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  observations_count: number;
  wikipedia_url: string | null;
  default_photo: TaxonPhoto | null;
  ancestors?: Taxon[];
  taxon_photos?: { photo: TaxonPhoto }[];
  /** Status ringkas (biasanya IUCN global). Muncul di hasil pencarian. */
  conservation_status?: ConservationStatus | null;
  /** Semua status dari berbagai lembaga. Hanya di endpoint detail. */
  conservation_statuses?: ConservationStatus[];
}

export interface PaginatedResponse<T> {
  total_results: number;
  page: number;
  per_page: number;
  results: T[];
}

export interface SpeciesCount {
  count: number;
  taxon: Taxon;
}

export interface ObservationBounds {
  swlat: number;
  swlng: number;
  nelat: number;
  nelng: number;
}

// ---- Wikipedia ----

export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls: { desktop: { page: string } };
}

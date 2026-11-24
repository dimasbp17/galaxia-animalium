// ---- iNaturalist ----

export interface TaxonPhoto {
  id: number;
  square_url: string;
  medium_url: string;
  url: string;
  attribution: string;
  license_code: string | null;
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
}

export interface PaginatedResponse<T> {
  total_results: number;
  page: number;
  per_page: number;
  results: T[];
}

// ---- Wikipedia ----

export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls: { desktop: { page: string } };
}

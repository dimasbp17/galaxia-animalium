/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INATURALIST_API_URL?: string;
  readonly VITE_WIKIPEDIA_API_URL?: string;
  readonly VITE_API_LOCALE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

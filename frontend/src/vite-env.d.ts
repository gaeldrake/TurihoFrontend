/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base du backend Flask (ex. https://api.turiho.bj — JAMAIS codée en dur ailleurs). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

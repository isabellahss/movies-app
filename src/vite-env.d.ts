/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Token de lectura (v4) o API key (v3) de TMDB. Va en .env.local */
  readonly VITE_TMDB_TOKEN?: string
  /** Fuerza la fuente de datos: 'local', 'demo' o 'tmdb' */
  readonly VITE_CATALOG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

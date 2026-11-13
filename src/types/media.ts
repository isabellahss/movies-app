/** Dibujo decorativo que se pinta encima del degradado de una portada. */
export type Motif = 'city' | 'sun' | 'grid' | 'stars' | 'planet' | 'waves'

/** Portada generada con CSS (no usamos imágenes reales). */
export interface Artwork {
  from: string
  to: string
  motif: Motif
}

export type MediaType = 'series' | 'movie'

export interface Title {
  id: string
  title: string
  type: MediaType
  year: number
  rating: number
  /** Reproducciones totales (solo en el catálogo local) */
  views?: number
  /** "2h 15m" o "3 temporadas" */
  duration?: string
  genres: string[]
  description: string
  /** Portada de colores (se usa si no hay imagen). Si falta, se usa una por defecto. */
  art?: Artwork
  /** Imagen vertical (2:3): URL o ruta dentro de public/ */
  poster?: string
  /** Imagen horizontal (16:9) para el banner y las tarjetas anchas */
  backdrop?: string
  /** Enlace o id del tráiler de YouTube */
  trailer?: string
  /** Tráiler como archivo de video (mp4/m4v), por ejemplo los de iTunes */
  trailerVideo?: string
  /** Fecha de estreno "AAAA-MM-DD" (en series, la del primer episodio) */
  releaseDate?: string
  /**
   * Solo series: sus temporadas. Con TMDB llegan en el detalle (sin la lista
   * de episodios, que se pide aparte). En el catálogo local puedes escribirlas
   * con sus episodios; si faltan, se generan episodios de ejemplo.
   */
  seasons?: Season[]
  /** Solo series: último episodio emitido y el próximo, si se conoce */
  episodes?: {
    last?: EpisodeInfo
    next?: EpisodeInfo
  }
}

export interface Season {
  number: number
  /** "Temporada 1" si se deja vacío */
  name?: string
  episodeCount: number
  /** "AAAA-MM-DD" */
  airDate?: string
  episodes?: Episode[]
}

export interface Episode {
  number: number
  name: string
  overview?: string
  /** Imagen del episodio (16:9) */
  still?: string
  /** En minutos */
  runtime?: number
  /** "AAAA-MM-DD"; si es futura, el episodio aún no se puede ver */
  airDate?: string
}

export interface EpisodeInfo {
  season: number
  episode: number
  /** "AAAA-MM-DD" */
  date: string
  name?: string
}

export interface ContinueWatchingItem {
  title: Title
  episode: string
  /** Porcentaje visto, de 0 a 100 */
  progress: number
}

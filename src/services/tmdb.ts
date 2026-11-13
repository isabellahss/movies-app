import type {
  Episode,
  EpisodeInfo,
  MediaType,
  Season,
  Title,
} from '../types/media.ts'
import { daysFromToday, isFuture } from '../utils/dates.ts'

/**
 * Cliente de The Movie Database (https://www.themoviedb.org).
 * La clave se lee de VITE_TMDB_TOKEN en .env.local.
 *
 * Aviso: en una app solo de frontend la clave acaba en el código que
 * descarga el navegador. Para un proyecto personal está bien; en producción
 * conviene pasar las peticiones por un backend propio.
 */
const TOKEN = import.meta.env.VITE_TMDB_TOKEN?.trim() ?? ''
export const hasTmdb = TOKEN.length > 0

const API = 'https://api.themoviedb.org/3'
const IMAGES = 'https://image.tmdb.org/t/p'
/** Español latinoamericano. Usa 'es-ES' para los títulos de España. */
const LANGUAGE = 'es-MX'

type TmdbKind = 'movie' | 'tv'

interface TmdbVideo {
  key: string
  site: string
  type: string
  official: boolean
  iso_639_1: string
}

interface TmdbItem {
  id: number
  media_type?: string
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  overview?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  poster_path?: string | null
  backdrop_path?: string | null
  runtime?: number | null
  number_of_seasons?: number
  videos?: { results: TmdbVideo[] }
  seasons?: TmdbSeason[]
  last_episode_to_air?: TmdbEpisode | null
  next_episode_to_air?: TmdbEpisode | null
}

interface TmdbSeason {
  season_number: number
  name?: string
  episode_count: number
  air_date?: string | null
}

interface TmdbSeasonDetail {
  episodes: {
    episode_number: number
    name?: string
    overview?: string
    still_path?: string | null
    runtime?: number | null
    air_date?: string | null
  }[]
}

/** Quita "Especiales" (temporada 0) salvo que sea la única, y las vacías. */
function toSeasons(seasons?: TmdbSeason[]): Season[] | undefined {
  if (!seasons) return undefined
  const valid = seasons.filter((s) => s.episode_count > 0)
  const regular = valid.filter((s) => s.season_number > 0)
  return (regular.length ? regular : valid).map((s) => ({
    number: s.season_number,
    name: s.name || undefined,
    episodeCount: s.episode_count,
    airDate: s.air_date || undefined,
  }))
}

interface TmdbEpisode {
  air_date?: string | null
  season_number: number
  episode_number: number
  name?: string
}

function toEpisode(ep?: TmdbEpisode | null): EpisodeInfo | undefined {
  if (!ep?.air_date) return undefined
  return {
    season: ep.season_number,
    episode: ep.episode_number,
    date: ep.air_date,
    name: ep.name || undefined,
  }
}

interface TmdbPage {
  page: number
  total_pages: number
  total_results: number
  results: TmdbItem[]
}

async function request<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(API + path)
  url.searchParams.set('language', LANGUAGE)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  // El token de lectura (v4) es un JWT que empieza por "eyJ"; si no, es la API key v3
  const headers: Record<string, string> = { accept: 'application/json' }
  if (TOKEN.startsWith('eyJ')) headers.Authorization = `Bearer ${TOKEN}`
  else url.searchParams.set('api_key', TOKEN)

  const res = await fetch(url, { headers })
  if (res.status === 401) {
    throw new Error(
      'TMDB rechazó la clave. Revisa VITE_TMDB_TOKEN en el archivo .env.local.',
    )
  }
  if (!res.ok) throw new Error(`TMDB respondió con un error (${res.status}).`)
  return res.json() as Promise<T>
}

// Los listados solo traen ids de género; los nombres se piden una vez
let genresPromise: Promise<Map<number, string>> | undefined
function getGenres() {
  genresPromise ??= Promise.all([
    request<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),
    request<{ genres: { id: number; name: string }[] }>('/genre/tv/list'),
  ]).then(
    ([movie, tv]) =>
      new Map([...movie.genres, ...tv.genres].map((g) => [g.id, g.name])),
    (error) => {
      genresPromise = undefined // permite reintentar
      throw error
    },
  )
  return genresPromise
}

function formatDuration(item: TmdbItem): string | undefined {
  if (item.runtime) {
    const h = Math.floor(item.runtime / 60)
    const m = item.runtime % 60
    return h ? `${h}h${m ? ` ${m.toString().padStart(2, '0')}m` : ''}` : `${m}m`
  }
  if (item.number_of_seasons) {
    const n = item.number_of_seasons
    return `${n} ${n === 1 ? 'temporada' : 'temporadas'}`
  }
  return undefined
}

/** Elige el mejor tráiler: de YouTube, en español si hay, y oficial. */
function pickTrailer(videos: TmdbVideo[] = []): string | undefined {
  const score = (v: TmdbVideo) =>
    (v.type === 'Trailer' ? 4 : 0) +
    (v.iso_639_1 === 'es' ? 2 : 0) +
    (v.official ? 1 : 0)
  const best = videos
    .filter(
      (v) =>
        v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
    )
    .sort((a, b) => score(b) - score(a))[0]
  return best?.key
}

function toTitle(
  item: TmdbItem,
  kind: TmdbKind,
  genres: Map<number, string>,
): Title {
  const date = item.release_date || item.first_air_date || ''
  return {
    id: `${kind}-${item.id}`,
    title: item.title ?? item.name ?? 'Sin título',
    type: kind === 'tv' ? 'series' : 'movie',
    year: Number(date.slice(0, 4)) || 0,
    // TMDB puntúa de 0 a 10; la app usa de 0 a 5
    rating: Math.round((item.vote_average ?? 0) * 5) / 10,
    duration: formatDuration(item),
    genres:
      item.genres?.map((g) => g.name) ??
      (item.genre_ids ?? []).flatMap((id) => genres.get(id) ?? []),
    description: item.overview || 'Sin sinopsis disponible.',
    poster: item.poster_path ? `${IMAGES}/w342${item.poster_path}` : undefined,
    backdrop: item.backdrop_path
      ? `${IMAGES}/w1280${item.backdrop_path}`
      : undefined,
    trailer: pickTrailer(item.videos?.results),
    releaseDate: date || undefined,
    seasons: toSeasons(item.seasons),
    // Solo vienen en el detalle de una serie
    episodes:
      item.last_episode_to_air || item.next_episode_to_air
        ? {
            last: toEpisode(item.last_episode_to_air),
            next: toEpisode(item.next_episode_to_air),
          }
        : undefined,
  }
}

const isKind = (value?: string): value is TmdbKind =>
  value === 'movie' || value === 'tv'

/** Pide un listado. Si `kind` falta, cada resultado trae su media_type. */
async function list(
  path: string,
  kind?: TmdbKind,
  params: Record<string, string | number> = {},
) {
  const [page, genres] = await Promise.all([
    request<TmdbPage>(path, params),
    getGenres(),
  ])
  const items = page.results.flatMap((item) => {
    const k = kind ?? item.media_type
    return isKind(k) ? [toTitle(item, k, genres)] : [] // descarta personas
  })
  return {
    items,
    // TMDB no deja pasar de la página 500
    totalPages: Math.min(page.total_pages, 500),
    totalResults: page.total_results,
  }
}

/** Alterna elementos de dos listas: a1, b1, a2, b2… */
function interleave<T>(a: T[], b: T[]): T[] {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
    [a[i], b[i]].filter((x) => x !== undefined),
  ).flat()
}

const toKind = (type: MediaType): TmdbKind =>
  type === 'series' ? 'tv' : 'movie'

export const tmdb = {
  trending: () => list('/trending/all/week'),
  popular: (type: MediaType, page = 1) =>
    list(`/${toKind(type)}/popular`, toKind(type), { page }),
  async newest() {
    const { items } = await list('/movie/now_playing', 'movie')
    return items.sort((a, b) => b.year - a.year)
  },
  async topRated() {
    const [movies, series] = await Promise.all([
      list('/movie/top_rated', 'movie'),
      list('/tv/top_rated', 'tv'),
    ])
    return interleave(movies.items, series.items)
  },
  /** Películas y series que aún no se estrenaron, las más esperadas primero. */
  async upcoming() {
    const [movies, series] = await Promise.all([
      list('/movie/upcoming', 'movie'),
      list('/discover/tv', 'tv', {
        'first_air_date.gte': daysFromToday(1),
        sort_by: 'popularity.desc',
      }),
    ])
    // /movie/upcoming incluye algunas que ya se estrenaron
    return interleave(movies.items, series.items).filter((t) =>
      isFuture(t.releaseDate),
    )
  },
  async search(query: string) {
    const { items } = await list('/search/multi', undefined, {
      query,
      include_adult: 'false',
    })
    return items
  },
  /** Episodios de una temporada. */
  async season(id: string, seasonNumber: number): Promise<Episode[]> {
    const tmdbId = id.replace(/^tv-/, '')
    const data = await request<TmdbSeasonDetail>(
      `/tv/${tmdbId}/season/${seasonNumber}`,
    )
    return data.episodes.map((ep) => ({
      number: ep.episode_number,
      // Sin traducción TMDB deja el nombre vacío
      name: ep.name || `Episodio ${ep.episode_number}`,
      overview: ep.overview || undefined,
      still: ep.still_path ? `${IMAGES}/w300${ep.still_path}` : undefined,
      runtime: ep.runtime ?? undefined,
      airDate: ep.air_date || undefined,
    }))
  },
  /** Detalle completo (duración y tráiler). Ids con forma "movie-603" o "tv-1399". */
  async details(id: string): Promise<Title | undefined> {
    const [kind, tmdbId] = id.split('-')
    if (!isKind(kind) || !/^\d+$/.test(tmdbId ?? '')) return undefined
    try {
      const item = await request<TmdbItem>(`/${kind}/${tmdbId}`, {
        append_to_response: 'videos',
        // Los tráileres suelen estar en inglés; se aceptan también
        include_video_language: 'es,en,null',
      })
      return toTitle(item, kind, new Map())
    } catch (error) {
      if (error instanceof Error && error.message.includes('(404)'))
        return undefined
      throw error
    }
  },
}

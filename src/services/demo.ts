import type {
  Episode,
  EpisodeInfo,
  MediaType,
  Season,
  Title,
} from '../types/media.ts'
import { isFuture, todayISO } from '../utils/dates.ts'

/**
 * MODO DEMO: datos reales de APIs gratuitas que no piden clave, para ver
 * cómo queda la app mientras no tengas la de TMDB.
 *
 *  - Series: TVmaze (https://www.tvmaze.com/api). Sinopsis en inglés.
 *  - Películas: ranking de iTunes México (en español, con tráiler en video).
 *
 * Limitaciones: la búsqueda de películas solo mira el ranking (la búsqueda
 * de iTunes no funciona), las películas no tienen valoración ni imagen
 * horizontal, y TVmaze no tiene tráileres.
 */

const TVMAZE = 'https://api.tvmaze.com'
const ITUNES = 'https://itunes.apple.com'
const ITUNES_COUNTRY = 'mx'
const PAGE_SIZE = 20

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(
      `El servicio de datos respondió con un error (${res.status}).`,
    )
  return res.json() as Promise<T>
}

/** Guarda la promesa para no repetir peticiones (y la olvida si falla). */
const memo = new Map<string, Promise<unknown>>()
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  let promise = memo.get(key) as Promise<T> | undefined
  if (!promise) {
    promise = load()
    promise.catch(() => memo.delete(key))
    memo.set(key, promise)
  }
  return promise
}

const paginate = <T>(items: T[], page: number) => ({
  items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  totalPages: Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
  totalResults: items.length,
})

function interleave<T>(a: T[], b: T[]): T[] {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
    [a[i], b[i]].filter((x) => x !== undefined),
  ).flat()
}

/** Quita duplicados por id manteniendo el orden. */
function unique(titles: Title[]): Title[] {
  const seen = new Set<string>()
  return titles.filter((t) => !seen.has(t.id) && seen.add(t.id))
}

// ---------------------------------------------------------------------------
// Series: TVmaze
// ---------------------------------------------------------------------------

interface TvmEpisode {
  id: number
  season: number
  number: number | null
  name?: string
  airdate?: string
  runtime?: number | null
  image?: { medium?: string; original?: string } | null
  summary?: string | null
}

interface TvmShow {
  id: number
  name: string
  genres: string[]
  premiered?: string | null
  averageRuntime?: number | null
  rating?: { average: number | null }
  weight: number
  image?: { medium?: string; original?: string } | null
  summary?: string | null
  _embedded?: {
    seasons?: {
      number: number
      name?: string
      episodeOrder?: number | null
      premiereDate?: string | null
    }[]
    previousepisode?: TvmEpisode
    nextepisode?: TvmEpisode
  }
}

interface TvmImage {
  type: string | null
  main: boolean
  resolutions: { original: { url: string } }
}

const GENRES_ES: Record<string, string> = {
  Action: 'Acción',
  Adventure: 'Aventura',
  Anime: 'Anime',
  Children: 'Infantil',
  Comedy: 'Comedia',
  Crime: 'Crimen',
  Drama: 'Drama',
  Espionage: 'Espionaje',
  Family: 'Familia',
  Fantasy: 'Fantasía',
  Food: 'Cocina',
  History: 'Historia',
  Horror: 'Terror',
  Legal: 'Legal',
  Medical: 'Médica',
  Music: 'Música',
  Mystery: 'Misterio',
  Nature: 'Naturaleza',
  Romance: 'Romance',
  'Science-Fiction': 'Ciencia ficción',
  Sports: 'Deportes',
  Supernatural: 'Sobrenatural',
  Thriller: 'Thriller',
  Travel: 'Viajes',
  War: 'Bélica',
  Western: 'Western',
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
}

/** TVmaze manda las sinopsis en HTML ("<p><b>Lost</b> sigue…</p>"). */
function stripHtml(html?: string | null): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[#\w]+;/g, (e) => ENTITIES[e] ?? e)
    .trim()
}

function toEpisodeInfo(ep?: TvmEpisode): EpisodeInfo | undefined {
  if (!ep?.airdate || ep.number === null) return undefined
  return {
    season: ep.season,
    episode: ep.number,
    date: ep.airdate,
    name: ep.name,
  }
}

function showToTitle(show: TvmShow, backdrop?: string): Title {
  const seasons: Season[] | undefined = show._embedded?.seasons
    ?.filter((s) => (s.episodeOrder ?? 0) > 0 || s.premiereDate)
    .map((s) => ({
      number: s.number,
      name: s.name || undefined,
      episodeCount: s.episodeOrder ?? 0,
      airDate: s.premiereDate || undefined,
    }))
  const { previousepisode, nextepisode } = show._embedded ?? {}

  return {
    id: `tvm-${show.id}`,
    title: show.name,
    type: 'series',
    year: Number(show.premiered?.slice(0, 4)) || 0,
    rating: Math.round((show.rating?.average ?? 0) * 5) / 10,
    duration: seasons?.length
      ? `${seasons.length} ${seasons.length === 1 ? 'temporada' : 'temporadas'}`
      : undefined,
    genres: show.genres.map((g) => GENRES_ES[g] ?? g),
    description: stripHtml(show.summary) || 'Sin sinopsis disponible.',
    poster: show.image?.medium ?? show.image?.original,
    backdrop,
    releaseDate: show.premiered ?? undefined,
    seasons,
    episodes:
      previousepisode || nextepisode
        ? {
            last: toEpisodeInfo(previousepisode),
            next: toEpisodeInfo(nextepisode),
          }
        : undefined,
  }
}

/** Imagen horizontal de fondo de una serie (petición aparte en TVmaze). */
async function showBackdrop(showId: number): Promise<string | undefined> {
  try {
    const images = await once(`tvm-images:${showId}`, () =>
      getJson<TvmImage[]>(`${TVMAZE}/shows/${showId}/images`),
    )
    const backgrounds = images.filter((img) => img.type === 'background')
    return (backgrounds.find((img) => img.main) ?? backgrounds[0])?.resolutions
      .original.url
  } catch {
    return undefined
  }
}

const hasPoster = (show: TvmShow) => !!show.image

/** Series que se emiten hoy, las más populares primero ("tendencias"). */
function airingShows(): Promise<TvmShow[]> {
  return once('tvm-airing', async () => {
    type Entry = { show?: TvmShow; _embedded?: { show?: TvmShow } }
    const [web, tv] = await Promise.all([
      getJson<Entry[]>(`${TVMAZE}/schedule/web?date=${todayISO()}`),
      getJson<Entry[]>(`${TVMAZE}/schedule?country=US&date=${todayISO()}`),
    ])
    const byId = new Map<number, TvmShow>()
    for (const entry of [...web, ...tv]) {
      const show = entry._embedded?.show ?? entry.show
      if (show && hasPoster(show)) byId.set(show.id, show)
    }
    return [...byId.values()].sort((a, b) => b.weight - a.weight)
  })
}

/** Catálogo general de series, ordenado por popularidad. */
function popularShows(): Promise<TvmShow[]> {
  return once('tvm-popular', async () => {
    // Cada página trae 250 series ordenadas por id; se juntan y se ordenan
    const pages = await Promise.all(
      [0, 1, 2].map((p) => getJson<TvmShow[]>(`${TVMAZE}/shows?page=${p}`)),
    )
    return pages
      .flat()
      .filter((s) => hasPoster(s) && s.rating?.average)
      .sort((a, b) => b.weight - a.weight)
  })
}

function showEpisodes(showId: string): Promise<TvmEpisode[]> {
  return once(`tvm-episodes:${showId}`, () =>
    getJson<TvmEpisode[]>(`${TVMAZE}/shows/${showId}/episodes`),
  )
}

// ---------------------------------------------------------------------------
// Películas: iTunes
// ---------------------------------------------------------------------------

interface ItunesFeedEntry {
  'im:name': { label: string }
  'im:image': { label: string }[]
  summary?: { label: string }
  id: { attributes: { 'im:id': string } }
  category?: { attributes: { label: string } }
  'im:releaseDate'?: { label: string }
  link: { attributes: { rel: string; href: string; 'im:assetType'?: string } }[]
}

interface ItunesTrack {
  trackId: number
  trackName: string
  releaseDate?: string
  primaryGenreName?: string
  longDescription?: string
  shortDescription?: string
  artworkUrl100?: string
  previewUrl?: string
  trackTimeMillis?: number
}

/** Las URLs de iTunes llevan el tamaño: se pide una versión grande. */
const bigArtwork = (url?: string) => url?.replace(/\/[^/]+$/, '/600x900bb.jpg')

function formatMovieRuntime(ms?: number) {
  if (!ms) return undefined
  const minutes = Math.round(ms / 60_000)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h${m ? ` ${m.toString().padStart(2, '0')}m` : ''}` : `${m}m`
}

function entryToTitle(entry: ItunesFeedEntry): Title {
  const releaseDate = entry['im:releaseDate']?.label.slice(0, 10)
  const preview = entry.link.find((l) => l.attributes.rel === 'enclosure')
  return {
    id: `itunes-${entry.id.attributes['im:id']}`,
    title: entry['im:name'].label,
    type: 'movie',
    year: Number(releaseDate?.slice(0, 4)) || 0,
    rating: 0, // iTunes no da valoraciones
    genres: entry.category ? [entry.category.attributes.label] : [],
    description: entry.summary?.label || 'Sin sinopsis disponible.',
    poster: bigArtwork(entry['im:image'].at(-1)?.label),
    releaseDate,
    trailerVideo: preview?.attributes.href,
  }
}

function trackToTitle(track: ItunesTrack): Title {
  const releaseDate = track.releaseDate?.slice(0, 10)
  return {
    id: `itunes-${track.trackId}`,
    title: track.trackName,
    type: 'movie',
    year: Number(releaseDate?.slice(0, 4)) || 0,
    rating: 0,
    duration: formatMovieRuntime(track.trackTimeMillis),
    genres: track.primaryGenreName ? [track.primaryGenreName] : [],
    description:
      track.longDescription ||
      track.shortDescription ||
      'Sin sinopsis disponible.',
    poster: bigArtwork(track.artworkUrl100),
    releaseDate,
    trailerVideo: track.previewUrl,
  }
}

/** Ranking de películas más vendidas/alquiladas de iTunes. */
function topMovies(): Promise<Title[]> {
  return once('itunes-top', async () => {
    const data = await getJson<{ feed: { entry?: ItunesFeedEntry[] } }>(
      `${ITUNES}/${ITUNES_COUNTRY}/rss/topmovies/limit=200/json`,
    )
    return (data.feed.entry ?? []).map(entryToTitle)
  })
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ---------------------------------------------------------------------------
// API con la misma forma que la de TMDB (ver tmdb.ts)
// ---------------------------------------------------------------------------

export const demo = {
  async trending() {
    const [movies, shows] = await Promise.all([topMovies(), airingShows()])
    const items = interleave(
      movies.slice(0, 10),
      shows.slice(0, 10).map((s) => showToTitle(s)),
    )
    return { items, totalPages: 1, totalResults: items.length }
  },

  /** Para el banner: series en emisión con imagen de fondo. */
  async featured(): Promise<Title[]> {
    const shows = (await airingShows()).slice(0, 8)
    const backdrops = await Promise.all(shows.map((s) => showBackdrop(s.id)))
    return shows
      .map((s, i) => showToTitle(s, backdrops[i]))
      .filter((t) => t.backdrop)
      .slice(0, 5)
  },

  async popular(type: MediaType, page = 1) {
    if (type === 'movie') return paginate(await topMovies(), page)
    const shows = await popularShows()
    return paginate(
      shows.map((s) => showToTitle(s)),
      page,
    )
  },

  async newest() {
    const movies = await topMovies()
    return [...movies]
      .filter((t) => !isFuture(t.releaseDate))
      .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
      .slice(0, 20)
  },

  async upcoming() {
    // Preventas del ranking de iTunes (suele haber pocas)
    return (await topMovies()).filter((t) => isFuture(t.releaseDate))
  },

  async topRated() {
    const shows = await popularShows()
    return [...shows]
      .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
      .slice(0, 20)
      .map((s) => showToTitle(s))
  },

  async search(query: string) {
    const q = normalize(query)
    const [movies, shows] = await Promise.all([
      topMovies(),
      getJson<{ show: TvmShow }[]>(
        `${TVMAZE}/search/shows?q=${encodeURIComponent(query)}`,
      ),
    ])
    const matchingMovies = movies.filter((m) => normalize(m.title).includes(q))
    return unique([...matchingMovies, ...shows.map((r) => showToTitle(r.show))])
  },

  async details(id: string): Promise<Title | undefined> {
    const [source, rawId] = id.split('-')
    if (!rawId || !/^\d+$/.test(rawId)) return undefined

    if (source === 'tvm') {
      const [show, backdrop] = await Promise.all([
        getJson<TvmShow>(
          `${TVMAZE}/shows/${rawId}?embed[]=seasons&embed[]=previousepisode&embed[]=nextepisode`,
        ).catch((error) => {
          if (String(error).includes('(404)')) return undefined
          throw error
        }),
        showBackdrop(Number(rawId)),
      ])
      return show && showToTitle(show, backdrop)
    }

    if (source === 'itunes') {
      const data = await getJson<{ results: ItunesTrack[] }>(
        `${ITUNES}/lookup?id=${rawId}&country=${ITUNES_COUNTRY}`,
      )
      const track = data.results[0]
      if (!track) return undefined
      // El ranking trae la sinopsis y el tráiler aunque el detalle falle
      const fromFeed = (await topMovies().catch(() => [])).find(
        (t) => t.id === id,
      )
      return { ...fromFeed, ...trackToTitle(track) }
    }

    return undefined
  },

  async season(id: string, seasonNumber: number): Promise<Episode[]> {
    const episodes = await showEpisodes(id.replace(/^tvm-/, ''))
    return episodes
      .filter((ep) => ep.season === seasonNumber && ep.number !== null)
      .map((ep) => ({
        number: ep.number!,
        name: ep.name || `Episodio ${ep.number}`,
        overview: stripHtml(ep.summary) || undefined,
        still: ep.image?.medium ?? ep.image?.original,
        runtime: ep.runtime ?? undefined,
        airDate: ep.airdate || undefined,
      }))
  },
}

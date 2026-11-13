import type {
  ContinueWatchingItem,
  Episode,
  MediaType,
  Title,
} from '../types/media.ts'
import { demo } from './demo.ts'
import * as local from './local.ts'
import { hasTmdb, tmdb } from './tmdb.ts'

/**
 * API del catálogo que usan las páginas. De dónde salen los datos:
 *  - 'tmdb': si hay clave de TMDB (VITE_TMDB_TOKEN en .env.local).
 *  - 'demo': si no, APIs gratuitas sin clave (TVmaze + iTunes), ver demo.ts.
 *  - 'local': el catálogo escrito a mano en src/data/titles.ts.
 * Se puede forzar con VITE_CATALOG=local | demo | tmdb en .env.local.
 *
 * Todas las funciones devuelven promesas guardadas en caché: pedir lo mismo
 * dos veces devuelve la misma promesa. Es lo que necesita `use()` de React
 * y evita repetir peticiones al volver a una página.
 */
const requested = import.meta.env.VITE_CATALOG
export const source: 'tmdb' | 'demo' | 'local' =
  requested === 'local' || requested === 'demo'
    ? requested
    : hasTmdb
      ? 'tmdb'
      : 'demo'

/** Fuente remota (misma forma en TMDB y demo); null = catálogo local. */
const remote = source === 'tmdb' ? tmdb : source === 'demo' ? demo : null

const cache = new Map<string, Promise<unknown>>()

function cached<T>(key: string, load: () => T | Promise<T>): Promise<T> {
  let promise = cache.get(key) as Promise<T> | undefined
  if (!promise) {
    promise = Promise.resolve().then(load)
    // Si falla, se olvida para que "Reintentar" vuelva a pedirlo
    promise.catch(() => cache.delete(key))
    cache.set(key, promise)
  }
  return promise
}

export interface HomeData {
  featured: Title[]
  continueWatching: ContinueWatchingItem[]
  trending: Title[]
  popularSeries: Title[]
}

export function getHome(): Promise<HomeData> {
  return cached('home', async () => {
    if (!remote) {
      return {
        featured: local.getFeatured(),
        continueWatching: local.getContinueWatching(),
        trending: local.getTrending(),
        popularSeries: local.getPopularSeries(),
      }
    }
    const [trending, series, featured] = await Promise.all([
      remote.trending(),
      remote.popular('series'),
      remote === demo ? demo.featured() : undefined,
    ])
    return {
      featured:
        featured ?? trending.items.filter((t) => t.backdrop).slice(0, 5),
      // Aún no guardamos el historial de reproducción real
      continueWatching: [],
      trending: trending.items,
      popularSeries: series.items,
    }
  })
}

export interface BrowsePage {
  items: Title[]
  totalPages: number
  totalResults: number
}

export function getBrowsePage(
  type: MediaType,
  page: number,
): Promise<BrowsePage> {
  return cached(`browse:${type}:${page}`, () => {
    if (remote) return remote.popular(type, page)
    const items = local.getByType(type)
    return { items, totalPages: 1, totalResults: items.length }
  })
}

export interface NewsData {
  newest: Title[]
  upcoming: Title[]
  mostWatched: Title[]
  topRated: Title[]
}

export function getNews(): Promise<NewsData> {
  return cached('news', async () => {
    if (!remote) {
      return {
        newest: local.getNewest(),
        upcoming: local.getUpcoming(),
        mostWatched: local.getMostWatched(),
        topRated: local.getTopRated(),
      }
    }
    const [newest, upcoming, trending, topRated] = await Promise.all([
      remote.newest(),
      remote.upcoming(),
      remote.trending(),
      remote.topRated(),
    ])
    return {
      newest,
      upcoming,
      mostWatched: trending.items.slice(0, 10),
      topRated,
    }
  })
}

export function searchTitles(query: string): Promise<Title[]> {
  const q = query.trim()
  if (!q) return cached('search:', () => [])
  return cached(`search:${q.toLowerCase()}`, () =>
    remote ? remote.search(q) : local.searchTitles(q),
  )
}

/** Detalle de un título (en TMDB incluye duración, tráiler y temporadas). */
export function getTitle(id: string): Promise<Title | undefined> {
  return cached(`title:${id}`, () => {
    if (remote) return remote.details(id)
    const title = local.getTitle(id)
    return title && title.type === 'series'
      ? { ...title, seasons: local.getSeasons(title) }
      : title
  })
}

/** Episodios de una temporada de una serie. */
export function getSeason(
  id: string,
  seasonNumber: number,
): Promise<Episode[]> {
  return cached(`season:${id}:${seasonNumber}`, () =>
    remote
      ? remote.season(id, seasonNumber)
      : local.getSeason(id, seasonNumber),
  )
}

/**
 * Como no tenemos videos propios, todos los títulos reproducen el mismo
 * video de prueba de licencia libre (Blender Foundation, CC BY).
 * El navegador usa la primera fuente que sepa reproducir.
 */
export const SAMPLE_VIDEO = {
  sources: [
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm',
      type: 'video/webm',
    },
    {
      src: 'https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4',
      type: 'video/mp4',
    },
  ],
  /** Archivos en public/subtitulos (formato WebVTT) */
  subtitles: [
    {
      lang: 'es',
      label: 'Español',
      src: `${import.meta.env.BASE_URL}subtitulos/big-buck-bunny.es.vtt`,
    },
    {
      lang: 'en',
      label: 'English',
      src: `${import.meta.env.BASE_URL}subtitulos/big-buck-bunny.en.vtt`,
    },
    {
      lang: 'pt',
      label: 'Português',
      src: `${import.meta.env.BASE_URL}subtitulos/big-buck-bunny.pt.vtt`,
    },
  ],
  credit:
    'Video de prueba: Big Buck Bunny / Sintel © Blender Foundation (CC BY)',
}

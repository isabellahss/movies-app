import { titles } from '../data/titles.ts'
import { isFuture } from '../utils/dates.ts'
import { getYoutubeId } from './youtube.ts'
import type {
  ContinueWatchingItem,
  Episode,
  MediaType,
  Season,
  Title,
} from '../types/media.ts'

/**
 * Catálogo local (src/data/titles.ts). Se usa cuando no hay clave de TMDB.
 */
const byId = new Map(titles.map((t) => [t.id, t]))

// Avisos en desarrollo para detectar errores al escribir el catálogo a mano
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  for (const t of titles) {
    if (seen.has(t.id)) console.warn(`[catálogo] id repetido: "${t.id}"`)
    seen.add(t.id)
    if (t.trailer && !getYoutubeId(t.trailer))
      console.warn(`[catálogo] tráiler no válido en "${t.id}": ${t.trailer}`)
  }
}

/** Devuelve los títulos con esos ids, saltándose los que no existan. */
function pick(...ids: string[]): Title[] {
  return ids.flatMap((id) => byId.get(id) ?? [])
}

export function getTitle(id: string): Title | undefined {
  return byId.get(id)
}

export function getFeatured(): Title[] {
  return pick('vanguard', 'ember')
}

export function getContinueWatching(): ContinueWatchingItem[] {
  const items = [
    { id: 'kitchen', episode: 'T2:E4', progress: 65 },
    { id: 'hollow', episode: 'T4:E2', progress: 40 },
    { id: 'heirs', episode: 'T3:E7', progress: 82 },
    { id: 'tideline', episode: 'T1:E3', progress: 20 },
    { id: 'ember', episode: 'T1:E1', progress: 90 },
  ]
  return items.flatMap(({ id, ...rest }) => {
    const title = byId.get(id)
    return title ? [{ title, ...rest }] : []
  })
}

export function getByType(type: MediaType): Title[] {
  return titles.filter((t) => t.type === type)
}

/** Lo más reciente primero; a igual año, el mejor valorado. */
export function getNewest(limit = 8): Title[] {
  return titles
    .filter((t) => !isFuture(t.releaseDate))
    .sort((a, b) => b.year - a.year || b.rating - a.rating)
    .slice(0, limit)
}

/** Lo que aún no se estrenó, lo más cercano primero. */
export function getUpcoming(): Title[] {
  return titles
    .filter((t) => isFuture(t.releaseDate))
    .sort((a, b) => a.releaseDate!.localeCompare(b.releaseDate!))
}

const released = () => titles.filter((t) => !isFuture(t.releaseDate))

export function getMostWatched(limit = 10): Title[] {
  return released()
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit)
}

/** Mejor valorados; a igual nota, el que más gente vio. */
export function getTopRated(limit = 8): Title[] {
  return released()
    .sort((a, b) => b.rating - a.rating || (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit)
}

export function getTrending(): Title[] {
  return pick('fission', 'dunes', 'dollhouse', 'webverse', 'marathon', 'orbit')
}

export function getPopularSeries(): Title[] {
  return getByType('series').sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
}

/** Pasa a minúsculas y quita acentos para comparar ("Acción" → "accion"). */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Busca por título, género o descripción. Los títulos que coinciden por nombre van primero. */
export function searchTitles(query: string): Title[] {
  const q = normalize(query)
  if (!q) return []

  const byTitle: Title[] = []
  const byOther: Title[] = []
  for (const t of titles) {
    if (normalize(t.title).includes(q)) byTitle.push(t)
    else if (
      t.genres.some((g) => normalize(g).includes(q)) ||
      normalize(t.description).includes(q)
    )
      byOther.push(t)
  }
  return [...byTitle, ...byOther]
}

const SAMPLE_EPISODES_PER_SEASON = 8

/**
 * Temporadas de una serie local. Si no están escritas en titles.ts se
 * generan de ejemplo a partir de la duración ("3 temporadas") y de
 * `episodes` (para que cuadren con los avisos de episodios nuevos).
 */
export function getSeasons(title: Title): Season[] {
  if (title.type !== 'series') return []
  if (title.seasons?.length) return title.seasons

  const count = Number(title.duration?.match(/(\d+)\s*temporada/)?.[1]) || 1
  const { last, next } = title.episodes ?? {}
  return Array.from({ length: count }, (_, i) => {
    const number = i + 1
    const known = [last, next].filter((ep) => ep?.season === number)
    const episodeCount = Math.max(
      SAMPLE_EPISODES_PER_SEASON,
      ...known.map((ep) => ep!.episode),
    )
    return {
      number,
      episodeCount,
      episodes: Array.from({ length: episodeCount }, (_, j) => {
        const ep = known.find((k) => k!.episode === j + 1)
        return {
          number: j + 1,
          name: ep?.name ?? `Episodio ${j + 1}`,
          runtime: 45,
          airDate: ep?.date,
        }
      }),
    }
  })
}

export function getSeason(id: string, seasonNumber: number): Episode[] {
  const title = getTitle(id)
  if (!title) return []
  const season = getSeasons(title).find((s) => s.number === seasonNumber)
  if (!season) return []
  return (
    season.episodes ??
    Array.from({ length: season.episodeCount }, (_, j) => ({
      number: j + 1,
      name: `Episodio ${j + 1}`,
    }))
  )
}

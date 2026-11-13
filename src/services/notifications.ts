import type { Title } from '../types/media.ts'
import { daysUntil, formatDay } from '../utils/dates.ts'

/** Cuánto tiempo sigue apareciendo un aviso de algo que ya salió. */
const RELEASED_DAYS = 30
const NEW_EPISODE_DAYS = 14

export type NotificationKind =
  'released' | 'upcoming' | 'new-episode' | 'next-episode'

export interface AppNotification {
  /** Estable: sirve para recordar si ya se vio */
  id: string
  kind: NotificationKind
  title: Title
  /** Fecha del suceso, "AAAA-MM-DD" */
  date: string
  message: string
  /** Temporada del episodio, en avisos de episodios */
  season?: number
}

const code = (season: number, episode: number) => `T${season}:E${episode}`

/** Avisos sobre los títulos guardados: estrenos y episodios nuevos o próximos. */
export function buildNotifications(saved: Title[]): AppNotification[] {
  const past: AppNotification[] = []
  const future: AppNotification[] = []

  for (const title of saved) {
    const label = title.type === 'series' ? 'La serie' : 'La película'

    if (title.releaseDate) {
      const days = daysUntil(title.releaseDate)
      if (days > 0) {
        future.push({
          id: `upcoming:${title.id}:${title.releaseDate}`,
          kind: 'upcoming',
          title,
          date: title.releaseDate,
          message: `Se estrena el ${formatDay(title.releaseDate)}. Te avisaremos cuando esté disponible.`,
        })
      } else if (days > -RELEASED_DAYS) {
        past.push({
          id: `released:${title.id}:${title.releaseDate}`,
          kind: 'released',
          title,
          date: title.releaseDate,
          message: `¡Ya está disponible! ${label} se estrenó ${days === 0 ? 'hoy' : `el ${formatDay(title.releaseDate)}`}.`,
        })
      }
    }

    const { last, next } = title.episodes ?? {}
    // Si la serie entera se acaba de estrenar, ya hay aviso de estreno
    const justPremiered =
      title.releaseDate && daysUntil(title.releaseDate) > -RELEASED_DAYS
    if (last && !justPremiered) {
      const days = daysUntil(last.date)
      if (days <= 0 && days > -NEW_EPISODE_DAYS) {
        past.push({
          id: `episode:${title.id}:${last.season}:${last.episode}`,
          kind: 'new-episode',
          title,
          season: last.season,
          date: last.date,
          message: `Nuevo episodio: ${code(last.season, last.episode)}${last.name ? ` «${last.name}»` : ''}.`,
        })
      }
    }
    if (next && daysUntil(next.date) > 0) {
      future.push({
        id: `next:${title.id}:${next.season}:${next.episode}`,
        kind: 'next-episode',
        title,
        season: next.season,
        date: next.date,
        message: `Próximo episodio (${code(next.season, next.episode)}) el ${formatDay(next.date)}.`,
      })
    }
  }

  // Primero lo que ya pasó (lo más reciente arriba), luego lo que viene (lo más cercano arriba)
  past.sort((a, b) => b.date.localeCompare(a.date))
  future.sort((a, b) => a.date.localeCompare(b.date))
  return [...past, ...future]
}

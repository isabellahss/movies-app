/**
 * Fechas como texto "AAAA-MM-DD" (el formato de TMDB), siempre en la
 * zona horaria del usuario para que "hoy" sea su hoy.
 */

const pad = (n: number) => n.toString().padStart(2, '0')

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayISO = () => toISODate(new Date())

/** "2024-12-18" → fecha local (new Date("2024-12-18") la tomaría en UTC). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Fecha a `days` días de hoy (negativo = pasado). Útil para datos de ejemplo. */
export function daysFromToday(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Días desde hoy hasta la fecha (negativo si ya pasó). */
export function daysUntil(iso: string): number {
  const today = parseISODate(todayISO())
  return Math.round(
    (parseISODate(iso).getTime() - today.getTime()) / 86_400_000,
  )
}

export const isFuture = (iso?: string) => !!iso && daysUntil(iso) > 0

/** "18 de diciembre" (y el año si no es el actual). */
export function formatDay(iso: string): string {
  const date = parseISODate(iso)
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  })
}

/** "18 dic" (para las tarjetas). */
export function formatShortDay(iso: string): string {
  return parseISODate(iso)
    .toLocaleDateString('es', { day: 'numeric', month: 'short' })
    .replace('.', '')
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** "hoy", "ayer", "hace 3 días", "en 2 semanas"… */
export function formatRelative(iso: string): string {
  const days = daysUntil(iso)
  if (Math.abs(days) < 7) return relative.format(days, 'day')
  if (Math.abs(days) < 30) return relative.format(Math.round(days / 7), 'week')
  return relative.format(Math.round(days / 30), 'month')
}

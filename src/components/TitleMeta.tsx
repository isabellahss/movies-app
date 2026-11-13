import type { Title } from '../types/media.ts'
import { formatShortDay, isFuture } from '../utils/dates.ts'
import Rating from './Rating.tsx'

/** "2024 | ★ 4.8 | 2h 10m", omitiendo lo que no se conozca. */
function TitleMeta({ title }: { title: Title }) {
  // Lo que aún no se estrenó muestra la fecha y no tiene valoraciones
  const upcoming = isFuture(title.releaseDate)
  const parts = [
    upcoming ? (
      <span key="release" className="font-medium text-brand">
        Estreno {formatShortDay(title.releaseDate!)}
      </span>
    ) : title.year ? (
      <span key="year">{title.year}</span>
    ) : null,
    // Sin valoración (estrenos, o fuentes que no la dan) no se muestra
    upcoming || !title.rating ? null : (
      <Rating key="rating" value={title.rating} />
    ),
    title.duration ? <span key="duration">{title.duration}</span> : null,
  ].filter(Boolean)

  return (
    <p className="flex items-center gap-2 text-xs text-zinc-400">
      {parts.flatMap((part, i) =>
        i === 0
          ? [part]
          : [
              <span key={`sep${i}`} className="text-zinc-600">
                |
              </span>,
              part,
            ],
      )}
    </p>
  )
}

export default TitleMeta

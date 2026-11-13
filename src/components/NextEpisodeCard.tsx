import { Link } from 'react-router'
import type { Title } from '../types/media.ts'
import { remainingText, type RemainingEpisodes } from '../utils/episodes.ts'
import Artwork from './Artwork.tsx'
import { CloseIcon, PlayIcon } from './icons.tsx'

export interface NextEpisode {
  season: number
  number: number
  name: string
  still?: string
  url: string
}

interface NextEpisodeCardProps {
  title: Title
  next: NextEpisode
  currentSeason: number
  remaining: RemainingEpisodes
  /** Segundos para que empiece solo; null = sin cuenta atrás */
  countdown: number | null
  countdownTotal: number
  onCancel?: () => void
}

/** Tarjeta que aparece al final de un episodio para pasar al siguiente. */
function NextEpisodeCard({
  title,
  next,
  currentSeason,
  remaining,
  countdown,
  countdownTotal,
  onCancel,
}: NextEpisodeCardProps) {
  const startsNewSeason = next.season !== currentSeason
  const progress =
    countdown === null
      ? 0
      : ((countdownTotal - countdown) / countdownTotal) * 100

  return (
    <div
      role="dialog"
      aria-label="Siguiente episodio"
      // z-20: por encima de la barra de controles, que si no tapaba la tarjeta y se quedaba con el clic.
      // bottom-44: deja libre la barra de controles (unos 160 px de alto)
      className="absolute right-4 bottom-44 left-4 z-20 animate-fade-up overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur sm:right-6 sm:left-auto sm:w-96"
    >
      <div className="flex gap-4 p-4">
        {/* Toda la parte de arriba (imagen y nombre) también abre el siguiente */}
        <Link
          to={next.url}
          replace
          aria-label={`Ver ahora T${next.season}:E${next.number} · ${next.name}`}
          className="group flex min-w-0 flex-1 gap-4"
        >
          <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-zinc-800">
            <Artwork art={title.art} image={next.still ?? title.backdrop} />
            <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <PlayIcon className="size-6" />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold tracking-wide text-brand uppercase">
              {startsNewSeason
                ? `Empieza la temporada ${next.season}`
                : 'Siguiente episodio'}
            </span>
            <span className="mt-1 block truncate font-medium text-white group-hover:text-brand">
              T{next.season}:E{next.number} · {next.name}
            </span>
            <span className="mt-1 block text-xs text-zinc-400">
              {remainingText(remaining)}
            </span>
          </span>
        </Link>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="-mt-1 -mr-1 self-start rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <Link
          to={next.url}
          replace
          className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          {/* La barra se llena mientras corre la cuenta atrás */}
          {countdown !== null && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 bg-zinc-300 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <PlayIcon className="size-4" />
            {countdown !== null ? `Siguiente en ${countdown} s` : 'Ver ahora'}
          </span>
        </Link>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white hover:text-white"
          >
            Ver créditos
          </button>
        )}
      </div>
    </div>
  )
}

export default NextEpisodeCard

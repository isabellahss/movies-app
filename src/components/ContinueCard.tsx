import { Link } from 'react-router'
import type { ContinueWatchingItem } from '../types/media.ts'
import { episodeUrl } from '../utils/urls.ts'
import Poster from './Poster.tsx'
import { PlayIcon } from './icons.tsx'

/** Miniatura con barra de progreso para "Seguir viendo". */
function ContinueCard({ item }: { item: ContinueWatchingItem }) {
  const { title, episode, progress } = item
  // "T2:E4" → abre ese episodio
  const match = episode.match(/^T(\d+):E(\d+)$/)
  const playUrl = match
    ? episodeUrl(title.id, Number(match[1]), Number(match[2]))
    : `/ver/${title.id}`

  return (
    // ?desde= indica en qué porcentaje del video empezar
    <Link
      to={`${playUrl}${playUrl.includes('?') ? '&' : '?'}desde=${progress}`}
      aria-label={`Seguir viendo ${title.title}, ${episode}`}
      className="group w-64 shrink-0 snap-start sm:w-72 lg:w-80"
    >
      <div className="relative">
        <Poster title={title} variant="landscape" />
        <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
            <PlayIcon />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-lg bg-white/20">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="truncate text-sm font-medium group-hover:text-brand">
          {title.title}
        </h3>
        <span className="shrink-0 text-xs text-zinc-500">
          {progress}% visto
        </span>
      </div>
      <p className="text-xs text-zinc-400">{episode}</p>
    </Link>
  )
}

export default ContinueCard

import type { Title } from '../types/media.ts'
import Artwork from './Artwork.tsx'

interface PosterProps {
  title: Title
  /** portrait = cartel vertical, landscape = miniatura horizontal */
  variant?: 'portrait' | 'landscape'
}

function Poster({ title, variant = 'portrait' }: PosterProps) {
  const aspect = variant === 'portrait' ? 'aspect-[2/3]' : 'aspect-video'
  // Cada formato prefiere su imagen, y si no la hay usa la otra
  const image =
    variant === 'portrait'
      ? (title.poster ?? title.backdrop)
      : (title.backdrop ?? title.poster)

  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/5`}
    >
      <Artwork
        art={title.art}
        image={image}
        className="transition-transform duration-500 group-hover:scale-105"
      />
      {/* Con imagen real el nombre ya suele venir en el póster */}
      {!image && (
        <>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
          <p
            className={`absolute inset-x-0 bottom-0 p-3 text-center font-display leading-none tracking-wide text-white uppercase drop-shadow-lg ${
              variant === 'portrait' ? 'text-2xl' : 'text-3xl'
            }`}
          >
            {title.title}
          </p>
        </>
      )}
    </div>
  )
}

export default Poster

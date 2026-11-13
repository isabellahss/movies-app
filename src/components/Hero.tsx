import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Title } from '../types/media.ts'
import Artwork from './Artwork.tsx'
import MyListButton from './MyListButton.tsx'
import Rating from './Rating.tsx'
import { PlayIcon } from './icons.tsx'

const AUTOPLAY_MS = 8000

/** Banner destacado con varias diapositivas que rotan solas. */
function Hero({ items }: { items: Title[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % items.length),
      AUTOPLAY_MS,
    )
    return () => clearTimeout(timer)
  }, [index, items.length])

  const current = items[index]
  if (!current) return null

  return (
    <section className="relative isolate flex min-h-[560px] items-end overflow-hidden sm:min-h-[620px] lg:min-h-[680px]">
      {items.map((item, i) => (
        <Artwork
          key={item.id}
          art={item.art}
          image={item.backdrop ?? item.poster}
          className={`-z-10 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {/* Degradados para que el texto se lea bien */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-zinc-950 via-transparent to-zinc-950/40" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div key={current.id} className="max-w-xl animate-fade-up">
          <p className="text-sm font-medium text-zinc-300">
            {current.type === 'series'
              ? 'Serie destacada'
              : 'Película destacada'}
          </p>
          <h1 className="mt-1 font-display text-6xl leading-none tracking-wide uppercase sm:text-7xl lg:text-8xl">
            {current.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            {current.genres.map((genre, i) => (
              <span key={genre} className="flex items-center gap-2">
                {i > 0 && <span className="text-zinc-600">|</span>}
                {genre}
              </span>
            ))}
            <span className="text-zinc-600">|</span>
            <Rating value={current.rating} />
          </p>
          <p className="mt-4 line-clamp-3 text-base text-zinc-200 sm:text-lg">
            {current.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {/* En las series primero se elige el episodio en la ficha */}
            <Link
              to={
                current.type === 'series'
                  ? `/titulo/${current.id}`
                  : `/ver/${current.id}`
              }
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-2.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
            >
              <PlayIcon className="size-5" />
              {current.type === 'series' ? 'Ver episodios' : 'Reproducir'}
            </Link>
            {current.type === 'movie' && (
              <Link
                to={`/titulo/${current.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-white/15 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                Más info
              </Link>
            )}
            <MyListButton title={current} />
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver ${item.title}`}
              aria-current={i === index}
              className={`h-1 rounded-full transition-all ${
                i === index
                  ? 'w-10 bg-brand'
                  : 'w-10 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Hero

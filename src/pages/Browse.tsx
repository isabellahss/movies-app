import { use, useState, useTransition } from 'react'
import TitleCard from '../components/TitleCard.tsx'
import { getBrowsePage } from '../services/catalog.ts'
import type { MediaType } from '../types/media.ts'

interface BrowseProps {
  type: MediaType
  heading: string
}

/** Títulos de una página del listado (se cargan de 20 en 20 con TMDB). */
function BrowsePageItems({ type, page }: { type: MediaType; page: number }) {
  const { items } = use(getBrowsePage(type, page))
  return items.map((title) => (
    <TitleCard key={title.id} title={title} className="w-full" />
  ))
}

/** Cuadrícula con los títulos de un tipo (series o películas), más populares primero. */
function Browse({ type, heading }: BrowseProps) {
  const first = use(getBrowsePage(type, 1))
  const [pages, setPages] = useState(1)
  // La transición mantiene visibles los títulos mientras llega la página siguiente
  const [loadingMore, startTransition] = useTransition()

  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl tracking-wide">{heading}</h1>
      <p className="mt-1 text-zinc-400">
        {first.totalResults.toLocaleString('es')} títulos
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: pages }, (_, i) => (
          <BrowsePageItems key={i} type={type} page={i + 1} />
        ))}
      </div>
      {pages < first.totalPages && (
        <div className="mt-10 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => startTransition(() => setPages((p) => p + 1))}
            className="rounded-md bg-white/15 px-6 py-2.5 font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
          >
            {loadingMore ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </section>
  )
}

export default Browse

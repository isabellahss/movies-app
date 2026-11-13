import { useRef, type ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons.tsx'

interface MediaRowProps {
  heading: string
  children: ReactNode
}

/** Fila con scroll horizontal y flechas para avanzar/retroceder. */
function MediaRow({ heading, children }: MediaRowProps) {
  const scroller = useRef<HTMLDivElement>(null)

  const scroll = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{heading}</h2>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={`Anterior en ${heading}`}
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Siguiente en ${heading}`}
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8"
      >
        {children}
      </div>
    </section>
  )
}

export default MediaRow

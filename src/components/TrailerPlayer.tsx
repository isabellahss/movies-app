import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import type { Title } from '../types/media.ts'
import MyListButton from './MyListButton.tsx'
import { ArrowLeftIcon } from './icons.tsx'

/** Reproduce el tráiler de YouTube de un título a pantalla completa. */
function TrailerPlayer({ title, videoId }: { title: Title; videoId: string }) {
  const navigate = useNavigate()

  // Escape vuelve atrás (solo funciona si el foco no está dentro del video de YouTube)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // youtube-nocookie: no guarda cookies de seguimiento hasta que se reproduce
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="flex items-center gap-4 p-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="rounded-full p-2 transition hover:bg-white/10"
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <div className="min-w-0">
          <p className="truncate font-display text-2xl tracking-wide uppercase sm:text-3xl">
            {title.title}
          </p>
          <p className="truncate text-xs text-zinc-400">Tráiler · YouTube</p>
        </div>
        <MyListButton
          title={title}
          className="ml-auto shrink-0 px-4 py-2 text-sm"
        />
      </div>
      <iframe
        src={src}
        title={`Tráiler de ${title.title}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full flex-1 border-0"
      />
    </div>
  )
}

export default TrailerPlayer

import { useMyList } from '../hooks/useMyList.ts'
import { isFuture } from '../utils/dates.ts'
import type { Title } from '../types/media.ts'
import { CheckIcon, PlusIcon } from './icons.tsx'

interface MyListButtonProps {
  title: Title
  /** button = botón con texto, icon = círculo pequeño para las tarjetas */
  variant?: 'button' | 'icon'
  className?: string
}

/** Añade o quita un título de "Mi lista". */
function MyListButton({
  title,
  variant = 'button',
  className = '',
}: MyListButtonProps) {
  const { has, toggle } = useMyList()
  const saved = has(title.id)
  const Icon = saved ? CheckIcon : PlusIcon
  // En los estrenos que aún no salieron, guardar = pedir que te avisen
  const upcoming = isFuture(title.releaseDate)
  const label = saved
    ? `Quitar ${title.title} de Mi lista`
    : upcoming
      ? `Recordarme el estreno de ${title.title}`
      : `Añadir ${title.title} a Mi lista`

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => toggle(title)}
        aria-label={label}
        aria-pressed={saved}
        title={
          saved
            ? 'En mi lista'
            : upcoming
              ? 'Recordarme el estreno'
              : 'Añadir a Mi lista'
        }
        className={`grid size-8 place-items-center rounded-full border backdrop-blur transition ${
          saved
            ? 'border-brand bg-brand text-white'
            : 'border-white/40 bg-black/60 text-white hover:border-white'
        } ${className}`}
      >
        <Icon className="size-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggle(title)}
      aria-label={label}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-md bg-white/15 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/25 ${className}`}
    >
      <Icon className="size-5" />
      {saved
        ? upcoming
          ? 'Te avisaremos'
          : 'En mi lista'
        : upcoming
          ? 'Recordarme'
          : 'Mi lista'}
    </button>
  )
}

export default MyListButton

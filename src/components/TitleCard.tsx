import { Link } from 'react-router'
import type { Title } from '../types/media.ts'
import MyListButton from './MyListButton.tsx'
import Poster from './Poster.tsx'
import TitleMeta from './TitleMeta.tsx'

/** Tarjeta vertical: cartel + nombre + año, valoración y duración. */
interface TitleCardProps {
  title: Title
  /** Permite cambiar el ancho (por ejemplo, en una cuadrícula) */
  className?: string
}

function TitleCard({
  title,
  className = 'w-36 shrink-0 snap-start sm:w-44 lg:w-48',
}: TitleCardProps) {
  return (
    // El botón va fuera del enlace: no se puede anidar un botón dentro de un <a>
    <div className={`group relative ${className}`}>
      <Link to={`/titulo/${title.id}`} className="block">
        <Poster title={title} />
        <h3 className="mt-2 truncate text-sm font-medium group-hover:text-brand">
          {title.title}
        </h3>
        <TitleMeta title={title} />
      </Link>
      <MyListButton
        title={title}
        variant="icon"
        className="absolute top-2 right-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100"
      />
    </div>
  )
}

export default TitleCard

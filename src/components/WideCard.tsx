import { Link } from 'react-router'
import type { Title } from '../types/media.ts'
import Poster from './Poster.tsx'
import TitleMeta from './TitleMeta.tsx'

/** Tarjeta horizontal (por ejemplo, en "Series populares"). */
function WideCard({ title }: { title: Title }) {
  return (
    <Link
      to={`/titulo/${title.id}`}
      className="group w-64 shrink-0 snap-start sm:w-72 lg:w-80"
    >
      <Poster title={title} variant="landscape" />
      <h3 className="mt-2 truncate text-sm font-medium group-hover:text-brand">
        {title.title}
      </h3>
      <TitleMeta title={title} />
    </Link>
  )
}

export default WideCard

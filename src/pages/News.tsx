import { use } from 'react'
import MediaRow from '../components/MediaRow.tsx'
import TitleCard from '../components/TitleCard.tsx'
import { getNews, source } from '../services/catalog.ts'

const viewsFormat = new Intl.NumberFormat('es', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const cardWidth = 'w-36 shrink-0 snap-start sm:w-44 lg:w-48'

function News() {
  const { newest, upcoming, mostWatched, topRated } = use(getNews())

  return (
    <div className="mx-auto max-w-7xl space-y-12 overflow-hidden px-4 pt-28 pb-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-display text-5xl tracking-wide">Novedades</h1>
        <p className="mt-1 text-zinc-400">
          Lo último en llegar, lo que viene y lo que todo el mundo está viendo.
          Guarda un estreno y te avisaremos.
        </p>
      </header>

      <MediaRow heading="Recién llegados">
        {newest.map((title) => (
          <TitleCard key={title.id} title={title} />
        ))}
      </MediaRow>

      {upcoming.length > 0 && (
        <MediaRow heading="Próximamente">
          {upcoming.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </MediaRow>
      )}

      <MediaRow
        heading={
          source === 'tmdb' ? 'Lo más popular esta semana' : 'Lo más visto'
        }
      >
        {mostWatched.map((title, i) => (
          <div key={title.id} className={`relative ${cardWidth}`}>
            <span className="absolute top-2 left-2 z-10 grid size-8 place-items-center rounded-md bg-brand font-display text-xl text-white shadow-lg">
              {i + 1}
            </span>
            <TitleCard title={title} className="block w-full" />
            {title.views !== undefined && (
              <p className="mt-0.5 text-xs text-zinc-500">
                {viewsFormat.format(title.views)} reproducciones
              </p>
            )}
          </div>
        ))}
      </MediaRow>

      <MediaRow heading="Los favoritos del público">
        {topRated.map((title) => (
          <TitleCard key={title.id} title={title} />
        ))}
      </MediaRow>
    </div>
  )
}

export default News

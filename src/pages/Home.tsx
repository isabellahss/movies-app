import { use } from 'react'
import ContinueCard from '../components/ContinueCard.tsx'
import Hero from '../components/Hero.tsx'
import MediaRow from '../components/MediaRow.tsx'
import TitleCard from '../components/TitleCard.tsx'
import WideCard from '../components/WideCard.tsx'
import { useMyList } from '../hooks/useMyList.ts'
import { useProfiles } from '../hooks/useProfiles.ts'
import { getHome } from '../services/catalog.ts'

function Home() {
  const { featured, continueWatching, trending, popularSeries } = use(getHome())
  const { items: myList } = useMyList()
  const { active } = useProfiles()

  return (
    <>
      <Hero items={featured} />

      <div className="mx-auto max-w-7xl space-y-12 overflow-hidden px-4 pt-4 sm:px-6 lg:px-8">
        {continueWatching.length > 0 && (
          <MediaRow heading={`Seguir viendo para ${active.name}`}>
            {continueWatching.map((item) => (
              <ContinueCard key={item.title.id} item={item} />
            ))}
          </MediaRow>
        )}

        {myList.length > 0 && (
          <MediaRow heading="Mi lista">
            {myList.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </MediaRow>
        )}

        <MediaRow heading="Tendencias de la semana">
          {trending.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </MediaRow>

        <MediaRow heading="Series populares">
          {popularSeries.map((title) => (
            <WideCard key={title.id} title={title} />
          ))}
        </MediaRow>
      </div>
    </>
  )
}

export default Home

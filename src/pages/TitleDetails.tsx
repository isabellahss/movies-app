import { Suspense, use, useTransition } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import Artwork from '../components/Artwork.tsx'
import Loading from '../components/Loading.tsx'
import MyListButton from '../components/MyListButton.tsx'
import TitleMeta from '../components/TitleMeta.tsx'
import { ChevronDownIcon, PlayIcon } from '../components/icons.tsx'
import { getSeason, getTitle } from '../services/catalog.ts'
import type { Episode, Season, Title } from '../types/media.ts'
import { formatDay, isFuture } from '../utils/dates.ts'
import { episodeUrl } from '../utils/urls.ts'

function EpisodeRow({
  title,
  season,
  episode,
}: {
  title: Title
  season: number
  episode: Episode
}) {
  const upcoming = isFuture(episode.airDate)

  const content = (
    <>
      <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-zinc-800 sm:w-44">
        <Artwork
          art={title.art}
          image={episode.still ?? title.backdrop}
          className={episode.still ? '' : 'opacity-60'}
        />
        {!upcoming && (
          <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <span className="grid size-10 place-items-center rounded-full bg-black/60 backdrop-blur">
              <PlayIcon className="size-5" />
            </span>
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate font-medium text-white group-hover:text-brand">
            {episode.number}. {episode.name}
          </span>
          {episode.runtime ? (
            <span className="shrink-0 text-xs text-zinc-400">
              {episode.runtime} min
            </span>
          ) : null}
        </span>
        {upcoming ? (
          <span className="mt-1 block text-sm font-medium text-brand">
            Se estrena el {formatDay(episode.airDate!)}
          </span>
        ) : (
          episode.overview && (
            <span className="mt-1 line-clamp-2 text-sm text-zinc-400">
              {episode.overview}
            </span>
          )
        )}
      </span>
    </>
  )

  // Los episodios que aún no salieron se ven pero no se pueden reproducir
  return (
    <li>
      {upcoming ? (
        <div className="flex gap-4 rounded-lg p-3 opacity-60">{content}</div>
      ) : (
        <Link
          to={episodeUrl(title.id, season, episode.number)}
          className="group flex gap-4 rounded-lg p-3 transition hover:bg-white/5"
        >
          {content}
        </Link>
      )}
    </li>
  )
}

function EpisodeList({ title, season }: { title: Title; season: number }) {
  const episodes = use(getSeason(title.id, season))

  if (episodes.length === 0) {
    return (
      <p className="py-8 text-zinc-400">
        Aún no hay episodios de esta temporada.
      </p>
    )
  }

  return (
    <ol className="divide-y divide-white/5">
      {episodes.map((episode) => (
        <EpisodeRow
          key={episode.number}
          title={title}
          season={season}
          episode={episode}
        />
      ))}
    </ol>
  )
}

const seasonName = (s: Season) => s.name ?? `Temporada ${s.number}`

function Episodes({ title, seasons }: { title: Title; seasons: Season[] }) {
  const [params, setParams] = useSearchParams()
  // La temporada va en la URL (?temporada=2) para poder volver a ella
  const requested = Number(params.get('temporada'))
  const current = seasons.find((s) => s.number === requested) ?? seasons[0]
  // La transición deja la lista anterior visible mientras carga la nueva
  const [changing, startTransition] = useTransition()

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <h2 className="text-xl font-semibold sm:text-2xl">Episodios</h2>
        {seasons.length > 1 ? (
          <label className="relative">
            <span className="sr-only">Temporada</span>
            <select
              value={current.number}
              onChange={(e) =>
                startTransition(() =>
                  setParams({ temporada: e.target.value }, { replace: true }),
                )
              }
              className="appearance-none rounded-md border border-white/20 bg-zinc-900 py-2 pr-10 pl-4 font-medium text-white focus:border-white/50 focus:outline-none"
            >
              {seasons.map((s) => (
                <option key={s.number} value={s.number}>
                  {seasonName(s)} ({s.episodeCount} episodios)
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400" />
          </label>
        ) : (
          <span className="text-zinc-400">{seasonName(current)}</span>
        )}
      </div>
      <div className={`transition-opacity ${changing ? 'opacity-50' : ''}`}>
        <Suspense fallback={<Loading />}>
          <EpisodeList title={title} season={current.number} />
        </Suspense>
      </div>
    </section>
  )
}

/** Ficha de una película o serie: información y, en series, temporadas y episodios. */
function TitleDetails() {
  const { id = '' } = useParams()
  const title = use(getTitle(id))

  if (!title) {
    return (
      <section className="px-4 pt-40 pb-20 text-center">
        <p className="text-xl font-semibold">No encontramos este título</p>
        <Link to="/" className="mt-4 inline-block text-brand hover:underline">
          Volver al inicio
        </Link>
      </section>
    )
  }

  const seasons = title.seasons ?? []
  const isSeries = title.type === 'series'
  const upcoming = isFuture(title.releaseDate)
  const first = seasons[0]
  const playUrl =
    isSeries && first
      ? episodeUrl(title.id, first.number, 1)
      : `/ver/${title.id}`

  return (
    <>
      <section className="relative isolate flex min-h-[480px] items-end overflow-hidden sm:min-h-[560px]">
        <Artwork
          art={title.art}
          image={title.backdrop ?? title.poster}
          className="-z-10"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-zinc-950 via-transparent to-zinc-950/40" />

        <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-10 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-zinc-300">
              {isSeries ? 'Serie' : 'Película'}
            </p>
            <h1 className="mt-1 font-display text-5xl leading-none tracking-wide uppercase sm:text-7xl">
              {title.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <TitleMeta title={title} />
              {title.genres.length > 0 && (
                <span className="text-xs text-zinc-400">
                  {title.genres.join(' · ')}
                </span>
              )}
            </div>
            <p className="mt-4 text-zinc-200 sm:text-lg">{title.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {upcoming ? (
                <span className="inline-flex items-center rounded-md bg-white/10 px-6 py-2.5 font-semibold text-zinc-300">
                  Se estrena el {formatDay(title.releaseDate!)}
                </span>
              ) : (
                <Link
                  to={playUrl}
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-2.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:brightness-110"
                >
                  <PlayIcon className="size-5" />
                  {isSeries && first
                    ? `Reproducir T${first.number}:E1`
                    : 'Reproducir'}
                </Link>
              )}
              {/* En las series, Reproducir abre un episodio: el tráiler va aparte */}
              {isSeries && (title.trailer || title.trailerVideo) && (
                <Link
                  to={`/ver/${title.id}`}
                  className="inline-flex items-center gap-2 rounded-md bg-white/15 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  Ver tráiler
                </Link>
              )}
              <MyListButton title={title} />
            </div>
          </div>
        </div>
      </section>

      {isSeries && seasons.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Episodes title={title} seasons={seasons} />
        </div>
      )}
    </>
  )
}

export default TitleDetails

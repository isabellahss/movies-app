import { Suspense, use, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  ForwardIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ShrinkIcon,
  VolumeIcon,
} from '../components/icons.tsx'
import ErrorBoundary from '../components/ErrorBoundary.tsx'
import Loading from '../components/Loading.tsx'
import MyListButton from '../components/MyListButton.tsx'
import NextEpisodeCard, {
  type NextEpisode,
} from '../components/NextEpisodeCard.tsx'
import TrailerPlayer from '../components/TrailerPlayer.tsx'
import SubtitlesMenu, {
  type SubtitleSize,
} from '../components/SubtitlesMenu.tsx'
import { useSubtitles } from '../hooks/useSubtitles.ts'
import { getSeason, getTitle, SAMPLE_VIDEO } from '../services/catalog.ts'
import { getYoutubeId } from '../services/youtube.ts'
import type { Episode, Title } from '../types/media.ts'
import { remainingText, type RemainingEpisodes } from '../utils/episodes.ts'
import { isFuture } from '../utils/dates.ts'
import { episodeUrl } from '../utils/urls.ts'

const HIDE_CONTROLS_MS = 3000
const SKIP_SECONDS = 10
const SUBTITLE_PREFS_KEY = 'streampulse:subtitulos'

const subtitleSizeClass: Record<SubtitleSize, string> = {
  s: 'text-base sm:text-lg',
  m: 'text-lg sm:text-2xl',
  l: 'text-2xl sm:text-4xl',
}

interface SubtitlePrefs {
  lang: string | null
  size: SubtitleSize
}

/** Recuerda la elección de subtítulos entre visitas (si el navegador lo permite). */
function loadSubtitlePrefs(): SubtitlePrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(SUBTITLE_PREFS_KEY) ?? '')
    return { lang: saved.lang ?? null, size: saved.size ?? 'm' }
  } catch {
    return { lang: null, size: 'm' }
  }
}

/** Convierte segundos a "m:ss" o "h:mm:ss". */
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`
}

interface PlayingEpisode {
  season: number
  number: number
  name: string
  next?: NextEpisode
  remaining: RemainingEpisodes
}

/** Segundos de cuenta atrás antes de pasar solo al siguiente episodio. */
const NEXT_COUNTDOWN = 10
/** La tarjeta aparece cuando faltan estos segundos (o el 20 % en videos cortos). */
const NEXT_EPISODE_LEAD = 20

/** Reproductor propio con el video de prueba (títulos sin tráiler). */
/** Qué video se reproduce: por defecto el de prueba, con subtítulos. */
type VideoSource = {
  sources: { src: string; type: string }[]
  subtitles: { lang: string; label: string; src: string }[]
  credit: string
}

function VideoPlayer({
  title,
  episode,
  video: media = SAMPLE_VIDEO,
}: {
  title: Title
  episode?: PlayingEpisode
  video?: VideoSource
}) {
  const episodeLabel = episode
    ? `T${episode.season}:E${episode.number} · ${episode.name}`
    : undefined
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [subtitlePrefs, setSubtitlePrefs] = useState(loadSubtitlePrefs)
  const [subtitlesMenuOpen, setSubtitlesMenuOpen] = useState(false)
  const [ended, setEnded] = useState(false)
  // "Ver créditos": oculta la tarjeta y no pasa solo al siguiente
  const [creditsChosen, setCreditsChosen] = useState(false)
  const [countdown, setCountdown] = useState(NEXT_COUNTDOWN)
  // Último idioma usado, para que la tecla C los vuelva a encender
  const lastSubtitleLang = useRef(
    subtitlePrefs.lang ?? media.subtitles[0]?.lang ?? 'es',
  )

  const subtitleText = useSubtitles(videoRef, subtitlePrefs.lang)

  const setSubtitleLang = useCallback(
    (lang: string | null) => {
      if (lang) lastSubtitleLang.current = lang
      setSubtitlePrefs((prefs) => ({ ...prefs, lang }))
    },
    [setSubtitlePrefs],
  )

  const toggleSubtitles = useCallback(() => {
    setSubtitlePrefs((prefs) => ({
      ...prefs,
      lang: prefs.lang ? null : lastSubtitleLang.current,
    }))
  }, [setSubtitlePrefs])

  useEffect(() => {
    try {
      localStorage.setItem(SUBTITLE_PREFS_KEY, JSON.stringify(subtitlePrefs))
    } catch {
      // Sin almacenamiento (modo privado, etc.): simplemente no se recuerda
    }
  }, [subtitlePrefs])

  // ---- Acciones del reproductor ----
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      // play() puede fallar si el navegador bloquea el autoplay; lo ignoramos
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      video.duration || 0,
    )
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen().catch(() => {})
    }
  }, [])

  // Muestra los controles y los oculta tras unos segundos sin mover el ratón
  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false)
    }, HIDE_CONTROLS_MS)
  }, [])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  // ---- Atajos de teclado ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // No interferir cuando el foco está en un control deslizante
      if (e.target instanceof HTMLInputElement) return
      const actions: Record<string, () => void> = {
        ' ': togglePlay,
        k: togglePlay,
        ArrowLeft: () => skip(-SKIP_SECONDS),
        ArrowRight: () => skip(SKIP_SECONDS),
        m: toggleMute,
        f: toggleFullscreen,
        c: toggleSubtitles,
        Escape: () => {
          if (subtitlesMenuOpen) setSubtitlesMenuOpen(false)
          else if (!document.fullscreenElement) navigate(-1)
        },
      }
      const action = actions[e.key]
      if (action) {
        e.preventDefault()
        action()
        showControls()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    togglePlay,
    skip,
    toggleMute,
    toggleFullscreen,
    toggleSubtitles,
    subtitlesMenuOpen,
    showControls,
    navigate,
  ])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ---- Eventos del <video> ----
  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
    // "Seguir viendo" abre el reproductor con ?desde=<porcentaje>
    const startPercent = Number(searchParams.get('desde'))
    if (startPercent > 0 && startPercent < 100) {
      video.currentTime = (video.duration * startPercent) / 100
    }
    video.play().catch(() => {})
  }

  const handleProgress = () => {
    const video = videoRef.current
    if (!video || video.buffered.length === 0) return
    setBuffered(video.buffered.end(video.buffered.length - 1))
  }

  const handleVolumeChange = () => {
    const video = videoRef.current
    if (!video) return
    setVolume(video.volume)
    setMuted(video.muted || video.volume === 0)
  }

  // ---- Siguiente episodio ----
  const next = episode?.next
  const nearEnd =
    duration > 0 &&
    duration - currentTime <= Math.min(NEXT_EPISODE_LEAD, duration * 0.2)
  const reachedEnd = ended || nearEnd
  // Si vuelve atrás en la barra, todo se reinicia (ajuste durante el render)
  if (!reachedEnd && (creditsChosen || countdown !== NEXT_COUNTDOWN)) {
    setCreditsChosen(false)
    setCountdown(NEXT_COUNTDOWN)
  }
  const autoAdvancing = !!next && reachedEnd && !creditsChosen
  // Al terminar del todo, la tarjeta vuelve a salir (sin cuenta atrás)
  const showNextCard = !!next && (autoAdvancing || ended)
  const showEndCard = !next && ended && !!episode

  // La cuenta atrás corre mientras se ve el final (se detiene en pausa)
  const counting = autoAdvancing && (playing || ended)
  useEffect(() => {
    if (!counting) return
    const timer = setInterval(
      () => setCountdown((c) => Math.max(c - 1, 0)),
      1000,
    )
    return () => clearInterval(timer)
  }, [counting])

  useEffect(() => {
    if (autoAdvancing && countdown === 0 && next) {
      navigate(next.url, { replace: true })
    }
  }, [autoAdvancing, countdown, next, navigate])

  const progressPercent = duration ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0
  // Con el menú abierto los controles nunca se ocultan
  const hidden = !controlsVisible && playing && !subtitlesMenuOpen

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onTouchStart={showControls}
      className={`fixed inset-0 bg-black select-none ${hidden ? 'cursor-none' : ''}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setEnded(false)
          setPlaying(true)
          showControls()
        }}
        onPause={() => {
          setPlaying(false)
          setControlsVisible(true)
        }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onEnded={() => {
          setEnded(true)
          setControlsVisible(true)
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => setError(true)}
        playsInline
        preload="metadata"
      >
        {media.sources.map((source, i, all) => (
          <source
            key={source.src}
            src={source.src}
            type={source.type}
            // Si falla la última fuente, ninguna funcionó
            onError={i === all.length - 1 ? () => setError(true) : undefined}
          />
        ))}
        {media.subtitles.map((track) => (
          <track
            key={track.lang}
            kind="subtitles"
            src={track.src}
            srcLang={track.lang}
            label={track.label}
          />
        ))}
      </video>

      {/* Subtítulos: suben cuando los controles están visibles */}
      {subtitleText && (
        <div
          aria-live="polite"
          className={`pointer-events-none absolute inset-x-0 px-6 text-center transition-all duration-300 ${
            hidden ? 'bottom-10' : 'bottom-36 sm:bottom-40'
          }`}
        >
          <span
            className={`rounded-md bg-black/75 box-decoration-clone px-3 py-1 leading-relaxed font-medium whitespace-pre-line text-white ${subtitleSizeClass[subtitlePrefs.size]}`}
          >
            {subtitleText}
          </span>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="size-14 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
        </div>
      )}

      {/* Botón grande de play cuando está en pausa */}
      {!playing && !loading && !error && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproducir"
          className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand/90 text-white shadow-2xl shadow-brand/40 transition hover:scale-105"
        >
          <PlayIcon className="ml-1 size-9" />
        </button>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <p className="text-lg font-semibold">No se pudo cargar el video</p>
            <p className="mt-1 text-sm text-zinc-400">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-brand px-5 py-2 font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Al final del episodio: pasar al siguiente o fin de la serie */}
      {showNextCard && next && episode && (
        <NextEpisodeCard
          title={title}
          next={next}
          currentSeason={episode.season}
          remaining={episode.remaining}
          countdown={autoAdvancing ? countdown : null}
          countdownTotal={NEXT_COUNTDOWN}
          onCancel={autoAdvancing ? () => setCreditsChosen(true) : undefined}
        />
      )}
      {showEndCard && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">
              Fin
            </p>
            <p className="mt-1 text-2xl font-semibold">
              Terminaste {title.title}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              No hay más episodios disponibles por ahora.
            </p>
            <Link
              to={`/titulo/${title.id}`}
              replace
              className="mt-6 inline-block rounded-md bg-brand px-6 py-2.5 font-semibold text-white transition hover:brightness-110"
            >
              Volver a la serie
            </Link>
          </div>
        </div>
      )}

      {/* Barra superior: volver + título */}
      <div
        className={`absolute inset-x-0 top-0 flex items-center gap-4 bg-linear-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 sm:p-6 ${
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
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
          {episodeLabel && (
            <p className="truncate text-sm text-zinc-200">
              {episodeLabel}
              {episode && (
                <span className="text-zinc-400">
                  {' · '}
                  {remainingText(episode.remaining)}
                </span>
              )}
            </p>
          )}
          <p className="truncate text-xs text-zinc-400">{media.credit}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {next && (
            <Link
              to={next.url}
              replace
              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              <span className="hidden sm:inline">Siguiente episodio</span>
              <span className="sm:hidden">Siguiente</span>
              <ChevronRightIcon className="size-4" />
            </Link>
          )}
          <MyListButton
            title={title}
            className="hidden px-4 py-2 text-sm sm:inline-flex"
          />
        </div>
      </div>

      {/* Barra inferior: progreso + controles */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent px-4 pt-16 pb-4 transition-opacity duration-300 sm:px-6 sm:pb-6 ${
          hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3 text-xs tabular-nums sm:text-sm">
          <span>{formatTime(currentTime)}</span>
          <div className="group relative flex h-4 flex-1 items-center">
            <div className="absolute inset-x-0 h-1 rounded-full bg-white/20 transition-all group-hover:h-1.5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/30"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const video = videoRef.current
                if (video) video.currentTime = Number(e.target.value)
              }}
              aria-label="Posición del video"
              aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
              className="seek absolute inset-0 w-full cursor-pointer"
            />
          </div>
          <span className="text-zinc-400">{formatTime(duration)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pausar' : 'Reproducir'}
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            {playing ? (
              <PauseIcon className="size-7" />
            ) : (
              <PlayIcon className="size-7" />
            )}
          </button>
          <button
            type="button"
            onClick={() => skip(-SKIP_SECONDS)}
            aria-label="Retroceder 10 segundos"
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <RewindIcon className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => skip(SKIP_SECONDS)}
            aria-label="Adelantar 10 segundos"
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <ForwardIcon className="size-6" />
          </button>

          <div className="group flex items-center">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              {muted ? (
                <MuteIcon className="size-6" />
              ) : (
                <VolumeIcon className="size-6" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const video = videoRef.current
                if (!video) return
                video.volume = Number(e.target.value)
                video.muted = video.volume === 0
              }}
              aria-label="Volumen"
              className="hidden w-0 accent-brand transition-all group-hover:w-24 focus:w-24 sm:block"
            />
          </div>

          <p className="ml-auto hidden truncate text-sm text-zinc-300 md:block">
            {title.title} · {episodeLabel ?? title.genres.join(', ')}
          </p>

          <div className="ml-auto flex items-center gap-2 md:ml-0 sm:gap-4">
            {media.subtitles.length > 0 && (
              <SubtitlesMenu
                options={media.subtitles}
                lang={subtitlePrefs.lang}
                onLangChange={setSubtitleLang}
                size={subtitlePrefs.size}
                onSizeChange={(size) =>
                  setSubtitlePrefs((prefs) => ({ ...prefs, size }))
                }
                open={subtitlesMenuOpen}
                onOpenChange={setSubtitlesMenuOpen}
              />
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={
                fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
              }
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              {fullscreen ? (
                <ShrinkIcon className="size-6" />
              ) : (
                <ExpandIcon className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Si el título tiene tráiler de YouTube se muestra ese; si no, el video de prueba. */
function WatchContent({ id }: { id: string }) {
  const title = use(getTitle(id))
  const [params] = useSearchParams()
  const season = Number(params.get('t')) || undefined
  const episode = Number(params.get('e')) || undefined

  if (!title) {
    return (
      <div className="grid min-h-dvh place-items-center bg-black p-6 text-center">
        <div>
          <p className="text-xl font-semibold">No encontramos este título</p>
          <Link to="/" className="mt-4 inline-block text-brand hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  // Serie con ?t=2&e=5: se reproduce ese episodio
  if (title.type === 'series' && season && episode) {
    return (
      <EpisodePlayer title={title} season={season} episodeNumber={episode} />
    )
  }

  const videoId = title.trailer ? getYoutubeId(title.trailer) : undefined
  if (videoId) return <TrailerPlayer title={title} videoId={videoId} />
  if (title.trailerVideo) {
    return (
      <VideoPlayer
        title={title}
        video={{
          sources: [{ src: title.trailerVideo, type: 'video/mp4' }],
          subtitles: [],
          credit: 'Tráiler',
        }}
      />
    )
  }
  return <VideoPlayer title={title} />
}

function EpisodePlayer({
  title,
  season,
  episodeNumber,
}: {
  title: Title
  season: number
  episodeNumber: number
}) {
  const seasons = title.seasons ?? []
  const following = seasons.find((s) => s.number > season)
  // Ambas temporadas se piden a la vez (use() esperaría una tras otra)
  const seasonPromise = getSeason(title.id, season)
  const followingPromise = following
    ? getSeason(title.id, following.number)
    : undefined
  const episodes = use(seasonPromise)
  const followingEpisodes = followingPromise ? use(followingPromise) : []

  const available = (ep: Episode) => !isFuture(ep.airDate)
  const current = episodes.find((ep) => ep.number === episodeNumber)
  const restOfSeason = episodes.filter(
    (ep) => ep.number > episodeNumber && available(ep),
  )

  // Siguiente: el próximo de la temporada o, si era el último, el primero de la siguiente
  const after = episodes.find((ep) => ep.number === episodeNumber + 1)
  let next: NextEpisode | undefined
  if (after) {
    if (available(after)) {
      next = {
        season,
        ...pickEpisode(after),
        url: episodeUrl(title.id, season, after.number),
      }
    }
  } else if (
    following &&
    followingEpisodes[0] &&
    available(followingEpisodes[0])
  ) {
    const first = followingEpisodes[0]
    next = {
      season: following.number,
      ...pickEpisode(first),
      url: episodeUrl(title.id, following.number, first.number),
    }
  }

  // Temporadas siguientes ya estrenadas (de la inmediata se sabe cuáles salieron)
  const laterSeasons = seasons
    .filter((s) => s.number > season && !isFuture(s.airDate))
    .reduce(
      (sum, s) =>
        sum +
        (s.number === following?.number
          ? followingEpisodes.filter(available).length
          : s.episodeCount),
      0,
    )

  return (
    <VideoPlayer
      // Al pasar al siguiente episodio el reproductor empieza de cero
      key={`${season}:${episodeNumber}`}
      title={title}
      episode={{
        season,
        number: episodeNumber,
        name: current?.name ?? `Episodio ${episodeNumber}`,
        next,
        remaining: {
          inSeason: restOfSeason.length,
          total: restOfSeason.length + laterSeasons,
        },
      }}
    />
  )
}

const pickEpisode = (ep: Episode) => ({
  number: ep.number,
  name: ep.name,
  still: ep.still,
})

function Watch() {
  const { id = '' } = useParams()

  return (
    <div className="min-h-dvh bg-black">
      <ErrorBoundary resetKey={id}>
        <Suspense fallback={<Loading fullscreen />}>
          <WatchContent id={id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default Watch

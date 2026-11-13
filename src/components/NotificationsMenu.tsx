import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDismiss } from '../hooks/useDismiss.ts'
import { useNotifications } from '../hooks/useNotifications.ts'
import type {
  AppNotification,
  NotificationKind,
} from '../services/notifications.ts'
import { formatRelative } from '../utils/dates.ts'
import Artwork from './Artwork.tsx'
import { BellIcon } from './icons.tsx'

/** Los avisos de episodios abren la ficha en esa temporada. */
function notificationUrl(n: AppNotification) {
  const base = `/titulo/${n.title.id}`
  return n.season ? `${base}?temporada=${n.season}` : base
}

const kindLabel: Record<NotificationKind, string> = {
  released: 'Estreno',
  upcoming: 'Próximamente',
  'new-episode': 'Nuevo episodio',
  'next-episode': 'Próximo episodio',
}

/** Campanita del header con los avisos de los títulos guardados. */
function NotificationsMenu() {
  const { notifications, unread, isUnread, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  // Los que estaban sin leer al abrir siguen resaltados mientras el menú está abierto
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const toggle = () => {
    if (!open) {
      setHighlighted(
        new Set(notifications.filter((n) => isUnread(n.id)).map((n) => n.id)),
      )
      markAllRead()
    }
    setOpen((o) => !o)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unread
            ? `Notificaciones (${unread} ${unread === 1 ? 'nueva' : 'nuevas'})`
            : 'Notificaciones'
        }
        className="relative text-zinc-200 hover:text-white"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-none font-bold text-white ring-2 ring-zinc-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="fixed inset-x-2 top-16 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 text-sm shadow-2xl backdrop-blur sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-3 sm:w-96"
        >
          <p className="border-b border-white/10 px-4 py-3 font-semibold">
            Notificaciones
          </p>

          {notifications.length === 0 ? (
            <div className="px-6 py-10 text-center text-zinc-400">
              <p>No tienes notificaciones.</p>
              <p className="mt-1 text-xs">
                Guarda estrenos y series en Mi lista y te avisaremos aquí cuando
                salgan o tengan episodios nuevos.
              </p>
              <Link
                to="/novedades"
                onClick={close}
                className="mt-4 inline-block text-brand hover:underline"
              >
                Ver próximos estrenos
              </Link>
            </div>
          ) : (
            <ul className="max-h-[70dvh] divide-y divide-white/5 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    to={notificationUrl(n)}
                    onClick={close}
                    className={`flex gap-3 px-4 py-3 transition hover:bg-white/10 ${
                      highlighted.has(n.id) ? 'bg-white/5' : ''
                    }`}
                  >
                    <span className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded bg-zinc-800">
                      <Artwork
                        art={n.title.art}
                        image={n.title.poster ?? n.title.backdrop}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={
                            n.kind === 'released' || n.kind === 'new-episode'
                              ? 'font-semibold text-brand'
                              : 'text-zinc-400'
                          }
                        >
                          {kindLabel[n.kind]}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-500">
                          {formatRelative(n.date)}
                        </span>
                        {highlighted.has(n.id) && (
                          <span
                            className="ml-auto size-2 shrink-0 rounded-full bg-brand"
                            aria-label="Nueva"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate font-medium text-white">
                        {n.title.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-400">
                        {n.message}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsMenu

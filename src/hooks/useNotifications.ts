import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { getTitle } from '../services/catalog.ts'
import { buildNotifications } from '../services/notifications.ts'
import type { Title } from '../types/media.ts'
import { useMyList } from './useMyList.ts'
import {
  getActiveProfileId,
  onProfileRemoved,
  subscribeProfiles,
} from './useProfiles.ts'

/** Como mucho se piden los detalles de estos títulos guardados. */
const MAX_REFRESH = 30
const MAX_SEEN = 300
const keyFor = (profileId: string) => `streampulse:avisos-vistos:${profileId}`

// ---- Avisos ya vistos, por perfil ----
const seenByProfile = new Map<string, Set<string>>()
const listeners = new Set<() => void>()

function getSeen(profileId: string): Set<string> {
  let seen = seenByProfile.get(profileId)
  if (!seen) {
    try {
      const saved = JSON.parse(localStorage.getItem(keyFor(profileId)) ?? '[]')
      seen = new Set(Array.isArray(saved) ? saved : [])
    } catch {
      seen = new Set()
    }
    seenByProfile.set(profileId, seen)
  }
  return seen
}

function markSeen(ids: string[]) {
  const profileId = getActiveProfileId()
  const current = getSeen(profileId)
  if (ids.every((id) => current.has(id))) return
  // Se guarda un Set nuevo para que React detecte el cambio
  const next = new Set([...current, ...ids])
  const trimmed = [...next].slice(-MAX_SEEN)
  seenByProfile.set(profileId, new Set(trimmed))
  try {
    localStorage.setItem(keyFor(profileId), JSON.stringify(trimmed))
  } catch {
    // Sin almacenamiento: se olvidan al recargar
  }
  listeners.forEach((notify) => notify())
}

onProfileRemoved((profileId) => {
  seenByProfile.delete(profileId)
  try {
    localStorage.removeItem(keyFor(profileId))
  } catch {
    // Nada que limpiar
  }
})

function subscribe(notify: () => void) {
  listeners.add(notify)
  const unsubscribeProfiles = subscribeProfiles(notify)
  return () => {
    listeners.delete(notify)
    unsubscribeProfiles()
  }
}

const getSnapshot = () => getSeen(getActiveProfileId())

/**
 * Avisos sobre los títulos de Mi lista del perfil activo.
 * Lo guardado en la lista es una foto del momento en que se guardó, así que
 * se piden los detalles actuales (fecha de estreno, episodios) en segundo plano.
 */
export function useNotifications() {
  const { items } = useMyList()
  const seen = useSyncExternalStore(subscribe, getSnapshot)
  const [fresh, setFresh] = useState<ReadonlyMap<string, Title>>(new Map())

  const idsKey = items
    .slice(0, MAX_REFRESH)
    .map((t) => t.id)
    .join(',')

  useEffect(() => {
    if (!idsKey) return
    let cancelled = false
    const ids = idsKey.split(',')
    // Si falla alguno (sin red, etc.) se usa lo guardado
    Promise.allSettled(ids.map((id) => getTitle(id))).then((results) => {
      if (cancelled) return
      const map = new Map<string, Title>()
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) map.set(r.value.id, r.value)
      })
      setFresh(map)
    })
    return () => {
      cancelled = true
    }
  }, [idsKey])

  const notifications = useMemo(
    () =>
      buildNotifications(
        items.map((saved) => {
          const current = fresh.get(saved.id)
          return current ? { ...saved, ...current } : saved
        }),
      ),
    [items, fresh],
  )

  const unread = notifications.filter((n) => !seen.has(n.id)).length

  return {
    notifications,
    unread,
    isUnread: (id: string) => !seen.has(id),
    markAllRead: () => markSeen(notifications.map((n) => n.id)),
  }
}

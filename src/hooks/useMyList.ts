import { useCallback, useSyncExternalStore } from 'react'
import { titles as localTitles } from '../data/titles.ts'
import type { Title } from '../types/media.ts'
import {
  DEFAULT_PROFILE_ID,
  getActiveProfileId,
  onProfileRemoved,
  subscribeProfiles,
} from './useProfiles.ts'

/** Antes de los perfiles había una sola lista con esta clave. */
const LEGACY_KEY = 'streampulse:mi-lista'
const keyFor = (profileId: string) => `${LEGACY_KEY}:${profileId}`

/**
 * Títulos guardados por perfil, el más reciente primero. Se guarda el título
 * completo (no solo el id) para mostrar la lista sin pedirla a la API.
 * Vive en un módulo para que todos los componentes compartan el mismo estado.
 */
const lists = new Map<string, Title[]>()
const listeners = new Set<() => void>()

function parse(raw: string | null): Title[] {
  const saved: unknown = JSON.parse(raw ?? '[]')
  if (!Array.isArray(saved)) return []
  return saved.flatMap((entry): Title[] => {
    // Versión más antigua: solo se guardaba el id de un título local
    if (typeof entry === 'string') {
      const title = localTitles.find((t) => t.id === entry)
      return title ? [title] : []
    }
    return entry && typeof entry.id === 'string' ? [entry as Title] : []
  })
}

function load(profileId: string): Title[] {
  try {
    let raw = localStorage.getItem(keyFor(profileId))
    // La lista de antes de los perfiles pasa al perfil inicial
    if (raw === null && profileId === DEFAULT_PROFILE_ID) {
      raw = localStorage.getItem(LEGACY_KEY)
    }
    return parse(raw)
  } catch {
    return []
  }
}

/** Devuelve siempre el mismo array mientras no cambie (lo exige useSyncExternalStore). */
function getList(profileId: string): Title[] {
  let list = lists.get(profileId)
  if (!list) {
    list = load(profileId)
    lists.set(profileId, list)
  }
  return list
}

function save(profileId: string, next: Title[]) {
  lists.set(profileId, next)
  try {
    localStorage.setItem(keyFor(profileId), JSON.stringify(next))
    // Una vez migrada al perfil inicial, la lista antigua ya no hace falta
    if (profileId === DEFAULT_PROFILE_ID) localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Sin almacenamiento (modo privado, etc.): la lista dura hasta recargar
  }
  listeners.forEach((notify) => notify())
}

onProfileRemoved((profileId) => {
  lists.delete(profileId)
  try {
    localStorage.removeItem(keyFor(profileId))
  } catch {
    // Nada que limpiar
  }
})

function subscribe(notify: () => void) {
  listeners.add(notify)
  // Al cambiar de perfil cambia la lista que se muestra
  const unsubscribeProfiles = subscribeProfiles(notify)
  // Mantiene la lista sincronizada si se cambia desde otra pestaña
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(`${LEGACY_KEY}:`)) {
      lists.delete(e.key.slice(LEGACY_KEY.length + 1))
      notify()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(notify)
    unsubscribeProfiles()
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => getList(getActiveProfileId())

/** "Mi lista" del perfil activo. */
export function useMyList() {
  const list = useSyncExternalStore(subscribe, getSnapshot)

  const has = useCallback((id: string) => list.some((t) => t.id === id), [list])

  const toggle = useCallback((title: Title) => {
    const profileId = getActiveProfileId()
    const current = getList(profileId)
    save(
      profileId,
      current.some((t) => t.id === title.id)
        ? current.filter((t) => t.id !== title.id)
        : [title, ...current],
    )
  }, [])

  return { items: list, has, toggle }
}

import { useSyncExternalStore } from 'react'

/** Degradados disponibles para el avatar (clases completas para que Tailwind las genere). */
export const PROFILE_COLORS = {
  amber: 'from-amber-300 to-rose-500',
  sky: 'from-sky-300 to-indigo-500',
  emerald: 'from-emerald-300 to-teal-600',
  violet: 'from-violet-300 to-fuchsia-500',
  red: 'from-red-400 to-orange-500',
  zinc: 'from-zinc-200 to-zinc-500',
} as const

export type ProfileColor = keyof typeof PROFILE_COLORS

export interface Profile {
  id: string
  name: string
  color: ProfileColor
}

interface ProfilesState {
  profiles: Profile[]
  activeId: string
}

export const MAX_PROFILES = 5
export const MAX_NAME_LENGTH = 20

const STORAGE_KEY = 'streampulse:perfiles'

/** Perfil inicial. Su id es fijo para conservar la "Mi lista" de antes de que hubiera perfiles. */
export const DEFAULT_PROFILE_ID = 'principal'
const DEFAULT_STATE: ProfilesState = {
  profiles: [{ id: DEFAULT_PROFILE_ID, name: 'Sarah', color: 'amber' }],
  activeId: DEFAULT_PROFILE_ID,
}

let state: ProfilesState = load()
const listeners = new Set<() => void>()

function isProfile(value: unknown): value is Profile {
  const p = value as Profile
  return (
    typeof p?.id === 'string' &&
    typeof p.name === 'string' &&
    p.color in PROFILE_COLORS
  )
}

function load(): ProfilesState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    const profiles: Profile[] = Array.isArray(saved?.profiles)
      ? saved.profiles.filter(isProfile)
      : []
    if (profiles.length === 0) return DEFAULT_STATE
    const activeId = profiles.some((p) => p.id === saved.activeId)
      ? saved.activeId
      : profiles[0].id
    return { profiles, activeId }
  } catch {
    return DEFAULT_STATE
  }
}

function save(next: ProfilesState) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento: los cambios duran hasta recargar
  }
  listeners.forEach((notify) => notify())
}

export function subscribeProfiles(notify: () => void) {
  listeners.add(notify)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load()
      notify()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('storage', onStorage)
  }
}

export const getActiveProfileId = () => state.activeId

/** Deja el nombre sin espacios sobrantes y dentro del límite. */
export function cleanName(name: string) {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH)
}

export const profileActions = {
  switchTo(id: string) {
    if (state.profiles.some((p) => p.id === id))
      save({ ...state, activeId: id })
  },

  add(name: string, color: ProfileColor): Profile | undefined {
    if (state.profiles.length >= MAX_PROFILES || !cleanName(name)) return
    const profile: Profile = {
      id: `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName(name),
      color,
    }
    save({ ...state, profiles: [...state.profiles, profile] })
    return profile
  },

  update(id: string, changes: Pick<Profile, 'name' | 'color'>) {
    const name = cleanName(changes.name)
    if (!name) return
    save({
      ...state,
      profiles: state.profiles.map((p) =>
        p.id === id ? { ...p, name, color: changes.color } : p,
      ),
    })
  },

  /** Borra el perfil y su lista. Siempre tiene que quedar al menos uno. */
  remove(id: string) {
    if (state.profiles.length <= 1) return
    const profiles = state.profiles.filter((p) => p.id !== id)
    const activeId = state.activeId === id ? profiles[0].id : state.activeId
    save({ profiles, activeId })
    onRemoveListeners.forEach((fn) => fn(id))
  },
}

// Permite que otros módulos (Mi lista) limpien los datos del perfil borrado
const onRemoveListeners = new Set<(id: string) => void>()
export function onProfileRemoved(fn: (id: string) => void) {
  onRemoveListeners.add(fn)
}

const getSnapshot = () => state

export function useProfiles() {
  const { profiles, activeId } = useSyncExternalStore(
    subscribeProfiles,
    getSnapshot,
  )
  const active = profiles.find((p) => p.id === activeId) ?? profiles[0]
  return { profiles, active, ...profileActions }
}

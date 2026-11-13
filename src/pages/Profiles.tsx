import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import Avatar from '../components/Avatar.tsx'
import { PencilIcon, PlusIcon } from '../components/icons.tsx'
import {
  MAX_NAME_LENGTH,
  MAX_PROFILES,
  PROFILE_COLORS,
  cleanName,
  useProfiles,
  type Profile,
  type ProfileColor,
} from '../hooks/useProfiles.ts'

const colorNames: Record<ProfileColor, string> = {
  amber: 'Ámbar',
  sky: 'Azul',
  emerald: 'Verde',
  violet: 'Violeta',
  red: 'Rojo',
  zinc: 'Gris',
}

interface EditorProps {
  /** undefined = perfil nuevo */
  profile?: Profile
  canDelete: boolean
  onSave: (name: string, color: ProfileColor) => void
  onDelete: () => void
  onCancel: () => void
}

/** Formulario para crear o editar un perfil. */
function ProfileEditor({
  profile,
  canDelete,
  onSave,
  onDelete,
  onCancel,
}: EditorProps) {
  const [name, setName] = useState(profile?.name ?? '')
  const [color, setColor] = useState<ProfileColor>(profile?.color ?? 'sky')
  const valid = cleanName(name).length > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) onSave(name, color)
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-lg">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        {profile ? 'Editar perfil' : 'Agregar perfil'}
      </h1>
      <div className="mt-8 flex flex-col gap-6 border-y border-white/10 py-8 sm:flex-row sm:items-start">
        <Avatar profile={{ name: name.trim() || '?', color }} size="lg" />
        <div className="flex-1 space-y-6">
          <label className="block">
            <span className="text-sm text-zinc-400">Nombre</span>
            <input
              autoFocus
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del perfil"
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
            />
          </label>
          <fieldset>
            <legend className="text-sm text-zinc-400">Color</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {(Object.keys(PROFILE_COLORS) as ProfileColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={colorNames[c]}
                  aria-pressed={color === c}
                  className={`size-9 rounded-full bg-linear-to-br ring-offset-2 ring-offset-zinc-950 transition ${PROFILE_COLORS[c]} ${
                    color === c ? 'ring-2 ring-white' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!valid}
          className="rounded-md bg-white px-6 py-2 font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-40"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/30 px-6 py-2 font-semibold text-zinc-300 transition hover:border-white hover:text-white"
        >
          Cancelar
        </button>
        {profile && canDelete && (
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `¿Eliminar el perfil "${profile.name}"? También se borrará su lista.`,
                )
              )
                onDelete()
            }}
            className="rounded-md border border-white/30 px-6 py-2 font-semibold text-zinc-300 transition hover:border-red-400 hover:text-red-400 sm:ml-auto"
          >
            Eliminar perfil
          </button>
        )}
      </div>
    </form>
  )
}

/** "¿Quién está viendo?": elegir, crear, editar y borrar perfiles. */
function Profiles() {
  const navigate = useNavigate()
  const { profiles, active, switchTo, add, update, remove } = useProfiles()
  const [managing, setManaging] = useState(false)
  // null = sin formulario abierto, 'new' = perfil nuevo, o el id que se edita
  const [editing, setEditing] = useState<string | null>(null)

  const editingProfile = profiles.find((p) => p.id === editing)

  if (editing !== null) {
    return (
      <section className="px-4 pt-32 pb-20 sm:px-6">
        <ProfileEditor
          key={editing}
          profile={editingProfile}
          canDelete={profiles.length > 1}
          onCancel={() => setEditing(null)}
          onSave={(name, color) => {
            if (editingProfile) update(editingProfile.id, { name, color })
            else add(name, color)
            setEditing(null)
          }}
          onDelete={() => {
            if (editingProfile) remove(editingProfile.id)
            setEditing(null)
          }}
        />
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center px-4 pt-32 pb-20 text-center sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-5xl">
        {managing ? 'Administrar perfiles' : '¿Quién está viendo?'}
      </h1>

      <ul className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <button
              type="button"
              onClick={() => {
                if (managing) setEditing(profile.id)
                else {
                  switchTo(profile.id)
                  navigate('/')
                }
              }}
              aria-label={
                managing
                  ? `Editar ${profile.name}`
                  : `Entrar como ${profile.name}`
              }
              className="group flex w-24 flex-col items-center gap-3 sm:w-32"
            >
              <span className="relative">
                <Avatar
                  profile={profile}
                  size="lg"
                  className={`ring-white transition group-hover:ring-4 ${
                    profile.id === active.id && !managing ? 'ring-2' : ''
                  }`}
                />
                {managing && (
                  <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/55">
                    <PencilIcon className="size-8" />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-zinc-400 group-hover:text-white">
                {profile.name}
              </span>
            </button>
          </li>
        ))}

        {profiles.length < MAX_PROFILES && (
          <li>
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="group flex w-24 flex-col items-center gap-3 sm:w-32"
            >
              <span className="grid size-24 place-items-center rounded-xl border-2 border-dashed border-white/25 text-zinc-400 transition group-hover:border-white group-hover:text-white sm:size-32">
                <PlusIcon className="size-10" />
              </span>
              <span className="text-zinc-400 group-hover:text-white">
                Agregar perfil
              </span>
            </button>
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => setManaging((m) => !m)}
        className={`mt-12 rounded-md px-6 py-2 font-semibold tracking-wide transition ${
          managing
            ? 'bg-white text-zinc-950 hover:bg-zinc-200'
            : 'border border-white/40 text-zinc-300 hover:border-white hover:text-white'
        }`}
      >
        {managing ? 'Listo' : 'Administrar perfiles'}
      </button>
    </section>
  )
}

export default Profiles

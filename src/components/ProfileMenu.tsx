import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDismiss } from '../hooks/useDismiss.ts'
import { useProfiles } from '../hooks/useProfiles.ts'
import Avatar from './Avatar.tsx'
import { ChevronDownIcon, PencilIcon } from './icons.tsx'

/** Avatar del header con el menú para cambiar de perfil. */
function ProfileMenu() {
  const { profiles, active, switchTo } = useProfiles()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const others = profiles.filter((p) => p.id !== active.id)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Perfil: ${active.name}. Cambiar de perfil`}
        className="flex items-center gap-2 text-sm text-zinc-200 hover:text-white"
      >
        <Avatar profile={active} />
        <span className="hidden max-w-32 truncate sm:inline">
          {active.name}
        </span>
        <ChevronDownIcon
          className={`hidden size-4 transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-3 w-56 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 py-2 text-sm shadow-2xl backdrop-blur"
        >
          {others.map((profile) => (
            <button
              key={profile.id}
              type="button"
              role="menuitem"
              onClick={() => {
                switchTo(profile.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              <Avatar profile={profile} />
              <span className="truncate">{profile.name}</span>
            </button>
          ))}
          {others.length > 0 && (
            <div className="my-2 border-t border-white/10" />
          )}
          <Link
            to="/perfiles"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="size-4" />
            Administrar perfiles
          </Link>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu

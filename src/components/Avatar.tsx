import { PROFILE_COLORS, type Profile } from '../hooks/useProfiles.ts'

const sizes = {
  sm: 'size-8 rounded-full text-sm',
  md: 'size-10 rounded-md text-lg',
  lg: 'size-24 rounded-xl text-4xl sm:size-32 sm:text-5xl',
}

/** Inicial del perfil sobre su degradado de color. */
function Avatar({
  profile,
  size = 'sm',
  className = '',
}: {
  profile: Pick<Profile, 'name' | 'color'>
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-linear-to-br font-semibold text-zinc-950 ${PROFILE_COLORS[profile.color]} ${sizes[size]} ${className}`}
    >
      {profile.name.charAt(0).toUpperCase() || '?'}
    </span>
  )
}

export default Avatar

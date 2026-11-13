import { useEffect, useRef } from 'react'
import { CheckIcon, SubtitlesIcon } from './icons.tsx'

export type SubtitleSize = 's' | 'm' | 'l'

interface SubtitlesMenuProps {
  options: { lang: string; label: string }[]
  lang: string | null
  onLangChange: (lang: string | null) => void
  size: SubtitleSize
  onSizeChange: (size: SubtitleSize) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sizes: { value: SubtitleSize; label: string }[] = [
  { value: 's', label: 'Pequeño' },
  { value: 'm', label: 'Mediano' },
  { value: 'l', label: 'Grande' },
]

/** Botón "CC" con un menú para elegir idioma y tamaño de subtítulos. */
function SubtitlesMenu({
  options,
  lang,
  onLangChange,
  size,
  onSizeChange,
  open,
  onOpenChange,
}: SubtitlesMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  const langOptions = [{ lang: null, label: 'Desactivados' }, ...options]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="Subtítulos"
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative rounded-full p-2 transition hover:bg-white/10 ${open ? 'bg-white/10' : ''}`}
      >
        <SubtitlesIcon className="size-6" />
        {lang && (
          <span className="absolute right-1.5 bottom-1 h-0.5 w-3 rounded-full bg-brand" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-3 w-60 rounded-lg bg-zinc-900/95 p-2 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <p className="px-3 pt-1 pb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Subtítulos
          </p>
          <ul role="radiogroup" aria-label="Idioma de subtítulos">
            {langOptions.map((option) => {
              const selected = option.lang === lang
              return (
                <li key={option.lang ?? 'off'}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onLangChange(option.lang)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-white/10 ${
                      selected ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    <CheckIcon
                      className={`size-4 text-brand ${selected ? '' : 'invisible'}`}
                    />
                    {option.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-2 border-t border-white/10 px-3 pt-3 pb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Tamaño
          </p>
          <div
            role="radiogroup"
            aria-label="Tamaño de subtítulos"
            className="flex gap-1 px-1 pb-1"
          >
            {sizes.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={option.value === size}
                onClick={() => onSizeChange(option.value)}
                className={`flex-1 rounded-md py-1.5 text-xs transition ${
                  option.value === size
                    ? 'bg-brand font-semibold text-white'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SubtitlesMenu

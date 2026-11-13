import { useState } from 'react'
import type { Artwork as ArtworkData, Motif } from '../types/media.ts'

/** Dibujos SVG simples que dan personalidad a cada portada. */
function MotifShape({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'city':
      return (
        <g fill="black" opacity="0.45">
          <rect x="2" y="40" width="12" height="60" />
          <rect x="16" y="25" width="10" height="75" />
          <rect x="28" y="50" width="14" height="50" />
          <rect x="44" y="15" width="11" height="85" />
          <rect x="57" y="35" width="13" height="65" />
          <rect x="72" y="22" width="9" height="78" />
          <rect x="83" y="45" width="15" height="55" />
        </g>
      )
    case 'sun':
      return (
        <>
          <circle cx="50" cy="42" r="30" fill="white" opacity="0.08" />
          <circle cx="50" cy="42" r="20" fill="white" opacity="0.18" />
          <circle cx="50" cy="42" r="12" fill="#fde68a" opacity="0.5" />
        </>
      )
    case 'grid':
      return (
        <g stroke="white" strokeWidth="0.4" opacity="0.35">
          {[-60, -30, 0, 30, 60, 90, 120, 150].map((x) => (
            <line key={x} x1="50" y1="55" x2={x} y2="100" />
          ))}
          {[62, 70, 80, 92].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} />
          ))}
          <circle
            cx="50"
            cy="40"
            r="14"
            fill="#f0abfc"
            stroke="none"
            opacity="0.5"
          />
        </g>
      )
    case 'stars':
      return (
        <g fill="white">
          {Array.from({ length: 28 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 37) % 100}
              cy={(i * 53) % 70}
              r={i % 4 === 0 ? 0.9 : 0.45}
              opacity={0.3 + (i % 3) * 0.2}
            />
          ))}
        </g>
      )
    case 'planet':
      return (
        <>
          <circle cx="50" cy="115" r="55" fill="black" opacity="0.35" />
          <circle cx="72" cy="28" r="8" fill="white" opacity="0.25" />
        </>
      )
    case 'waves':
      return (
        <g fill="none" stroke="white" strokeWidth="0.6" opacity="0.25">
          {[55, 65, 75, 85].map((y) => (
            <path key={y} d={`M0 ${y} Q25 ${y - 8} 50 ${y} T100 ${y}`} />
          ))}
        </g>
      )
  }
}

/** Fondo de una portada: degradado + motivo decorativo. */
/**
 * Las rutas de public/ ("/posters/x.jpg") necesitan el prefijo de la web
 * cuando no está en la raíz (GitHub Pages). Las URLs completas no se tocan.
 */
function resolveImage(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
    ? import.meta.env.BASE_URL + src.slice(1)
    : src
}

const DEFAULT_ART: ArtworkData = {
  from: '#3f3f46',
  to: '#09090b',
  motif: 'stars',
}

/**
 * Fondo de una portada: la imagen si la hay; si no, el degradado con dibujo.
 * Si la imagen no carga (URL rota), también se vuelve al degradado.
 */
function Artwork({
  art = DEFAULT_ART,
  image,
  className = '',
}: {
  art?: ArtworkData
  image?: string
  className?: string
}) {
  const [failed, setFailed] = useState<string>()

  if (image && failed !== image) {
    return (
      <img
        src={resolveImage(image)}
        alt=""
        loading="lazy"
        onError={() => setFailed(image)}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ background: `linear-gradient(160deg, ${art.from}, ${art.to})` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden
      >
        <MotifShape motif={art.motif} />
      </svg>
    </div>
  )
}

export default Artwork

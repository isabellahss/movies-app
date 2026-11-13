import { Link } from 'react-router'

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2"
      aria-label="StreamPulse, inicio"
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="1" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <path
          d="M4 3.5v17a1 1 0 0 0 1.5.86l14.5-8.5a1 1 0 0 0 0-1.72L5.5 2.64A1 1 0 0 0 4 3.5Z"
          fill="url(#logo-grad)"
        />
        <path d="M8 9.5v5l4.5-2.5Z" fill="#18181b" />
      </svg>
      <span className="font-display text-2xl tracking-wide">
        STREAM<span className="text-brand">PULSE</span>
      </span>
    </Link>
  )
}

export default Logo

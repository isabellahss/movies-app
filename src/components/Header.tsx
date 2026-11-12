import { Link } from 'react-router'

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-brand">
          🎬 Movies
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <Link to="/" className="hover:text-white">
            Inicio
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

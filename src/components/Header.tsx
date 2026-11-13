import { useEffect, useRef, useState } from 'react'
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router'
import Logo from './Logo.tsx'
import NotificationsMenu from './NotificationsMenu.tsx'
import ProfileMenu from './ProfileMenu.tsx'
import { CloseIcon, MenuIcon, SearchIcon } from './icons.tsx'

const links = [
  { to: '/', label: 'Explorar' },
  { to: '/series', label: 'Series' },
  { to: '/peliculas', label: 'Películas' },
  { to: '/novedades', label: 'Novedades' },
  { to: '/mi-lista', label: 'Mi lista' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-brand' : 'text-zinc-300 transition hover:text-white'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const onSearchPage = pathname === '/buscar'
  const [searchOpen, setSearchOpen] = useState(onSearchPage)
  const [query, setQuery] = useState(
    onSearchPage ? (params.get('q') ?? '') : '',
  )
  const inputRef = useRef<HTMLInputElement>(null)

  // Si salimos de la página de búsqueda, se cierra y se limpia el campo
  const [wasOnSearchPage, setWasOnSearchPage] = useState(onSearchPage)
  if (wasOnSearchPage !== onSearchPage) {
    setWasOnSearchPage(onSearchPage)
    if (!onSearchPage) {
      setSearchOpen(false)
      setQuery('')
    }
  }

  const openSearch = () => {
    setSearchOpen(true)
    // Esperamos a que el input se pinte para darle el foco
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    if (onSearchPage) navigate('/')
  }

  // Los resultados se actualizan mientras se escribe
  const updateQuery = (value: string) => {
    setQuery(value)
    const q = value.trim()
    navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar', {
      replace: onSearchPage,
    })
  }

  // El header es transparente arriba y se vuelve sólido al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || menuOpen

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'bg-zinc-950/95 shadow-lg backdrop-blur'
          : 'bg-linear-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-ml-1 p-1 text-zinc-200 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Logo />

        <nav className="hidden gap-6 text-sm md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          {searchOpen ? (
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                inputRef.current?.blur()
              }}
              className="flex items-center gap-2 rounded-md border border-white/20 bg-zinc-950/80 px-2 py-1"
            >
              <SearchIcon className="size-4 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                placeholder="Títulos, géneros…"
                aria-label="Buscar títulos"
                className="w-32 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:w-56 [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Cerrar búsqueda"
                className="text-zinc-400 hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              aria-label="Buscar"
              onClick={openSearch}
              className="text-zinc-200 hover:text-white"
            >
              <SearchIcon />
            </button>
          )}
          <NotificationsMenu />
          <ProfileMenu />
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setMenuOpen(false)}
              className={(state) => `block py-2 ${linkClass(state)}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Header

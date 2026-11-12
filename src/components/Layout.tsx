import { Outlet } from 'react-router'
import Header from './Header.tsx'

function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
        Movies App · Proyecto de aprendizaje
      </footer>
    </div>
  )
}

export default Layout

import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'
import ErrorBoundary from './ErrorBoundary.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import Loading from './Loading.tsx'

function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        {/* Mientras una página espera sus datos se ve el indicador de carga */}
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default Layout

import { Link } from 'react-router'

function NotFound() {
  return (
    <section className="px-4 pt-40 pb-20 text-center">
      <h1 className="font-display text-8xl tracking-wide">404</h1>
      <p className="mt-2 text-zinc-400">Página no encontrada</p>
      <Link to="/" className="mt-6 inline-block text-brand hover:underline">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound

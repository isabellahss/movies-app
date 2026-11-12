import { Link } from 'react-router'

function NotFound() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-2 text-zinc-400">Página no encontrada</p>
      <Link to="/" className="mt-6 inline-block text-brand hover:underline">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound

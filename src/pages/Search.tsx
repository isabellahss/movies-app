import { Suspense, use, useDeferredValue, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Loading from '../components/Loading.tsx'
import TitleCard from '../components/TitleCard.tsx'
import { searchTitles, source } from '../services/catalog.ts'

const DEBOUNCE_MS = 300

/** Devuelve el valor solo cuando deja de cambiar durante `ms` milisegundos. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

function Results({ query }: { query: string }) {
  const results = use(searchTitles(query))

  if (results.length === 0) {
    return (
      <p className="mt-4 text-zinc-400">
        No encontramos nada. Prueba con otro título.
      </p>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {results.map((title) => (
        <TitleCard key={title.id} title={title} className="w-full" />
      ))}
    </div>
  )
}

function Search() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  // Espera a que dejes de escribir y, mientras llegan los resultados nuevos,
  // sigue mostrando los anteriores en lugar de un indicador de carga
  const debounced = useDebounced(query, source === 'tmdb' ? DEBOUNCE_MS : 0)
  const shown = useDeferredValue(debounced)
  const stale = shown !== query

  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      {!query ? (
        <p className="text-zinc-400">
          {source === 'tmdb'
            ? 'Escribe el nombre de una película o serie.'
            : 'Escribe el nombre de una película o serie, o un género.'}
        </p>
      ) : (
        <>
          <h1 className="text-xl font-semibold sm:text-2xl">
            Resultados para “{query}”
          </h1>
          <div className={`transition-opacity ${stale ? 'opacity-60' : ''}`}>
            {shown && (
              <Suspense fallback={<Loading />}>
                <Results query={shown} />
              </Suspense>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default Search

import { Link, useSearchParams } from 'react-router'
import TitleCard from '../components/TitleCard.tsx'
import { PlusIcon } from '../components/icons.tsx'
import { useMyList } from '../hooks/useMyList.ts'
import type { MediaType } from '../types/media.ts'

const filters: { value: MediaType | null; label: string }[] = [
  { value: null, label: 'Todo' },
  { value: 'series', label: 'Series' },
  { value: 'movie', label: 'Películas' },
]

function MyList() {
  const { items: saved } = useMyList()

  // El filtro va en la URL (?tipo=series) para poder recargar o compartir
  const [params, setParams] = useSearchParams()
  const tipo = params.get('tipo')
  const active = filters.find((f) => f.value === tipo)?.value ?? null
  const items = active ? saved.filter((t) => t.type === active) : saved

  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl tracking-wide">Mi lista</h1>

      {saved.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/10 text-zinc-300">
            <PlusIcon className="size-7" />
          </span>
          <p className="mt-4 text-lg font-medium">Tu lista está vacía</p>
          <p className="mt-1 max-w-sm text-zinc-400">
            Pulsa + en cualquier título para guardarlo y verlo más tarde.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/series"
              className="rounded-md bg-brand px-5 py-2 font-semibold text-white transition hover:brightness-110"
            >
              Ver series
            </Link>
            <Link
              to="/peliculas"
              className="rounded-md bg-white/15 px-5 py-2 font-semibold text-white transition hover:bg-white/25"
            >
              Ver películas
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {filters.map((f) => {
              const count = f.value
                ? saved.filter((t) => t.type === f.value).length
                : saved.length
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={active === f.value}
                  onClick={() =>
                    setParams(f.value ? { tipo: f.value } : {}, {
                      replace: true,
                    })
                  }
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    active === f.value
                      ? 'bg-white text-zinc-950'
                      : 'bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {f.label} <span className="opacity-60">{count}</span>
                </button>
              )
            })}
          </div>

          {items.length === 0 ? (
            <p className="mt-8 text-zinc-400">
              No tienes {active === 'series' ? 'series' : 'películas'} en tu
              lista todavía.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((title) => (
                <TitleCard key={title.id} title={title} className="w-full" />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default MyList

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Si cambia (por ejemplo, al navegar), se borra el error y se reintenta */
  resetKey?: string
}

interface State {
  error: Error | null
  resetKey?: string
}

/** Muestra un aviso con "Reintentar" si algo falla al cargar (por ejemplo, sin conexión). */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    return props.resetKey !== state.resetKey
      ? { error: null, resetKey: props.resetKey }
      : null
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid min-h-[60dvh] place-items-center px-4 pt-16 text-center">
        <div className="max-w-md">
          <p className="text-xl font-semibold">
            No pudimos cargar el contenido
          </p>
          <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-6 rounded-md bg-brand px-5 py-2 font-semibold text-white transition hover:brightness-110"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary

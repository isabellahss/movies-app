/** Indicador de carga mientras llegan los datos. */
function Loading({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div
      role="status"
      className={`grid place-items-center ${fullscreen ? 'fixed inset-0 bg-black' : 'min-h-[60dvh] pt-16'}`}
    >
      <span className="size-10 animate-spin rounded-full border-4 border-white/15 border-t-brand" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

export default Loading

/**
 * Saca el id de 11 caracteres de un enlace de YouTube. Acepta:
 * youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
 * youtube.com/shorts/ID o directamente el ID.
 */
export function getYoutubeId(value: string): string | undefined {
  const text = value.trim()
  if (/^[\w-]{11}$/.test(text)) return text

  try {
    const url = new URL(text)
    const host = url.hostname.replace(/^(www\.|m\.)/, '')
    let id: string | null | undefined
    if (host === 'youtu.be') id = url.pathname.split('/')[1]
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id =
        url.searchParams.get('v') ??
        url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
    }
    return id && /^[\w-]{11}$/.test(id) ? id : undefined
  } catch {
    return undefined
  }
}

import { useEffect, useState, type RefObject } from 'react'

/**
 * Activa la pista de subtítulos del idioma elegido y devuelve el texto
 * que toca mostrar en cada momento.
 *
 * Usamos el modo "hidden": el navegador carga los subtítulos y nos avisa
 * (evento cuechange) cuando cambian, pero no los dibuja él. Así podemos
 * pintarlos nosotros con nuestro estilo y moverlos cuando aparecen los controles.
 */
export function useSubtitles(
  videoRef: RefObject<HTMLVideoElement | null>,
  lang: string | null,
) {
  const [text, setText] = useState('')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let active: TextTrack | undefined
    for (const track of Array.from(video.textTracks)) {
      if (track.language === lang) {
        track.mode = 'hidden'
        active = track
      } else {
        track.mode = 'disabled'
      }
    }
    if (!active) return

    const track = active
    const update = () => {
      const cues = Array.from(track.activeCues ?? []) as VTTCue[]
      // Quitamos etiquetas de formato de WebVTT como <i> o <b>
      setText(cues.map((cue) => cue.text.replace(/<[^>]+>/g, '')).join('\n'))
    }
    update()
    track.addEventListener('cuechange', update)
    return () => track.removeEventListener('cuechange', update)
  }, [videoRef, lang])

  return lang ? text : ''
}

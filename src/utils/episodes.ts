export interface RemainingEpisodes {
  /** Episodios disponibles después del actual en esta temporada */
  inSeason: number
  /** Incluye los de las temporadas siguientes */
  total: number
}

const plural = (n: number) => (n === 1 ? 'episodio' : 'episodios')

/** "Quedan 3 episodios en esta temporada · 19 en total" */
export function remainingText({ inSeason, total }: RemainingEpisodes) {
  if (total === 0) return 'Último episodio disponible'
  if (inSeason === 0) {
    return `Último de la temporada · Quedan ${total} ${plural(total)} en total`
  }
  const seasonPart = `Quedan ${inSeason} ${plural(inSeason)} en esta temporada`
  return total > inSeason ? `${seasonPart} · ${total} en total` : seasonPart
}

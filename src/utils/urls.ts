/** URL del reproductor para un episodio concreto. */
export const episodeUrl = (id: string, season: number, episode: number) =>
  `/ver/${id}?t=${season}&e=${episode}`

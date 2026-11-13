import type { Title } from '../types/media.ts'
import { daysFromToday } from '../utils/dates.ts'

/**
 * CATÁLOGO: aquí se agregan las películas y series.
 *
 * Copia esta plantilla al principio de la lista y rellénala:
 *
 *   {
 *     id: 'son_como_niños',        // único, en minúsculas y con guiones; se usa en la URL (/ver/son_como_niños)
 *     title: 'Son como niños',
 *     type: 'movie',                // 'movie' = película, 'series' = serie
 *     year: 2010,
 *     rating: 5.0,                  // de 0 a 5
 *     views: 1_200_000,             // reproducciones (se usa en "Lo más visto")
 *     duration: '1h 42m',           // en series, por ejemplo '3 temporadas'
 *     genres: ['Comedia', 'Drama'],
 *     description: 'Sinopsis corta.',
 *     poster: 'https://…/poster.jpg',     // opcional: imagen vertical (2:3)
 *     backdrop: 'https://…/fondo.jpg',    // opcional: imagen horizontal (16:9) para el banner
 *     trailer: 'https://www.youtube.com/watch?v=XXXXXXXXXXX', // opcional: tráiler de YouTube
 *     releaseDate: '2026-12-18',    // opcional: fecha de estreno (si es futura sale en "Próximamente")
 *     episodes: {                   // opcional, solo series: para avisar de episodios nuevos
 *       last: { season: 2, episode: 5, date: '2026-11-10', name: 'Título' },
 *       next: { season: 2, episode: 6, date: '2026-11-17' },
 *     },
 *   },
 *
 * Las imágenes pueden ser URLs o archivos dentro de public/ (por ejemplo
 * public/posters/el-padrino.jpg → poster: '/posters/el-padrino.jpg').
 * Si no pones imágenes, se dibuja una portada de colores automáticamente
 * (puedes elegirla con `art`). Sin `trailer`, se reproduce el video de prueba.
 *
 * Los ejemplos con fechas usan daysFromToday() para que siempre estén
 * "a punto de estrenarse"; en tus títulos escribe la fecha real.
 */

const yearOf = (iso: string) => Number(iso.slice(0, 4))
const STARFALL_DATE = daysFromToday(12)
const ECHOES_DATE = daysFromToday(-5)
const CASCADE_DATE = daysFromToday(30)
export const titles: Title[] = [
  {
    id: 'starfall',
    title: 'Starfall',
    type: 'movie',
    year: yearOf(STARFALL_DATE),
    rating: 0,
    duration: '2h 08m',
    genres: ['Ciencia ficción', 'Aventura'],
    description:
      'Una lluvia de meteoritos esconde un mensaje para la humanidad.',
    art: { from: '#4338ca', to: '#020617', motif: 'stars' },
    releaseDate: STARFALL_DATE,
  },
  {
    id: 'cascade',
    title: 'Cascade',
    type: 'series',
    year: yearOf(CASCADE_DATE),
    rating: 0,
    duration: '1 temporada',
    genres: ['Thriller', 'Misterio'],
    description:
      'Tras una inundación, un pueblo descubre lo que el agua ocultaba.',
    art: { from: '#0f766e', to: '#042f2e', motif: 'waves' },
    releaseDate: CASCADE_DATE,
  },
  {
    id: 'echoes',
    title: 'Echoes',
    type: 'movie',
    year: yearOf(ECHOES_DATE),
    rating: 4.6,
    views: 640_000,
    duration: '1h 47m',
    genres: ['Drama', 'Misterio'],
    description:
      'Una mujer empieza a oír las conversaciones de su yo del pasado.',
    art: { from: '#be123c', to: '#1c1917', motif: 'sun' },
    releaseDate: ECHOES_DATE,
  },
  {
    id: 'vanguard',
    title: 'The Vanguard',
    type: 'series',
    year: 2024,
    rating: 4.8,
    views: 2_850_000,
    duration: '3 temporadas',
    genres: ['Acción', 'Thriller', 'Drama'],
    description:
      'Una crisis global amenaza al mundo. Un equipo debe atravesar la oscuridad. Ya disponible.',
    art: { from: '#1e293b', to: '#0f172a', motif: 'city' },
    episodes: {
      last: {
        season: 3,
        episode: 8,
        date: daysFromToday(-2),
        name: 'Punto de quiebre',
      },
      next: { season: 3, episode: 9, date: daysFromToday(5) },
    },
  },
  {
    id: 'ember',
    title: 'Ember Falls',
    type: 'series',
    year: 2024,
    rating: 4.6,
    views: 1_920_000,
    duration: '2 temporadas',
    genres: ['Misterio', 'Drama'],
    description:
      'Un pueblo aislado guarda un secreto que arde bajo la superficie desde hace un siglo.',
    art: { from: '#7c2d12', to: '#1c1917', motif: 'sun' },
  },
  {
    id: 'kitchen',
    title: 'Back of House',
    type: 'series',
    year: 2023,
    rating: 4.7,
    views: 1_340_000,
    duration: '45m',
    genres: ['Comedia', 'Drama'],
    description: 'Un chef hereda un restaurante en ruinas.',
    art: { from: '#92400e', to: '#1e3a8a', motif: 'waves' },
  },
  {
    id: 'hollow',
    title: 'The Hollow Signal',
    type: 'series',
    year: 2022,
    rating: 4.7,
    views: 980_000,
    duration: '50m',
    genres: ['Ciencia ficción', 'Terror'],
    description: 'Unos amigos captan una transmisión imposible.',
    art: { from: '#991b1b', to: '#0c0a09', motif: 'stars' },
  },
  {
    id: 'heirs',
    title: 'Heirs',
    type: 'series',
    year: 2023,
    rating: 4.9,
    views: 2_410_000,
    duration: '1h',
    genres: ['Drama'],
    description: 'Una familia lucha por el control de un imperio.',
    art: { from: '#64748b', to: '#1e293b', motif: 'city' },
  },
  {
    id: 'tideline',
    title: 'Tideline',
    type: 'series',
    year: 2024,
    rating: 4.5,
    views: 760_000,
    duration: '48m',
    genres: ['Thriller'],
    description: 'Una investigadora regresa a su isla natal.',
    art: { from: '#0e7490', to: '#082f49', motif: 'waves' },
  },
  {
    id: 'fission',
    title: 'Fission',
    type: 'movie',
    year: 2023,
    rating: 4.8,
    views: 3_120_000,
    duration: '3h',
    genres: ['Drama', 'Historia'],
    description: 'El científico que cambió el mundo para siempre.',
    art: { from: '#ea580c', to: '#1c1917', motif: 'sun' },
  },
  {
    id: 'dunes',
    title: 'Sands of Arrak',
    type: 'movie',
    year: 2024,
    rating: 4.9,
    views: 3_540_000,
    duration: '2h 46m',
    genres: ['Ciencia ficción', 'Aventura'],
    description: 'Un heredero en un planeta desértico.',
    art: { from: '#f59e0b', to: '#78350f', motif: 'planet' },
  },
  {
    id: 'dollhouse',
    title: 'Dreamhouse',
    type: 'movie',
    year: 2023,
    rating: 4.8,
    views: 2_980_000,
    duration: '1h 54m',
    genres: ['Comedia'],
    description: 'La vida perfecta empieza a agrietarse.',
    art: { from: '#f472b6', to: '#38bdf8', motif: 'sun' },
  },
  {
    id: 'webverse',
    title: 'Web Runner: Multiverse',
    type: 'movie',
    year: 2023,
    rating: 4.8,
    views: 2_260_000,
    duration: '2h 20m',
    genres: ['Animación', 'Acción'],
    description: 'Un héroe salta entre realidades.',
    art: { from: '#7c3aed', to: '#dc2626', motif: 'grid' },
  },
  {
    id: 'marathon',
    title: 'The Last Mile',
    type: 'movie',
    year: 2021,
    rating: 4.4,
    views: 410_000,
    duration: '1h 58m',
    genres: ['Drama', 'Deportes'],
    description: 'Una corredora contra su propio pasado.',
    art: { from: '#16a34a', to: '#052e16', motif: 'waves' },
  },
  {
    id: 'library',
    title: 'The Midnight Library',
    type: 'movie',
    year: 2021,
    rating: 4.8,
    views: 1_150_000,
    duration: '1h 52m',
    genres: ['Fantasía', 'Drama'],
    description: 'Entre la vida y la muerte hay una biblioteca.',
    art: { from: '#1e40af', to: '#0f172a', motif: 'stars' },
  },
  {
    id: 'mars',
    title: 'Chronicles of Mars',
    type: 'movie',
    year: 2023,
    rating: 4.9,
    views: 1_680_000,
    duration: '2h 12m',
    genres: ['Ciencia ficción'],
    description: 'La primera colonia en el planeta rojo.',
    art: { from: '#c2410c', to: '#1c1917', motif: 'planet' },
  },
  {
    id: 'neon',
    title: 'Neon City',
    type: 'movie',
    year: 2023,
    rating: 4.8,
    views: 1_470_000,
    duration: '1h 57m',
    genres: ['Ciberpunk', 'Acción'],
    description: 'Una detective en una ciudad que nunca duerme.',
    art: { from: '#db2777', to: '#312e81', motif: 'grid' },
  },
  {
    id: 'haven',
    title: 'Haven',
    type: 'movie',
    year: 2023,
    rating: 4.6,
    views: 520_000,
    duration: '1h 49m',
    genres: ['Drama'],
    description: 'Un refugio en el fin del mundo.',
    art: { from: '#3f6212', to: '#1a2e05', motif: 'city' },
  },
  {
    id: 'orbit',
    title: 'Low Orbit',
    type: 'movie',
    year: 2024,
    rating: 4.5,
    views: 890_000,
    duration: '2h 01m',
    genres: ['Ciencia ficción', 'Thriller'],
    description: 'Seis astronautas, un error.',
    art: { from: '#0369a1', to: '#020617', motif: 'planet' },
  },
]

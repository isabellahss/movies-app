# 🎬 Movies App

Proyecto base para aprender a construir una app de películas **responsive** con React.

## Tecnologías

| Herramienta                                                  | Para qué sirve                             |
| ------------------------------------------------------------ | ------------------------------------------ |
| [React 19](https://react.dev/)                               | Librería para construir la interfaz        |
| [TypeScript](https://www.typescriptlang.org/)                | JavaScript con tipos (menos errores)       |
| [Vite](https://vite.dev/)                                    | Servidor de desarrollo y empaquetador      |
| [Tailwind CSS 4](https://tailwindcss.com/)                   | Estilos con clases utilitarias, responsive |
| [React Router 7](https://reactrouter.com/)                   | Navegación entre páginas                   |
| [Oxlint](https://oxc.rs/) + [Prettier](https://prettier.io/) | Revisar y formatear el código              |

## Empezar en GitHub Codespaces

1. En la página del repositorio en GitHub: **Code → Codespaces → Create codespace on main**.
2. Espera a que termine de cargar (las dependencias se instalan solas).
3. En la terminal ejecuta:

   ```bash
   npm run dev
   ```

4. Codespaces abrirá una vista previa en el puerto **5173**. Si no aparece, ve a la pestaña **Ports** y abre el puerto 5173.

## Comandos

| Comando           | Descripción                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo          |
| `npm run build`   | Genera la versión de producción en `dist` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run lint`    | Revisa el código en busca de errores      |
| `npm run format`  | Formatea todo el código con Prettier      |

## Estructura

```
src/
├── components/   # Piezas reutilizables (Header, Layout, tarjetas...)
├── pages/        # Una página por ruta (Home, NotFound...)
├── services/     # Llamadas a APIs externas
├── types/        # Tipos de TypeScript (ej. Movie)
├── App.tsx       # Definición de rutas
├── main.tsx      # Punto de entrada
└── index.css     # Tailwind y estilos globales
```

## Próximos pasos sugeridos

- [ ] Crear una cuenta en [TMDB](https://www.themoviedb.org/settings/api) y obtener una API key.
- [ ] Guardarla en un archivo `.env` como `VITE_TMDB_API_KEY=...` (nunca subirlo a GitHub).
- [ ] Definir el tipo `Movie` en `src/types/`.
- [ ] Crear un servicio en `src/services/` para pedir películas populares.
- [ ] Crear un componente `MovieCard` y mostrar las películas en una grilla responsive
      (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`).
- [ ] Agregar una página de detalle con la ruta `/movie/:id`.
- [ ] Agregar un buscador.

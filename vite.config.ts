import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // En GitHub Pages la web vive en /movies-app/; el workflow pasa BASE_PATH.
  // En desarrollo queda en la raíz.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: {
    // Necesario para que GitHub Codespaces pueda exponer el puerto
    host: true,
    port: 5173,
    // Permite el dominio del puerto reenviado de Codespaces (*.app.github.dev)
    allowedHosts: ['.app.github.dev'],
    // El HMR tiene que conectarse por el puerto público 443 del proxy de Codespaces
    hmr: process.env.CODESPACES ? { clientPort: 443 } : undefined,
  },
})

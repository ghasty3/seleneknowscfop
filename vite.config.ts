import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Ruta base = el nombre del repo en GitHub Pages (ghasty3.github.io/seleneknowscfop/).
  // Si se pone dominio propio, volver a '/' y hacer npm run build.
  base: '/seleneknowscfop/',
  plugins: [react()],
  server: { port: 5173, host: true },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = el nombre del repo, porque el sitio se sirve como URL de proyecto:
// https://ghasty3.github.io/seleneknowscfop/ (decidido el 2026-11-14: el repo se queda
// como seleneknowscfop). Si algún día se sirve en la raíz de la cuenta, la base vuelve a '/'.
export default defineConfig({
  base: '/seleneknowscfop/',
  plugins: [react()],
  server: { port: 5173, host: true },
})

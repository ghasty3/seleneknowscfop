import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' porque el sitio se sirve en la URL de usuario: https://ghasty3.github.io/
// (el repo tiene que llamarse ghasty3.github.io para eso). Si se sirve en la URL de
// proyecto, la base pasa a '/nombre-del-repo/' y hay que hacer npm run build.
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { port: 5173, host: true },
})

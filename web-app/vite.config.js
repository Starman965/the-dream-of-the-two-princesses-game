import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/the-dream-of-the-two-princesses-game/',
  plugins: [react()],
})

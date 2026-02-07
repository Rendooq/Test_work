import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Просто плагин React. Никакого Tailwind здесь быть не должно.
export default defineConfig({
  plugins: [react()],
})
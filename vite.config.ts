import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 100,
            },
            {
              name: 'supabase',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 90,
            },
            {
              name: 'motion',
              test: /node_modules[\\/](gsap|lenis)[\\/]/,
              priority: 80,
            },
            {
              name: 'joyride',
              test: /node_modules[\\/](react-joyride|@floating-ui|@gilbarbara|is-lite|react-innertext|scrollparent|scroll|@fastify)[\\/]/,
              priority: 70,
            },
          ],
        },
      },
    },
  },
})

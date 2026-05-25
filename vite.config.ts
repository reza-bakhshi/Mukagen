import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Linux: avoid ENOSPC when IDE + Vite exhaust inotify watchers. Set VITE_USE_POLLING=0 to disable. */
const usePolling =
  process.env.VITE_USE_POLLING === '1' ||
  (process.env.VITE_USE_POLLING !== '0' && os.platform() === 'linux')

const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const base = repoName ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    watch: usePolling
      ? { usePolling: true, interval: 1000 }
      : undefined,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    env: (() => {
      try {
        const fs = require('fs');
        const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
        const env: Record<string, string> = {};
        for (const line of lines) {
          const [k, ...rest] = line.split('=');
          if (k?.trim()) env[k.trim()] = rest.join('=').trim();
        }
        return env;
      } catch { return {}; }
    })(),
  },
})

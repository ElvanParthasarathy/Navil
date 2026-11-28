import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://elvannavil.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: {
    format: 'directory',
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['VITE_', 'PUBLIC_'],
  },
});

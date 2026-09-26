import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://wahyuandikaputra.my.id',

  devToolbar: {
    enabled: false,
  },

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['^@fontsource'],
    },
  },
});
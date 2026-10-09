import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wahyuandikaputra.my.id',

  devToolbar: {
    enabled: false,
  },

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/api') &&
        !page.includes('/404') &&
        !page.includes('/sitemap') &&
        !page.includes('/robots.txt'),
    }),
  ],

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['^@fontsource'],
    },
  },
});
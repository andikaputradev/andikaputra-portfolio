import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://wahyuandikaputra.dev',

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['sanitize-html', 'htmlparser2', 'domhandler', 'domutils', 'entities'],
    },
  },
});
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://andikaputra.vercel.app',

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        'sanitize-html',
        'escape-string-regexp',
        'htmlparser2',
        'domhandler',
        'domutils',
        'entities',
        'is-plain-object',
        'parse-srcset',
      ],
    },
  },
});
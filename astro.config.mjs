import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

export default defineConfig({
  site: 'https://wahyuandikaputra.my.id',

  devToolbar: {
    enabled: false,
  },

  integrations: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: 'github-dark',
            keepBackground: true,
          }
        ]
      ]
    }),
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
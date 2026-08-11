import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/**', '.vercel/**', 'node_modules/**', '.astro/**'],
  },
  ...eslintPluginAstro.configs.recommended,
];

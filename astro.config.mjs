// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://senryuu286.github.io',
  integrations: [sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
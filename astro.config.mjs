// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Netlify setzt URL automatisch auf die Hauptadresse (später die eigene Domain)
  site: process.env.URL || 'https://kendrasportfolio.netlify.app',
  integrations: [
    sitemap({
      filter: (page) => !/\/(thanks|404)\/?$/.test(page),
    }),
  ],
});

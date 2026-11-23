// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Hauptadresse der Website (für Sitemap, Canonical-Link und Link-Vorschauen)
  site: 'https://kendraschlegel.com',
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],
});

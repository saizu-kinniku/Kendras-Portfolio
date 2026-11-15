// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Hauptadresse der Website – in Cloudflare als Umgebungsvariable SITE_URL setzen, sobald die Domain steht
  site: process.env.SITE_URL || 'https://kendras-portfolio.pages.dev',
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],
});

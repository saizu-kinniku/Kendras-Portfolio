// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO: echte Domain eintragen, sobald sie registriert ist
  site: process.env.URL || 'https://example.com', // Netlify setzt URL automatisch
});

import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://Tamoghna12.github.io',
  base: '/metabolic_lab_website',
  integrations: [preact(), sitemap()],
});
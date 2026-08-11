// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://besson.jp',
  integrations: [
    sitemap({
      // 社内用の決済テストページは検索エンジンに出さない
      filter: (page) => !page.includes('/test-purchase'),
    }),
  ],
  adapter: vercel()
});
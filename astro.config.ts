import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import sitemap from '@astrojs/sitemap';

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [
    UnoCSS(),
    mdx({
      extendMarkdownConfig: true,
    }),
    sitemap()
  ],
  site: "https://twofortyeight.net",
});

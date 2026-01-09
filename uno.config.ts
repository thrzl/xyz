import { defineConfig } from "unocss";

export default defineConfig({
  theme: {
    colors: {
      dominant: "var(--dominant, #e9e7d7)",
      "text-color": "var(--textColor, black)",
      "secondary-text-color": "var(--secondaryTextColor, white)",
      accent: "var(--accent, blue)",
    },
  },
});

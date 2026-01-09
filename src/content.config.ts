import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

export function toSlug(text: string) {
  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const blog = defineCollection({
  loader: glob({ base: "./src/posts", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string().optional(),
      description: z.string(),
      date: z.date(),
      tags: z.array(z.string()).default([]),
      image: z.string().optional(),
    })
    .transform((object) => ({
      ...object,
      slug: object.slug || toSlug(object.title),
    })),
});

export const collections = { blog };

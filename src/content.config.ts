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
      date: z.date().transform((date, ctx) => {
        const estOffsetMs = -5 * 60 * 60 * 1000; // est offset (-5 hours)
        return new Date(date.getTime() - estOffsetMs);
      }),
      tags: z.array(z.string()).default([]),
      image: z.string().optional(),
    })
    .transform((object) => {
      return {
        ...object,
        slug: object.slug || toSlug(object.title),
      };
    }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/projects", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string().optional(),
      url: z.string().optional(),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      image: z.string().optional(),
    })
    .transform((object) => {
      const slug = object.slug || toSlug(object.title);
      const url = object.url || `/projects/${slug}`;
      return {
        ...object,
        slug,
        url,
      };
    }),
});

export const collections = { blog, projects };

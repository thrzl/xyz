import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

export function toSlug(text: string) {
  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dateToEST(date: Date, ctx: z.RefinementCtx) {
  const estOffsetMs = -5 * 60 * 60 * 1000; // est offset (-5 hours)
  return new Date(date.getTime() - estOffsetMs);
}

const blog = defineCollection({
  loader: glob({ base: "./src/posts", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string().optional(),
      description: z.string(),
      date: z.date().transform(dateToEST),
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
      startDate: z.date().transform(dateToEST),
      endDate: z.date().transform(dateToEST).optional(),
    })
    .transform((object) => {
      const slug = object.slug || toSlug(object.title);
      const url = object.url || `/projects/${slug}`;
      const startYear = object.startDate.getFullYear();
      const endYear = object.endDate?.getFullYear();
      const date =
        startYear === endYear || startYear === new Date().getFullYear()
          ? startYear
          : `${startYear} – ${endYear ?? "now"}`;
      return {
        ...object,
        slug,
        date,
        url,
      };
    }),
});

export const collections = { blog, projects };

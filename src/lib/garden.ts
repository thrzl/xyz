import { getCollection, type CollectionEntry } from "astro:content";

export const posts: CollectionEntry<"blog">[] = (
  await getCollection("blog")
).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export function getPosts(): CollectionEntry<"blog">[] {
  return posts;
}

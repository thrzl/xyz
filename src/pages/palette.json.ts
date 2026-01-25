import { getAlbum, getColors } from "@lib/musicData";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const colors = await getColors(await getAlbum());
  return Response.json({ palette: colors });
};

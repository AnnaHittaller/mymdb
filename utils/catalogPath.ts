import type { MediaType } from "~/types/catalog";

export function catalogDetailPath(id: string | number, mediaType: MediaType = "movie"): string {
	return mediaType === "tv" ? `/show/${id}` : `/movie/${id}`;
}

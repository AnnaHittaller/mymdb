import type { MediaType } from "~/types/catalog";
import { defaultMediaType } from "~/utils/catalogKey";

export function catalogMediaLabel(mediaType: MediaType | undefined): string {
	return defaultMediaType(mediaType) === "tv" ? "Show" : "Movie";
}

export function catalogMediaIcon(mediaType: MediaType | undefined): string {
	return defaultMediaType(mediaType) === "tv"
		? "i-heroicons-tv-20-solid"
		: "i-heroicons-film-20-solid";
}

import type { MediaType } from "~/types/catalog";

export function defaultMediaType(mediaType?: MediaType | null): MediaType {
	return mediaType ?? "movie";
}

export function catalogKey(id: string | number, mediaType?: MediaType | null): string {
	return `${defaultMediaType(mediaType)}:${String(id)}`;
}

export function parseCatalogEntry(
	entry: string,
): { mediaType: MediaType; id: string } | null {
	const match = /^((?:movie)|(?:tv)):(\d+)$/.exec(entry.trim());
	if (!match) return null;
	return { mediaType: match[1] as MediaType, id: match[2]! };
}

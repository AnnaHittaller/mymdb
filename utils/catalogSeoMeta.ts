import { POSTER_DETAIL_IMAGE_URL } from "../constants/movie";
import type { PublishedListItem } from "../types/share";

export function catalogPosterOgImage(posterPath: string | null | undefined): string | undefined {
	if (!posterPath) return undefined;
	return `${POSTER_DETAIL_IMAGE_URL}${posterPath}`;
}

export function siteOgImageUrl(origin: string): string {
	return `${origin.replace(/\/$/, "")}/og-mymdb.svg`;
}

export function sharedListFirstPosterPath(items: PublishedListItem[]): string | null {
	for (const item of items) {
		const poster = item.poster?.trim();
		if (poster) return poster;
	}
	return null;
}

export function sharedListOgImage(items: PublishedListItem[], origin: string): string {
	const posterPath = sharedListFirstPosterPath(items);
	const posterUrl = catalogPosterOgImage(posterPath ?? undefined);
	return posterUrl ?? siteOgImageUrl(origin);
}

export function sharedListMetaDescription(
	listName: string,
	ownerDisplayName: string,
	titleCount: number,
): string {
	const countLabel = titleCount === 1 ? "1 title" : `${titleCount} titles`;
	return `${listName} — ${countLabel} shared by ${ownerDisplayName} on MyMDb.`;
}

export function catalogMetaDescription(
	overview: string | null | undefined,
	fallback: string,
	maxLength = 160,
): string {
	const text = (overview ?? "").trim().replace(/\s+/g, " ");
	if (!text) return fallback;
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
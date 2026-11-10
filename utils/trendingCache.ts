import type { TrendingItem } from "~/types/catalog";

export function isTrendingItem(value: unknown): value is TrendingItem {
	if (!value || typeof value !== "object") return false;
	const item = value as Record<string, unknown>;
	const mediaType = item.mediaType;
	return (
		typeof item.id === "number"
		&& typeof item.title === "string"
		&& (mediaType === "movie" || mediaType === "tv")
	);
}

export function parseTrendingList(raw: unknown): TrendingItem[] | undefined {
	if (!Array.isArray(raw)) return undefined;
	if (!raw.every(isTrendingItem)) return undefined;
	return raw;
}

type PayloadCache = {
	payload: { data: Record<string, unknown> };
	static: { data: Record<string, unknown> };
};

export function cachedTrendingList(
	payloadKey: string,
	nuxtApp: PayloadCache,
): TrendingItem[] | undefined {
	const payload = nuxtApp.payload.data[payloadKey] ?? nuxtApp.static.data[payloadKey];
	return parseTrendingList(payload);
}

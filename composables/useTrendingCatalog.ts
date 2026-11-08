import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";

function trendingStorageKey(type: MediaType) {
	return type === "tv" ? "trending-tv-v1" : "trending-movie-v3";
}

function readTabCache(key: string): TrendingItem[] | undefined {
	if (!import.meta.client) return undefined;
	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as TrendingItem[];
		return Array.isArray(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

export function useTrendingCatalog(type: MediaType, options?: { lazy?: boolean; server?: boolean }) {
	const storageKey = trendingStorageKey(type);
	const fetchKey = `catalog-trending-${type}`;

	const result = useFetch<TrendingItem[]>("/api/catalog/trending", {
		key: fetchKey,
		query: { type, page: 1 },
		lazy: options?.lazy,
		server: options?.server,
		getCachedData(key, nuxtApp) {
			const payload = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
			if (payload !== undefined) return payload as TrendingItem[];
			const stored = readTabCache(storageKey);
			if (stored === undefined) return undefined;
			nuxtApp.payload.data[key] = stored;
			return stored;
		},
	});

	if (import.meta.client) {
		watch(result.data, (items) => {
			if (!items) return;
			try {
				sessionStorage.setItem(storageKey, JSON.stringify(items));
			} catch {
				// ignore
			}
		}, { immediate: true });
	}

	return result;
}

export async function fetchTrendingCatalogPage(
	type: MediaType,
	page: number,
): Promise<TrendingItem[]> {
	return await $fetch<TrendingItem[]>("/api/catalog/trending", {
		query: { type, page },
	});
}

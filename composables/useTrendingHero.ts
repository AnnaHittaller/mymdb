import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL } from "~/constants/movie";
import type { TrendingItem } from "~/types/catalog";

const TRENDING_HERO_KEY = "trending-hero-v1";

let warmedBackdrop = false;

function warmFirstBackdrop(path: string) {
	if (warmedBackdrop) return;
	warmedBackdrop = true;
	const run = () => {
		const img = new Image();
		const base = window.innerWidth < 1280 ? BACKDROP_COMPACT_IMAGE_URL : BACKDROP_IMAGE_URL;
		img.src = `${base}${path}`;
	};
	if ("requestIdleCallback" in window) requestIdleCallback(run);
	else setTimeout(run, 1200);
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

export function useTrendingHero(options?: { lazy?: boolean; server?: boolean }) {
	const result = useFetch<TrendingItem[]>("/api/catalog/trending-hero", {
		key: TRENDING_HERO_KEY,
		lazy: options?.lazy,
		server: options?.server,
		getCachedData(key, nuxtApp) {
			const payload = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
			if (payload !== undefined) return payload as TrendingItem[];
			const stored = readTabCache(key);
			if (stored === undefined) return undefined;
			nuxtApp.payload.data[key] = stored;
			return stored;
		},
	});

	if (import.meta.client) {
		const route = useRoute();
		watch(result.data, (items) => {
			if (!items) return;
			try {
				sessionStorage.setItem(TRENDING_HERO_KEY, JSON.stringify(items));
			} catch {
				// Private mode can reject sessionStorage; the payload cache still covers this visit.
			}
			const backdrop = items[0]?.backdrop;
			if (backdrop && route.path !== "/") warmFirstBackdrop(backdrop);
		}, { immediate: true });
	}

	return result;
}

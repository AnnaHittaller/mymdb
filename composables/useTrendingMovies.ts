import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL } from "~/constants/movie";
import type { TrendingMovie } from "~/types/movie";

// Bumped once so a tab that stored the list before genres existed does not reuse it.
const TRENDING_KEY = "trending-movies-v2";

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

function readTabCache(key: string): TrendingMovie[] | undefined {
	if (!import.meta.client) return undefined;
	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as TrendingMovie[];
		return Array.isArray(parsed) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

export function useTrendingMovies(options?: { lazy?: boolean; server?: boolean }) {
	const result = useFetch<TrendingMovie[]>("/api/movies/trending", {
		key: TRENDING_KEY,
		lazy: options?.lazy,
		server: options?.server,
		getCachedData(key, nuxtApp) {
			const payload = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
			if (payload !== undefined) return payload as TrendingMovie[];
			const stored = readTabCache(key);
			if (stored === undefined) return undefined;
			nuxtApp.payload.data[key] = stored;
			return stored;
		},
	});

	if (import.meta.client) {
		const route = useRoute();
		watch(result.data, (movies) => {
			if (!movies) return;
			try {
				sessionStorage.setItem(TRENDING_KEY, JSON.stringify(movies));
			} catch {
				// Private mode can reject sessionStorage; the payload cache still covers this visit.
			}
			const backdrop = movies[0]?.backdrop;
			if (backdrop && route.path !== "/") warmFirstBackdrop(backdrop);
		}, { immediate: true });
	}

	return result;
}

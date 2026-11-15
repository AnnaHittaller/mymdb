import { CACHE_DURATION } from "~/constants/movie"
import {
	flatrateWatchProviders,
	profileWatchProviders,
} from "~/server/utils/tmdbWatchProviders"

function parseRegion(value: unknown): string | undefined {
	const raw = String(value ?? "").trim().toUpperCase()
	return /^[A-Z]{2}$/.test(raw) ? raw : undefined
}

export default defineCachedEventHandler(async (event) => {
	const region = parseRegion(getQuery(event).watch_region)
	if (!region) {
		throw createError({
			statusCode: 400,
			message: "A valid watch_region is required.",
		})
	}
	const [movieProviders, tvProviders] = await Promise.all([
		flatrateWatchProviders("movie", region),
		flatrateWatchProviders("tv", region),
	])
	return {
		region,
		providers: profileWatchProviders(movieProviders, tvProviders, region),
		movieProviderIds: movieProviders.map((entry) => entry.provider_id),
		tvProviderIds: tvProviders.map((entry) => entry.provider_id),
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: "tmdb-watch-providers-v3",
	getKey: (event) => {
		const region = parseRegion(getQuery(event).watch_region) ?? "invalid"
		return region
	},
})

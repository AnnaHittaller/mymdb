import { PROFILE_WATCH_PROVIDER_LIMIT } from "../../constants/watchProviders"

export type TmdbWatchProvider = {
	provider_id: number
	provider_name: string
	logo_path: string | null
	display_priority?: number
	display_priorities?: Record<string, number>
}

type WatchProvidersListResponse = {
	results: TmdbWatchProvider[]
}

export function watchProviderPriority(provider: TmdbWatchProvider, region: string): number {
	return provider.display_priorities?.[region]
		?? provider.display_priority
		?? 9999
}

export async function flatrateWatchProviders(
	media: "movie" | "tv",
	region: string,
): Promise<TmdbWatchProvider[]> {
	const config = useRuntimeConfig()
	const headers = {
		accept: "application/json",
		Authorization: `Bearer ${config.apiBearerToken}`,
	}
	try {
		const response = await $fetch<WatchProvidersListResponse>(
			`${config.apiBaseUrl}/watch/providers/${media}?watch_region=${encodeURIComponent(region)}`,
			{ method: "GET", headers },
		)
		return response.results ?? []
	} catch {
		return []
	}
}

export function profileWatchProviders(
	movieProviders: TmdbWatchProvider[],
	tvProviders: TmdbWatchProvider[],
	region: string,
	limit = PROFILE_WATCH_PROVIDER_LIMIT,
): TmdbWatchProvider[] {
	const byId = new Map<number, TmdbWatchProvider>()
	for (const entry of [...movieProviders, ...tvProviders]) {
		const existing = byId.get(entry.provider_id)
		if (!existing || watchProviderPriority(entry, region) < watchProviderPriority(existing, region)) {
			byId.set(entry.provider_id, entry)
		}
	}
	return [...byId.values()]
		.sort((left, right) => watchProviderPriority(left, region) - watchProviderPriority(right, region))
		.slice(0, limit)
		.map((entry) => ({
			provider_id: entry.provider_id,
			provider_name: entry.provider_name,
			logo_path: entry.logo_path,
		}))
}

export function providerIdsForDiscover(ids: number[], available: TmdbWatchProvider[]): string {
	if (!ids.length) return ""
	const allowed = new Set(available.map((entry) => entry.provider_id))
	const filtered = ids.filter((id) => allowed.has(id))
	return filtered.length ? filtered.join("|") : ""
}

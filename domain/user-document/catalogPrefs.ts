export type CatalogPrefs = {
	region: string | null
	movieGenreIds: number[]
	tvGenreIds: number[]
	watchProviderIds: number[]
	keywordIds: number[]
}

export const DEFAULT_CATALOG_PREFS: CatalogPrefs = {
	region: null,
	movieGenreIds: [],
	tvGenreIds: [],
	watchProviderIds: [],
	keywordIds: [],
}

export const MAX_CATALOG_GENRE_PREFS = 5
export const MAX_CATALOG_KEYWORD_PREFS = 8

const ISO_REGION = /^[A-Z]{2}$/

function normalizeIdList(ids: unknown, max: number): number[] {
	if (!Array.isArray(ids)) return []
	const seen = new Set<number>()
	const result: number[] = []
	for (const entry of ids) {
		const id = typeof entry === "number" ? entry : Number(entry)
		if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue
		seen.add(id)
		result.push(id)
		if (result.length >= max) break
	}
	return result
}

function normalizeGenreIds(ids: unknown): number[] {
	return normalizeIdList(ids, MAX_CATALOG_GENRE_PREFS)
}

function normalizeRegion(value: unknown): string | null {
	if (value === null || value === undefined || value === "") return null
	const code = String(value).trim().toUpperCase()
	return ISO_REGION.test(code) ? code : null
}

export function normalizeCatalogPrefs(value: unknown): CatalogPrefs {
	if (!value || typeof value !== "object") {
		return { ...DEFAULT_CATALOG_PREFS }
	}
	const record = value as Record<string, unknown>
	return {
		region: normalizeRegion(record.region),
		movieGenreIds: normalizeGenreIds(record.movieGenreIds),
		tvGenreIds: normalizeGenreIds(record.tvGenreIds),
		watchProviderIds: normalizeIdList(record.watchProviderIds, Number.POSITIVE_INFINITY),
		keywordIds: normalizeIdList(record.keywordIds, MAX_CATALOG_KEYWORD_PREFS),
	}
}

export function catalogPrefsAffectUpcoming(prefs: CatalogPrefs | null | undefined): boolean {
	if (!prefs) return false
	return prefs.movieGenreIds.length > 0
		|| prefs.tvGenreIds.length > 0
		|| prefs.keywordIds.length > 0
		|| (prefs.watchProviderIds.length > 0 && Boolean(prefs.region))
}

export function upcomingCacheKeySuffix(prefs: CatalogPrefs | null | undefined): string {
	if (!catalogPrefsAffectUpcoming(prefs)) return "global"
	const region = prefs!.watchProviderIds.length ? (prefs!.region ?? "") : ""
	const movie = prefs!.movieGenreIds.join("-")
	const tv = prefs!.tvGenreIds.join("-")
	const providers = prefs!.watchProviderIds.join("-")
	const keywords = prefs!.keywordIds.join("-")
	return `${region}:${movie}:${tv}:${providers}:${keywords}`
}

import { CATALOG_SUMMARY_CHUNK } from '~/constants/movie'
import type { MediaType } from '~/types/catalog'
import type { CatalogUpdate } from '~/domain/user-document/createUserDocument'

const FETCH_CONCURRENCY = 5

type CatalogEntry = { mediaType: MediaType, id: string }

export default defineEventHandler(async (event) => {
	const entries = parseSummaryEntries(getQuery(event))
	if (entries.length === 0) {
		return []
	}
	if (entries.length > CATALOG_SUMMARY_CHUNK || entries.some((e) => !/^\d+$/.test(e.id))) {
		throw createError({
			statusCode: 400,
			message: 'Invalid catalog entries',
		})
	}

	const summaries: (CatalogUpdate | null)[] = new Array(entries.length).fill(null)
	let cursor = 0

	async function worker() {
		while (cursor < entries.length) {
			const index = cursor
			cursor += 1
			summaries[index] = await summaryFor(entries[index]!)
		}
	}

	const workers = Math.min(FETCH_CONCURRENCY, entries.length)
	await Promise.all(Array.from({ length: workers }, () => worker()))
	return summaries.flatMap((summary) => (summary ? [summary] : []))
})

function parseSummaryEntries(query: Record<string, unknown>): CatalogEntry[] {
	const rawEntries = query.entries
	if (typeof rawEntries === "string" && rawEntries.trim()) {
		return rawEntries
			.split(",")
			.map((part) => part.trim())
			.flatMap((part) => {
				const match = /^(movie|tv):(\d+)$/.exec(part)
				if (!match) return []
				return [{ mediaType: match[1] as MediaType, id: match[2]! }]
			})
	}

	const ids = parseCsv(query.ids)
	const types = parseCsv(query.types)
	if (ids.length === 0) return []
	const resolved: CatalogEntry[] = []
	for (let index = 0; index < ids.length; index++) {
		const id = ids[index]!
		if (!/^\d+$/.test(id)) continue
		const typeRaw = types[index] ?? types[0] ?? "movie"
		const mediaType: MediaType = typeRaw === "tv" ? "tv" : "movie"
		resolved.push({ mediaType, id })
	}
	return resolved
}

function parseCsv(value: unknown): string[] {
	if (typeof value !== "string") return []
	return value.split(",").map((part) => part.trim()).filter(Boolean)
}

async function summaryFor(entry: CatalogEntry): Promise<CatalogUpdate | null> {
	try {
		if (entry.mediaType === "tv") {
			const show = await fetchTmdbTv(entry.id)
			if (!show || typeof show.name !== "string") {
				return null
			}
			return {
				id: entry.id,
				mediaType: "tv",
				title: show.name,
				rating: typeof show.vote_average === "number" ? show.vote_average : 0,
				poster: typeof show.poster_path === "string" ? show.poster_path : "",
				genres: (show.genres ?? []).map((genre) => genre.name),
			}
		}
		const movie = await fetchTmdbMovie(entry.id)
		if (!movie || typeof movie.title !== "string") {
			return null
		}
		return {
			id: entry.id,
			mediaType: "movie",
			title: movie.title,
			rating: typeof movie.vote_average === "number" ? movie.vote_average : 0,
			poster: typeof movie.poster_path === "string" ? movie.poster_path : "",
			genres: (movie.genres ?? []).map((genre) => genre.name),
		}
	} catch {
		return null
	}
}

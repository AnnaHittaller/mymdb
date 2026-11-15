import { CATALOG_SUMMARY_CHUNK } from '~/constants/movie'
import { localizeTmdbGenreEntries } from '~/domain/locale/tmdbGenreLabels'
import type { CatalogUpdate } from '~/domain/user-document/createUserDocument'

const FETCH_CONCURRENCY = 5

export default defineEventHandler(async (event) => {
	const ids = movieIds(getQuery(event).ids)
	if (ids.length === 0) {
		return []
	}
	if (ids.length > CATALOG_SUMMARY_CHUNK || ids.some((id) => !/^\d+$/.test(id))) {
		throw createError({
			statusCode: 400,
			message: 'Invalid movie ids',
		})
	}

	const summaries: (CatalogUpdate | null)[] = new Array(ids.length).fill(null)
	let cursor = 0

	async function worker() {
		while (cursor < ids.length) {
			const index = cursor
			cursor += 1
			summaries[index] = await summaryFor(ids[index]!)
		}
	}

	const workers = Math.min(FETCH_CONCURRENCY, ids.length)
	await Promise.all(Array.from({ length: workers }, () => worker()))
	return summaries.flatMap((summary) => (summary ? [summary] : []))
})

function movieIds(value: unknown): string[] {
	if (typeof value !== 'string') {
		return []
	}
	return value
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id.length > 0)
}

async function summaryFor(id: string): Promise<CatalogUpdate | null> {
	try {
		const movie = await fetchTmdbMovie(id)
		if (!movie || typeof movie.title !== 'string') {
			return null
		}
		return {
			id,
			title: movie.title,
			rating: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
			poster: typeof movie.poster_path === 'string' ? movie.poster_path : '',
			genres: localizeTmdbGenreEntries(movie.genres ?? [], 'en-US').map((genre) => genre.name),
		}
	} catch {
		return null
	}
}

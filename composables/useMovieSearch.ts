export type SearchMovie = {
	id: number
	title: string
	popularity: number
	poster: string | null
	backdrop: string | null
	genres: string[]
	rating: number
	releaseYear: number | null
}

export type MovieSearchResponse = {
	results: SearchMovie[]
	total_pages: number
}

export const MOVIE_SEARCH_MIN_LENGTH = 3
export const MOVIE_SEARCH_DEBOUNCE_MS = 500
/** Max movie rows in the suggestions flyout (API page 1 slice). */
export const SUGGESTION_MAX = 5

export async function fetchMovieSearchPage(
	query: string,
	page: number,
	signal?: AbortSignal,
): Promise<MovieSearchResponse> {
	const trimmed = query.trim()
	return await $fetch<MovieSearchResponse>("/api/movies/search", {
		query: {
			query: trimmed,
			page,
		},
		signal,
	})
}

export async function fetchMovieSuggestions(
	query: string,
	options?: { signal?: AbortSignal, limit?: number },
): Promise<SearchMovie[]> {
	const trimmed = query.trim()
	if (trimmed.length < MOVIE_SEARCH_MIN_LENGTH) return []
	const limit = options?.limit ?? SUGGESTION_MAX
	const data = await fetchMovieSearchPage(trimmed, 1, options?.signal)
	return data.results.slice(0, limit)
}

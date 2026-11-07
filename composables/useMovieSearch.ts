export type SearchMovie = {
	id: number
	title: string
	popularity: number
	poster: string | null
	backdrop: string | null
	genres: string[]
	rating: number
}

export type MovieSearchResponse = {
	results: SearchMovie[]
	total_pages: number
}

export const MOVIE_SEARCH_MIN_LENGTH = 3
export const MOVIE_SEARCH_DEBOUNCE_MS = 500
/** Max titles fetched for the suggestion strip (API page 1 slice) */
export const SUGGESTION_DESKTOP_MAX = 7
/** Narrow phones: single column, max titles in strip */
export const SUGGESTION_NARROW_MOBILE_MAX = 4
/** From 380px wide up to tablet */
export const SUGGESTION_MOBILE_MAX = 6

const DESKTOP_STRIP_MIN = 640
const DESKTOP_STRIP_BP_5 = 868
const DESKTOP_STRIP_BP_6 = 1024
const DESKTOP_STRIP_BP_7 = 1240

/** How many title chips to show for a given viewport width (excludes “See all”). */
export function suggestionDisplayLimit(viewportWidth: number): number {
	if (viewportWidth < 380) return SUGGESTION_NARROW_MOBILE_MAX
	if (viewportWidth < DESKTOP_STRIP_MIN) return SUGGESTION_MOBILE_MAX
	if (viewportWidth < DESKTOP_STRIP_BP_5) return 4
	if (viewportWidth < DESKTOP_STRIP_BP_6) return 5
	if (viewportWidth < DESKTOP_STRIP_BP_7) return 6
	return 7
}

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
	const limit = options?.limit ?? SUGGESTION_DESKTOP_MAX
	const data = await fetchMovieSearchPage(trimmed, 1, options?.signal)
	return data.results.slice(0, limit)
}

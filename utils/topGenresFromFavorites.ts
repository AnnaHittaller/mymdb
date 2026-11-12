import type { MediaType } from "~/types/catalog"
import type { UserMovie } from "~/types/movie"
function mediaFor(movie: UserMovie): MediaType {
	return movie.mediaType ?? "movie"
}

/** Rank-weighted top genre names for one media type (earlier favorites weigh more). */
export function topGenreNamesForMedia(
	movies: UserMovie[],
	media: MediaType,
	limit = 2,
): string[] {
	const scoped = movies.filter((movie) => mediaFor(movie) === media)
	if (scoped.length === 0) return []

	const scores = new Map<string, number>()
	for (let index = 0; index < scoped.length; index++) {
		const movie = scoped[index]!
		const weight = scoped.length - index
		for (const genre of movie.genres ?? []) {
			if (!genre) continue
			scores.set(genre, (scores.get(genre) ?? 0) + weight)
		}
	}

	return [...scores.entries()]
		.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
		.slice(0, limit)
		.map(([name]) => name)
}

export function favoritesWithGenresCount(movies: UserMovie[]): number {
	return movies.filter((movie) => (movie.genres?.length ?? 0) > 0).length
}

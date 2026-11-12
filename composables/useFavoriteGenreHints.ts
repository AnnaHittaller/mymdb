import type { MaybeRefOrGetter } from "vue"
import { UPCOMING_PERSONALIZE_MIN_FAVORITES } from "~/constants/upcoming"
import type { UserMovie } from "~/types/movie"
import { mapGenreNamesToIds } from "~/utils/mapGenreNamesToIds"
import {
	favoritesWithGenresCount,
	topGenreNamesForMedia,
} from "~/utils/topGenresFromFavorites"

type GenreListResponse = {
	genres: { id: number, name: string }[]
}

export type FavoriteGenreHints = {
	movieIds: number[]
	tvIds: number[]
	highlightGenre: string | null
}

export function useFavoriteGenreHints(favorites: MaybeRefOrGetter<UserMovie[]>) {
	const { data: movieGenreList } = useFetch<GenreListResponse>("/api/movies/genres", {
		key: "movie-genres-for-upcoming",
	})
	const { data: tvGenreList } = useFetch<GenreListResponse>("/api/tv/genres", {
		key: "tv-genres-for-upcoming",
	})

	return computed((): FavoriteGenreHints | null => {
		const list = toValue(favorites)
		if (favoritesWithGenresCount(list) < UPCOMING_PERSONALIZE_MIN_FAVORITES) {
			return null
		}

		const movieNames = topGenreNamesForMedia(list, "movie", 2)
		const tvNames = topGenreNamesForMedia(list, "tv", 2)
		const movieIds = mapGenreNamesToIds(movieNames, movieGenreList.value?.genres ?? [])
		const tvIds = mapGenreNamesToIds(tvNames, tvGenreList.value?.genres ?? [])

		if (movieIds.length === 0 && tvIds.length === 0) return null

		return {
			movieIds,
			tvIds,
			highlightGenre: movieNames[0] ?? tvNames[0] ?? null,
		}
	})
}

import { overlayTmdbGenreNameMap } from "../../domain/locale/tmdbGenreLabels"

type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

const cachedGenres = new Map<string, { map: Map<number, string>; at: number }>()
const GENRE_CACHE_TTL_MS = 1000 * 60 * 60 * 24

export async function getTvGenreNameMap(language = "en-US"): Promise<Map<number, string>> {
	const now = Date.now()
	const cached = cachedGenres.get(language)
	if (cached && now - cached.at < GENRE_CACHE_TTL_MS) {
		return cached.map
	}

	const config = useRuntimeConfig()
	const genreList = await $fetch<TmdbGenreList>(
		`${config.apiBaseUrl}/genre/tv/list?language=${encodeURIComponent(language)}`,
		{
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		},
	).catch(() => ({ genres: [] }))

	const map = overlayTmdbGenreNameMap(
		new Map(genreList.genres.map((genre) => [genre.id, genre.name])),
		language,
	)
	cachedGenres.set(language, { map, at: now })
	return map
}
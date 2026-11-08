type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

let cachedGenres: Map<number, string> | null = null
let cachedAt = 0
const GENRE_CACHE_TTL_MS = 1000 * 60 * 60 * 24

export async function getTvGenreNameMap(): Promise<Map<number, string>> {
	const now = Date.now()
	if (cachedGenres && now - cachedAt < GENRE_CACHE_TTL_MS) {
		return cachedGenres
	}

	const config = useRuntimeConfig()
	const genreList = await $fetch<TmdbGenreList>(
		`${config.apiBaseUrl}/genre/tv/list?language=en`,
		{
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		},
	).catch(() => ({ genres: [] }))

	cachedGenres = new Map(genreList.genres.map((genre) => [genre.id, genre.name]))
	cachedAt = now
	return cachedGenres
}

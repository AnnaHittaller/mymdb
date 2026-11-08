type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

export default defineCachedEventHandler(async () => {
	try {
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
		)
		return genreList
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch TV genres.",
		})
	}
}, {
	maxAge: 60 * 60 * 24,
	name: "tv-genres",
	getKey: () => "list",
})

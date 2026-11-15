import { localizeTmdbGenreEntries } from "~/domain/locale/tmdbGenreLabels"

type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

export default defineCachedEventHandler(async (event) => {
	try {
		const language = event.context.tmdbLanguage ?? resolveTmdbLanguage(event)
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
		)
		return {
			...genreList,
			genres: localizeTmdbGenreEntries(genreList.genres ?? [], language),
		}
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch TV genres.",
		})
	}
}, {
	maxAge: 60 * 60 * 24,
	name: "tv-genres",
	getKey: (event) => event.context.tmdbLanguage ?? resolveTmdbLanguage(event),
})

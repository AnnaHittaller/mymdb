import { CACHE_DURATION } from "~/constants/movie"

type TmdbCountry = {
	iso_3166_1: string
	english_name: string
}

export default defineCachedEventHandler(async () => {
	try {
		const config = useRuntimeConfig()
		return await $fetch<TmdbCountry[]>(`${config.apiBaseUrl}/configuration/countries`, {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		})
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch countries.",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: "tmdb-configuration-countries",
})

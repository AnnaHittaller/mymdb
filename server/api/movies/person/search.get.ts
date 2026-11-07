type TmdbPersonResult = {
	id: number
	name: string
	profile_path: string | null
}

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const config = useRuntimeConfig()
		const searchQuery = String(query.query ?? "").trim()
		if (!searchQuery) {
			return { results: [] as { id: number, name: string, profile: string | null }[] }
		}

		const page = query.page || 1
		const response = await $fetch<{ results: TmdbPersonResult[] }>(
			`${config.apiBaseUrl}/search/person?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)

		return {
			results: response.results.map((person) => ({
				id: person.id,
				name: person.name,
				profile: person.profile_path,
			})),
		}
	} catch {
		throw createError({
			statusCode: 404,
			message: "Error while searching for people.",
		})
	}
})

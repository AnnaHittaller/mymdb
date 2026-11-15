type TmdbKeywordSearchResponse = {
	results: { id: number, name: string }[]
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const search = String(query.query ?? "").trim()
	if (search.length < 2) {
		return { results: [] }
	}
	const page = Math.max(1, Number(query.page) || 1)
	try {
		const config = useRuntimeConfig()
		const response = await $fetch<TmdbKeywordSearchResponse>(
			`${config.apiBaseUrl}/search/keyword?query=${encodeURIComponent(search)}&page=${page}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)
		return response
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't search keywords.",
		})
	}
})

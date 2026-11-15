type TmdbKeywordResponse = {
	id: number
	name: string
}

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, "id"))
	if (!Number.isFinite(id) || id <= 0) {
		throw createError({ statusCode: 400, message: "Invalid keyword id." })
	}
	try {
		const config = useRuntimeConfig()
		return await $fetch<TmdbKeywordResponse>(`${config.apiBaseUrl}/keyword/${id}`, {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		})
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch keyword.",
		})
	}
})

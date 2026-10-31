export default defineEventHandler(async () => {
	try {
		const config = useRuntimeConfig()
		return await $fetch(`${config.apiBaseUrl}/genre/movie/list?language=en`, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		})
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch movie genres.",
		})
	}
})

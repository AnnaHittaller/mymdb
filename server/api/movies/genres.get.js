export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		const genres = await $fetch(
			`${config.apiBaseUrl}/genre/movie/list?language=en`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			}
		);

		return genres;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch movie genres.",
		});
	}
});

export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		const response = await $fetch(
			`${config.apiBaseUrl}/trending/movie/week?language=en-US`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			}
		);
		const trendingMovieDetails = response.results.map((item) => {
			return {
				title: item.title,
				id: item.id,
				poster: item.poster_path,
				backdrop: item.backdrop_path,
			};
		});
		// console.log("api response", trendingMovieDetails);
		return trendingMovieDetails;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch trending movies.",
		});
	}
});

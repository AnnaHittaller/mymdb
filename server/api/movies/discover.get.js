export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		console.log(query);
		const config = useRuntimeConfig();
		const page = query.page || 1; // Default to page 1 if not provided in the query

		const response = await $fetch(
			`${config.apiBaseUrl}/discover/movie?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			}
		);
		const shortResponse = response.results.map((item) => {
			return {
				title: item.title,
				id: item.id,
				popularity: item.popularity,
				poster: item.poster_path,
				backdrop: item.backdrop_path,
			};
		});
		console.log(shortResponse);
		return shortResponse;
		//return shortResponse;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Error while discovering for movies.",
		});
	}
});



export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		console.log(query);
		const config = useRuntimeConfig(); 
		const page = query.page || 1; // Default to page 1 if not provided in the query
		const url = `${config.apiBaseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;
		console.log(url);

		const response = await $fetch(
			`${config.apiBaseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`,
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
				genres: item.genre_ids,
				rating: item.vote_average,
			};
		});
		console.log(shortResponse);
		//return response;
		return shortResponse;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Error while discovering movies.",
		});
	}
});

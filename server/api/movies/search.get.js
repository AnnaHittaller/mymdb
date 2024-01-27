export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		console.log(query);
		const config = useRuntimeConfig();
		const page = query.page || 1; // Default to page 1 if not provided in the query
		const url = `${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=${page}`;
		console.log(url);

		const response = await $fetch(
			`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=${page}`,
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

		//return shortResponse
		const responseData = {
			results: shortResponse,
			total_pages: response.total_pages,
		};
		//console.log(responseData)

		return responseData;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Error while searching for movies.",
		});
	}
});

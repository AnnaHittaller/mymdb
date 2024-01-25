export default defineEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		//const { id } = event.context.params;
		const query = getQuery(event);

		const response = await $fetch(
			`https://api.themoviedb.org/3/movie/${query.id}/similar?language=en-US&page=1`,
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

		return shortResponse;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Similar movies can't be found",
		});
	}
});

import { CACHE_DURATION } from "~/constants/movie";

export default defineCachedEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig();
		const { id } = event.context.params;

		const response = await $fetch(
			`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits&language=en-US&page=1`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			}
		);

		return response;
	} catch (error) {
		throw createError({
			statusCode: 404,
			message: "Movie can't be found",
		});
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: "movie",
	getKey: (event) => event.context.params.id,
});

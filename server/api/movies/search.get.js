export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		//console.log(query);
		const config = useRuntimeConfig();
		// console.log(
		// 	`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=1`
		// );
		const response = await $fetch(
			`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=1`,
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
			message: "Error while searching for movies.",
		});
	}
});

//use discover instead and the locally filter for title / description text?

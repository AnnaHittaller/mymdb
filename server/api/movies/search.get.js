export default defineEventHandler((event) => {
	const query = getQuery(event);
    console.log(query)
	const config = useRuntimeConfig();
    console.log(
			`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=1`
		);
	return $fetch(
		`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=1`,
		{
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		}
	);
});

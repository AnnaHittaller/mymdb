export default defineEventHandler((event) => {
	const config = useRuntimeConfig();
	const id = [...event.node.req.url.split("/")].pop();

	return $fetch(
		`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits&language=en-US&page=1`,
		{
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
			},
		}
	);
});

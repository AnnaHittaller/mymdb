export default defineEventHandler((event) => {
	const config = useRuntimeConfig();
	return $fetch(
		`https://api.themoviedb.org/3/trending/movie/week?language=en-US`,
		{
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${config.apiBearerToken}`,
				// Authorization:
				// 	"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MTA3M2QxMjg4OGE3YmYwYjVlZjRlMGY1OWMxMDFkMSIsInN1YiI6IjY1NzA4MWI3ZTFmYWVkMDEzOGFkMTYzMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vWGa1AfuKEqJ7TIuciZQXA-zgakUns9Jhw5ieQdKbds",
			},
		}
	);
});

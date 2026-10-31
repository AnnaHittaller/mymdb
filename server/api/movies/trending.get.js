export default defineCachedEventHandler(async () => {
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
		return trendingMovieDetails;
	} catch (error) {
		// #region agent log
		fetch('http://127.0.0.1:7662/ingest/c5a05403-776c-49a2-a824-e32f15757691',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'266990'},body:JSON.stringify({sessionId:'266990',runId:'pre-fix',hypothesisId:'C',location:'server/api/movies/trending.get.js:catch',message:'trending upstream failed',data:{code:error?.code||error?.cause?.code,message:String(error?.message||error).slice(0,200),cause:String(error?.cause?.message||'').slice(0,200)},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch trending movies.",
		});
	}
}, {
	maxAge: 60 * 60,
	name: "trending-movies",
	getKey: () => "week",
});

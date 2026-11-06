export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		return await fetchTmdbMovie(String(id))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Movie can't be found",
		})
	}
})

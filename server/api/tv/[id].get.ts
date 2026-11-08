export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		const details = await fetchTmdbTv(String(id))
		return withTrailer(details)
	} catch {
		throw createError({
			statusCode: 404,
			message: "Show can't be found",
		})
	}
})

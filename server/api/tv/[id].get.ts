export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		return await fetchTmdbTv(String(id))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Show can't be found",
		})
	}
})

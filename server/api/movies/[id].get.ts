import { withDetailCredits } from "~/utils/normalizeDetailCredits"

export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		const details = await fetchTmdbMovie(String(id))
		return withTrailer(
			withDetailCast(withDetailCredits(details, "movie"), "movie"),
		)
	} catch {
		throw createError({
			statusCode: 404,
			message: "Movie can't be found",
		})
	}
})

import { fetchTmdbImages } from "~/server/utils/tmdbImages"
import { fetchTmdbKeywords } from "~/server/utils/tmdbKeywords"
import { withDetailCredits } from "~/utils/normalizeDetailCredits"
import { buildDetailGallery, readDetailMediaSources } from "~/utils/normalizeDetailGallery"

const emptyImages = { posters: [], backdrops: [] }

export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		const movieId = String(id)
		const details = await fetchTmdbMovie(movieId)
		const [keywords, images] = await Promise.all([
			fetchTmdbKeywords("movie", movieId).catch(() => []),
			fetchTmdbImages("movie", movieId).catch(() => emptyImages),
		])
		const sources = readDetailMediaSources(details)
		const enriched = withTrailer(
			withDetailCast(withDetailCredits(details, "movie"), "movie"),
		)
		return {
			...enriched,
			keywords: keywords.filter((keyword) => keyword.name.trim()),
			gallery: buildDetailGallery({
				title: sources.title,
				primaryPosterPath: sources.primaryPosterPath,
				primaryBackdropPath: sources.primaryBackdropPath,
				posters: images.posters,
				backdrops: images.backdrops,
				videos: sources.videos,
			}),
		}
	} catch {
		throw createError({
			statusCode: 404,
			message: "Movie can't be found",
		})
	}
})

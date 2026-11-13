import { fetchTmdbImages } from "~/server/utils/tmdbImages"
import { fetchTmdbKeywords } from "~/server/utils/tmdbKeywords"
import { normalizeTvSeasons } from "~/server/utils/normalizeTvSeasons"
import { withDetailCredits } from "~/utils/normalizeDetailCredits"
import type { TvSeasonSummary } from "~/types/tv"
import { buildDetailGallery, readDetailMediaSources } from "~/utils/normalizeDetailGallery"

const emptyImages = { posters: [], backdrops: [] }

export default defineEventHandler(async (event) => {
	try {
		const { id } = event.context.params!
		const showId = String(id)
		const details = await fetchTmdbTv(showId)
		const [keywords, images] = await Promise.all([
			fetchTmdbKeywords("tv", showId).catch(() => []),
			fetchTmdbImages("tv", showId).catch(() => emptyImages),
		])
		const sources = readDetailMediaSources(details)
		const enriched = withTrailer(
			withDetailCast(withDetailCredits(details, "tv"), "tv"),
		)
		return {
			...enriched,
			seasons: normalizeTvSeasons(
				details as { seasons?: TvSeasonSummary[]; number_of_seasons?: number },
			),
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
			message: "Show can't be found",
		})
	}
})

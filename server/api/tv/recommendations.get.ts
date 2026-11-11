import { CACHE_DURATION } from '~/constants/movie'
import { buildBlendedRelatedTitles, buildPlainRelatedTitles } from '~/server/utils/relatedRecommendations'

function parseBlend(query: Record<string, unknown>): boolean {
	const raw = query.blend
	if (raw === undefined || raw === null || raw === '') return true
	return String(raw) !== '0' && String(raw).toLowerCase() !== 'false'
}

export default defineCachedEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const id = String(query.id)
		if (!parseBlend(query)) {
			return await buildPlainRelatedTitles({ media: 'tv', id })
		}
		return await buildBlendedRelatedTitles({ media: 'tv', id })
	} catch {
		throw createError({
			statusCode: 404,
			message: "Show recommendations can't be found",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: 'tv-recommendations-v5',
	getKey: (event) => {
		const query = getQuery(event)
		const blend = parseBlend(query) ? 'blend' : 'plain'
		return `${String(query.id)}-${blend}`
	},
})

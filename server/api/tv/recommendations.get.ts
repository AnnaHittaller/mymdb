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
		const language = event.context.tmdbLanguage ?? resolveTmdbLanguage(event)
		if (!parseBlend(query)) {
			return await buildPlainRelatedTitles({ media: 'tv', id, language })
		}
		return await buildBlendedRelatedTitles({ media: 'tv', id, language })
	} catch {
		throw createError({
			statusCode: 404,
			message: "Show recommendations can't be found",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: 'tv-recommendations',
	getKey: (event) => {
		const query = getQuery(event)
		const blend = parseBlend(query) ? 'blend' : 'plain'
		const language = event.context.tmdbLanguage ?? resolveTmdbLanguage(event)
		return `${String(query.id)}-${blend}-${language}`
	},
})

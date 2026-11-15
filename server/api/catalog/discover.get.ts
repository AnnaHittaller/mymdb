export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const language = event.context.tmdbLanguage ?? resolveTmdbLanguage(event)
	return await discoverCatalogTitles(query as Record<string, unknown>, language)
})

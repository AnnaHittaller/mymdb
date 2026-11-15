export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const page = query.page || 1
	const searchQuery = String(query.query ?? "")
	const language = resolveTmdbLanguage(event)
	return await searchCatalogTitles(searchQuery, page, language)
})

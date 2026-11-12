export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const page = query.page || 1
	const searchQuery = String(query.query ?? "")
	return await searchCatalogTitles(searchQuery, page)
})

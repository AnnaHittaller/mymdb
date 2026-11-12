export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	return await discoverCatalogTitles(query as Record<string, unknown>)
})

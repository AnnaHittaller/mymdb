import { CATALOG_DISCOVER_PAGE_SIZE } from "~/utils/browseQuery"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const q = String(query.q ?? "").trim()
	if (q) {
		const page = Number(query.page) || 1
		const found = await searchCatalogTitles(q, page)
		return {
			mode: "search" as const,
			results: found.results,
			total_pages: found.total_pages,
			has_more: page < found.total_pages,
		}
	}

	const results = await discoverCatalogTitles(query as Record<string, unknown>)
	return {
		mode: "discover" as const,
		results,
		has_more: results.length >= CATALOG_DISCOVER_PAGE_SIZE,
	}
})

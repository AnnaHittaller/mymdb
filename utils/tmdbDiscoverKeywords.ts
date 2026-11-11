export type TmdbKeywordRef = {
	id: number
	name: string
}

const DISCOVER_KEYWORD_BLOCKLIST = new Set([
	'cliche',
	'cliché',
	'depressing',
	'pretentious',
])

export function isBlockedDiscoverKeyword(name: string): boolean {
	return DISCOVER_KEYWORD_BLOCKLIST.has(name.trim().toLowerCase())
}

/** TMDB discover: pipe `|` = OR, comma `,` = AND. We prefer OR for a broader thematic match. */
export function formatKeywordIdsForDiscover(keywords: TmdbKeywordRef[]): string {
	const thematic = keywords.filter((keyword) => !isBlockedDiscoverKeyword(keyword.name))
	const source = thematic.length > 0 ? thematic : keywords
	return source
		.slice(0, 8)
		.map((keyword) => keyword.id)
		.join('|')
}

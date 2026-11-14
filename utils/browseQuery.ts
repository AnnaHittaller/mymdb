export const CATALOG_DISCOVER_PAGE_SIZE = 20

export type BrowseCastPerson = {
	id: number
	name: string
}

export type BrowseKeyword = BrowseCastPerson

function parseIdNameSegment(segment: string): BrowseCastPerson | null {
	const trimmed = segment.trim()
	if (!trimmed) return null
	let decoded = trimmed
	try {
		decoded = decodeURIComponent(trimmed)
	} catch {
		// Keep the raw segment when it is not valid percent-encoding.
	}
	const colon = decoded.indexOf(":")
	if (colon === -1) {
		if (!/^\d+$/.test(decoded)) return null
		return { id: Number(decoded), name: "" }
	}
	const idPart = decoded.slice(0, colon)
	if (!/^\d+$/.test(idPart)) return null
	return { id: Number(idPart), name: decoded.slice(colon + 1) }
}

/** URL value: comma-separated `encodeURIComponent(id:name)` pairs. */
export function encodeWithCastParam(people: BrowseCastPerson[]): string {
	return people
		.map((person) => encodeURIComponent(`${person.id}:${person.name}`))
		.join(",")
}

export function decodeWithCastParam(value: string): BrowseCastPerson[] {
	if (!value.trim()) return []
	return value.split(",").flatMap((segment) => {
		const person = parseIdNameSegment(segment)
		return person ? [person] : []
	})
}

/** TMDB `with_cast` is ids only, whether the param stores ids or `id:name` pairs. */
export function castIdsFromWithCastParam(value: string): string {
	return decodeWithCastParam(value)
		.map((person) => String(person.id))
		.join(",")
}

/** URL value: comma-separated `encodeURIComponent(id:name)` pairs. */
export function encodeKeywordsParam(keywords: BrowseKeyword[]): string {
	return encodeWithCastParam(keywords)
}

export function decodeKeywordsParam(value: string): BrowseKeyword[] {
	return decodeWithCastParam(value)
}

/** TMDB discover `with_keywords`: pipe-separated ids (OR). */
export function keywordIdsForDiscover(value: string): string {
	return decodeKeywordsParam(value)
		.map((keyword) => String(keyword.id))
		.join("|")
}

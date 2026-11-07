export type SearchPerson = {
	id: number
	name: string
	profile: string | null
}

export type PersonSearchResponse = {
	results: SearchPerson[]
}

export const PERSON_SEARCH_MIN_LENGTH = 2
export const PERSON_SEARCH_DEBOUNCE_MS = 500

export async function fetchPersonSuggestions(
	query: string,
	options?: { signal?: AbortSignal, limit?: number },
): Promise<SearchPerson[]> {
	const trimmed = query.trim()
	if (trimmed.length < PERSON_SEARCH_MIN_LENGTH) return []
	const limit = options?.limit ?? 8
	const data = await $fetch<PersonSearchResponse>("/api/movies/person/search", {
		query: { query: trimmed },
		signal: options?.signal,
	})
	return data.results.slice(0, limit)
}

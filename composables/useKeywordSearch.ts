import { refDebounced } from "@vueuse/core"

export type KeywordSearchResult = {
	id: number
	name: string
}

type KeywordSearchResponse = {
	results: KeywordSearchResult[]
}

export const KEYWORD_SEARCH_MIN_LENGTH = 2
export const KEYWORD_SEARCH_DEBOUNCE_MS = 400

export async function fetchKeywordSuggestions(
	query: string,
	options?: { excludeIds?: number[], limit?: number, signal?: AbortSignal },
): Promise<KeywordSearchResult[]> {
	const trimmed = query.trim()
	if (trimmed.length < KEYWORD_SEARCH_MIN_LENGTH) return []
	const limit = options?.limit ?? 8
	const blocked = new Set(options?.excludeIds ?? [])
	try {
		const response = await $fetch<KeywordSearchResponse>("/api/keywords/search", {
			query: { query: trimmed },
			signal: options?.signal,
		})
		return response.results
			.filter((entry) => !blocked.has(entry.id))
			.slice(0, limit)
	} catch {
		return []
	}
}

export function useKeywordSuggestionInput(excludeIds: MaybeRefOrGetter<number[]>) {
	const searchTerm = ref("")
	const debouncedSearch = refDebounced(searchTerm, KEYWORD_SEARCH_DEBOUNCE_MS)
	const suggestions = ref<{ label: string, value: number }[]>([])
	const inputKey = ref(0)
	let searchAbort: AbortController | null = null

	watch(debouncedSearch, async (term) => {
		searchAbort?.abort()
		const trimmed = term.trim()
		if (trimmed.length < KEYWORD_SEARCH_MIN_LENGTH) {
			suggestions.value = []
			return
		}
		const controller = new AbortController()
		searchAbort = controller
		const results = await fetchKeywordSuggestions(trimmed, {
			excludeIds: toValue(excludeIds),
			signal: controller.signal,
		})
		if (controller.signal.aborted) return
		suggestions.value = results.map((entry) => ({ label: entry.name, value: entry.id }))
	})

	function resetKeywordInput() {
		searchTerm.value = ""
		suggestions.value = []
		inputKey.value += 1
	}

	return {
		searchTerm,
		suggestions,
		inputKey,
		resetKeywordInput,
	}
}
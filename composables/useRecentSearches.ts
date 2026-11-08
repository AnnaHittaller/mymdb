const RECENT_SEARCHES_KEY = "mymdb-recent-searches";
export const RECENT_SEARCHES_MAX = 10;
export const RECENT_SEARCHES_MOBILE_DISPLAY = 5;
export const RECENT_SEARCHES_DESKTOP_DISPLAY = 10;

function readFromStorage(): string[] {
	if (!import.meta.client) return [];
	try {
		const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item): item is string => typeof item === "string");
	} catch {
		return [];
	}
}

function writeToStorage(items: string[]) {
	if (!import.meta.client) return;
	try {
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
	} catch {
		// Private mode or quota; recents are non-critical.
	}
}

export function useRecentSearches() {
	const recents = useState<string[]>("recent-searches", () => []);

	if (import.meta.client) {
		onMounted(() => {
			if (recents.value.length === 0) {
				recents.value = readFromStorage();
			}
		});
	}

	function add(query: string) {
		const trimmed = query.trim();
		if (!trimmed) return;

		const lower = trimmed.toLowerCase();
		const next = [
			trimmed,
			...recents.value.filter((item) => item.toLowerCase() !== lower),
		].slice(0, RECENT_SEARCHES_MAX);

		recents.value = next;
		writeToStorage(next);
	}

	function filteredByPrefix(draft: string): string[] {
		const prefix = draft.trim().toLowerCase();
		if (!prefix) return recents.value.slice(0, RECENT_SEARCHES_MAX);
		return recents.value
			.filter((item) => item.toLowerCase().includes(prefix))
			.slice(0, RECENT_SEARCHES_MAX);
	}

	return { recents, add, filteredByPrefix };
}

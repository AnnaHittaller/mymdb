import type { BrowseListing, BrowseMode, CatalogCard, MediaType } from "~/types/catalog"
import {
	CATALOG_DISCOVER_PAGE_SIZE,
	castIdsFromWithCastParam,
	decodeWithCastParam,
	encodeWithCastParam,
	type BrowseCastPerson,
} from "~/utils/browseQuery"

type BrowsePayload = BrowseListing & {
	requested: string
	requestedPage: number
}

function queryParam(value: unknown): string {
	if (Array.isArray(value)) return String(value[0] ?? "")
	if (value == null) return ""
	return String(value)
}

function positiveInt(value: string): number {
	const parsed = Number(value)
	if (!Number.isInteger(parsed) || parsed <= 0) return 0
	return parsed
}

function genreIdList(value: string): number[] {
	return value.split(",").flatMap((part) => {
		const id = positiveInt(part.trim())
		return id > 0 ? [id] : []
	})
}

export function useCatalogListing() {
	const route = useRoute()
	const page = ref(1)
	const movies = ref<CatalogCard[]>([])
	const hasMore = ref(false)
	const { add: addRecentSearch } = useRecentSearches()

	const q = computed(() => queryParam(route.query.q).trim())
	const mode = computed<BrowseMode>(() => (q.value ? "search" : "discover"))

	function currentQuery(): Record<string, string | undefined> {
		return {
			q: q.value || undefined,
			media: media.value === "tv" ? "tv" : undefined,
			rating: rating.value > 0 ? String(rating.value) : undefined,
			genres: genreIds.value.length ? genreIds.value.join(",") : undefined,
			with_cast: castPeople.value.length ? encodeWithCastParam(castPeople.value) : undefined,
			release_year_gte: releaseYearFrom.value > 0 ? String(releaseYearFrom.value) : undefined,
			release_year_lte: releaseYearTo.value > 0 ? String(releaseYearTo.value) : undefined,
		}
	}

	async function writeQuery(patch: Record<string, string | undefined>) {
		const merged = { ...currentQuery(), ...patch }
		const query: Record<string, string> = {}
		for (const [key, value] of Object.entries(merged)) {
			if (value) query[key] = value
		}
		await navigateTo({ path: "/browse", query }, { replace: true })
	}

	const media = computed<MediaType>({
		get() {
			return queryParam(route.query.media) === "tv" ? "tv" : "movie"
		},
		set(next) {
			if (next === (queryParam(route.query.media) === "tv" ? "tv" : "movie")) return
			void writeQuery({
				media: next === "tv" ? "tv" : undefined,
				rating: undefined,
				genres: undefined,
				with_cast: undefined,
				release_year_gte: undefined,
				release_year_lte: undefined,
			})
		},
	})

	const rating = computed({
		get: () => positiveInt(queryParam(route.query.rating)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.rating))) return
			void writeQuery({ rating: normalized > 0 ? String(normalized) : undefined })
		},
	})

	const genreIds = computed<number[]>({
		get() {
			return genreIdList(queryParam(route.query.genres))
		},
		set(ids) {
			const next = ids.join(",")
			if (next === genreIdList(queryParam(route.query.genres)).join(",")) return
			void writeQuery({ genres: next || undefined })
		},
	})

	const releaseYearFrom = computed({
		get: () => positiveInt(queryParam(route.query.release_year_gte)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.release_year_gte))) return
			void writeQuery({ release_year_gte: normalized > 0 ? String(normalized) : undefined })
		},
	})

	const releaseYearTo = computed({
		get: () => positiveInt(queryParam(route.query.release_year_lte)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.release_year_lte))) return
			void writeQuery({ release_year_lte: normalized > 0 ? String(normalized) : undefined })
		},
	})

	const withCastParam = computed(() => queryParam(route.query.with_cast))

	const castPeople = computed(() =>
		decodeWithCastParam(withCastParam.value).filter((person) => person.name),
	)

	const releaseYears = computed(() => {
		let from = releaseYearFrom.value
		let to = releaseYearTo.value
		if (from > 0 && to > 0 && from > to) {
			;[from, to] = [to, from]
		}
		return { from, to }
	})

	const filtersActive = computed(() =>
		rating.value > 0
		|| genreIds.value.length > 0
		|| castPeople.value.length > 0
		|| releaseYearFrom.value > 0
		|| releaseYearTo.value > 0,
	)

	// Discover filters stay in the URL during search, but they do not change the TMDB request.
	const fetchSignature = computed(() => {
		if (mode.value === "search") return `search|${q.value}`
		return [
			"discover",
			media.value,
			rating.value,
			genreIds.value.join(","),
			castIdsFromWithCastParam(withCastParam.value),
			releaseYears.value.from,
			releaseYears.value.to,
		].join("|")
	})

	const requestKey = computed(() => `${fetchSignature.value}|${page.value}`)

	watch(fetchSignature, () => {
		page.value = 1
		movies.value = []
		hasMore.value = false
	})

	const fetched = useAsyncData(
		() => `browse-${requestKey.value}`,
		async () => {
			const requested = requestKey.value
			const requestedPage = page.value
			const searchMode = mode.value === "search"
			const castIds = castIdsFromWithCastParam(withCastParam.value)
			const response = await $fetch<BrowseListing>("/api/catalog/browse", {
				query: searchMode
					? { q: q.value, page: requestedPage }
					: {
						media: media.value,
						page: requestedPage,
						rating: rating.value > 0 ? rating.value : undefined,
						genres: genreIds.value.length ? genreIds.value.join(",") : undefined,
						with_cast: castIds || undefined,
						release_year_gte: releaseYears.value.from || undefined,
						release_year_lte: releaseYears.value.to || undefined,
					},
			})
			return {
				...response,
				requested,
				requestedPage,
			} satisfies BrowsePayload
		},
		{ watch: [requestKey] },
	)

	watch(fetched.data, (payload) => {
		if (!payload) return
		if (payload.requested !== requestKey.value) return

		const visible = payload.results.filter((movie) => movie.poster)
		if (payload.mode === "search") {
			hasMore.value = payload.requestedPage < (payload.total_pages ?? 0)
		} else {
			hasMore.value = payload.results.length >= CATALOG_DISCOVER_PAGE_SIZE
		}

		if (payload.requestedPage === 1) {
			movies.value = visible
			return
		}

		const seen = new Set(movies.value.map((movie) => `${movie.mediaType}-${movie.id}`))
		movies.value = [
			...movies.value,
			...visible.filter((movie) => !seen.has(`${movie.mediaType}-${movie.id}`)),
		]
	}, { immediate: true })

	const pending = computed(() => fetched.status.value === "pending")

	function loadMore() {
		if (pending.value || !hasMore.value) return
		page.value += 1
	}

	async function commitSearch(trimmed: string) {
		addRecentSearch(trimmed)
		await writeQuery({ q: trimmed })
	}

	async function clearSearch() {
		await writeQuery({ q: undefined })
	}

	function addCast(person: BrowseCastPerson) {
		if (!person.name || castPeople.value.some((entry) => entry.id === person.id)) return
		void writeQuery({
			with_cast: encodeWithCastParam([...castPeople.value, person]),
		})
	}

	function removeCast(id: number) {
		const next = castPeople.value.filter((person) => person.id !== id)
		void writeQuery({
			with_cast: next.length ? encodeWithCastParam(next) : undefined,
		})
	}

	function clearFilters() {
		void writeQuery({
			rating: undefined,
			genres: undefined,
			with_cast: undefined,
			release_year_gte: undefined,
			release_year_lte: undefined,
		})
	}

	return {
		ready: fetched,
		q,
		mode,
		media,
		rating,
		genreIds,
		releaseYearFrom,
		releaseYearTo,
		castPeople,
		filtersActive,
		movies,
		pending,
		status: fetched.status,
		error: fetched.error,
		hasMore,
		page,
		loadMore,
		commitSearch,
		clearSearch,
		addCast,
		removeCast,
		clearFilters,
	}
}

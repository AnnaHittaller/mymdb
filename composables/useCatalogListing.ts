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

const CLEAR_DISCOVER_FILTER_PARAMS = {
	rating: undefined,
	genres: undefined,
	with_cast: undefined,
	release_year_gte: undefined,
	release_year_lte: undefined,
} satisfies Record<string, undefined>

function discoverFiltersInQuery(route: ReturnType<typeof useRoute>): boolean {
	return positiveInt(queryParam(route.query.rating)) > 0
		|| genreIdList(queryParam(route.query.genres)).length > 0
		|| decodeWithCastParam(queryParam(route.query.with_cast)).some((person) => person.name)
		|| positiveInt(queryParam(route.query.release_year_gte)) > 0
		|| positiveInt(queryParam(route.query.release_year_lte)) > 0
}

function patchLeavingSearch(patch: Record<string, string | undefined>) {
	return { ...patch, q: undefined }
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
			void writeQuery(patchLeavingSearch({
				media: next === "tv" ? "tv" : undefined,
				...CLEAR_DISCOVER_FILTER_PARAMS,
			}))
		},
	})

	const rating = computed({
		get: () => positiveInt(queryParam(route.query.rating)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.rating))) return
			const patch = { rating: normalized > 0 ? String(normalized) : undefined }
			void writeQuery(normalized > 0 ? patchLeavingSearch(patch) : patch)
		},
	})

	const genreIds = computed<number[]>({
		get() {
			return genreIdList(queryParam(route.query.genres))
		},
		set(ids) {
			const next = ids.join(",")
			if (next === genreIdList(queryParam(route.query.genres)).join(",")) return
			const patch = { genres: next || undefined }
			void writeQuery(next ? patchLeavingSearch(patch) : patch)
		},
	})

	const releaseYearFrom = computed({
		get: () => positiveInt(queryParam(route.query.release_year_gte)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.release_year_gte))) return
			const patch = { release_year_gte: normalized > 0 ? String(normalized) : undefined }
			void writeQuery(normalized > 0 ? patchLeavingSearch(patch) : patch)
		},
	})

	const releaseYearTo = computed({
		get: () => positiveInt(queryParam(route.query.release_year_lte)),
		set: (next: number) => {
			const normalized = next > 0 ? next : 0
			if (normalized === positiveInt(queryParam(route.query.release_year_lte))) return
			const patch = { release_year_lte: normalized > 0 ? String(normalized) : undefined }
			void writeQuery(normalized > 0 ? patchLeavingSearch(patch) : patch)
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

	const discoverDimmed = computed(() => Boolean(q.value))
	const searchDimmed = computed(() => filtersActive.value)

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
		await writeQuery({ q: trimmed, ...CLEAR_DISCOVER_FILTER_PARAMS })
	}

	async function clearSearch() {
		await writeQuery({ q: undefined })
	}

	function addCast(person: BrowseCastPerson) {
		if (!person.name || castPeople.value.some((entry) => entry.id === person.id)) return
		void writeQuery(patchLeavingSearch({
			with_cast: encodeWithCastParam([...castPeople.value, person]),
		}))
	}

	function removeCast(id: number) {
		const next = castPeople.value.filter((person) => person.id !== id)
		void writeQuery({
			with_cast: next.length ? encodeWithCastParam(next) : undefined,
		})
	}

	function clearFilters() {
		void writeQuery({ ...CLEAR_DISCOVER_FILTER_PARAMS })
	}

	if (import.meta.client) {
		onMounted(() => {
			if (q.value && discoverFiltersInQuery(route)) {
				void writeQuery(CLEAR_DISCOVER_FILTER_PARAMS)
			}
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
		discoverDimmed,
		searchDimmed,
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

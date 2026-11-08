<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { castActorInputUi } from "~/constants/discoverFilterUi";
import {
	fetchPersonSuggestions,
	PERSON_SEARCH_DEBOUNCE_MS,
	PERSON_SEARCH_MIN_LENGTH,
} from "~/composables/usePersonSearch";
import type { MediaType } from "~/types/catalog";

type DiscoverTitle = {
	id: number
	mediaType: MediaType
	title: string
	popularity: number
	poster: string | null
	backdrop: string | null
	genres: string[]
	rating: number
}

type GenreList = {
	genres: { id: number, name: string }[]
}

type CastPerson = {
	id: number
	name: string
}

type CastMenuItem = {
	label: string
	value: number
}

type FilterChip = {
	id: string
	label: string
	removeLabel: string
}

const filterMenuControl = { highlightOnHover: true }

const filterFieldClass = "w-full sm:w-48"

definePageMeta({
	middleware: "auth",
})

const ratingItems = [
	{ label: "Any rating", value: 0 },
	{ label: "8+", value: 8 },
	{ label: "7+", value: 7 },
	{ label: "6+", value: 6 },
	{ label: "5+", value: 5 },
	{ label: "4+", value: 4 },
	{ label: "3+", value: 3 },
	{ label: "2+", value: 2 },
]

const currentYear = new Date().getFullYear()
const yearChoices = Array.from({ length: currentYear - 1899 }, (_, index) => {
	const year = currentYear - index
	return { label: String(year), value: year }
})
const yearFromItems = [{ label: "From (any year)", value: 0 }, ...yearChoices]
const yearToItems = [{ label: "To (any year)", value: 0 }, ...yearChoices]

const media = ref<MediaType>("movie")
const page = ref(1)
const rating = ref(0)
const genreIds = ref<number[]>([])
const releaseYearFrom = ref(0)
const releaseYearTo = ref(0)
const castPeople = ref<CastPerson[]>([])
const movies = ref<DiscoverTitle[]>([])
const hasMore = ref(false)

const castSearchTerm = ref("")
const debouncedCastSearch = refDebounced(castSearchTerm, PERSON_SEARCH_DEBOUNCE_MS)
const castSuggestionItems = ref<CastMenuItem[]>([])
const castInputKey = ref(0)
let castSearchAbort: AbortController | null = null

const genreUrl = computed(() => (media.value === "tv" ? "/api/tv/genres" : "/api/movies/genres"))
const { data: genreList, refresh: refreshGenres } = await useFetch<GenreList>(() => genreUrl.value, {
	watch: [genreUrl],
})
const genreItems = computed(() =>
	(genreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
)
const genreNameById = computed(() => new Map(genreItems.value.map((genre) => [genre.value, genre.label])))

const genreKey = computed(() => genreIds.value.join(","))
const castKey = computed(() => castPeople.value.map((person) => person.id).join(","))
const releaseYears = computed(() => {
	let from = releaseYearFrom.value
	let to = releaseYearTo.value
	if (from > 0 && to > 0 && from > to) {
		;[from, to] = [to, from]
	}
	return { from, to }
})
const yearKey = computed(() => `${releaseYears.value.from},${releaseYears.value.to}`)

const filtersActive = computed(() =>
	rating.value > 0
	|| genreIds.value.length > 0
	|| castPeople.value.length > 0
	|| releaseYearFrom.value > 0
	|| releaseYearTo.value > 0,
)

const filterChips = computed<FilterChip[]>(() => {
	const chips: FilterChip[] = []
	if (rating.value > 0) {
		chips.push({
			id: "rating",
			label: `Rating: ${rating.value}+`,
			removeLabel: "Remove rating filter",
		})
	}
	for (const genreId of genreIds.value) {
		const name = genreNameById.value.get(genreId) ?? String(genreId)
		chips.push({
			id: `genre-${genreId}`,
			label: name,
			removeLabel: `Remove genre ${name}`,
		})
	}
	if (releaseYearFrom.value > 0) {
		chips.push({
			id: "year-from",
			label: `From: ${releaseYearFrom.value}`,
			removeLabel: "Remove release year from filter",
		})
	}
	if (releaseYearTo.value > 0) {
		chips.push({
			id: "year-to",
			label: `To: ${releaseYearTo.value}`,
			removeLabel: "Remove release year to filter",
		})
	}
	for (const person of castPeople.value) {
		chips.push({
			id: `cast-${person.id}`,
			label: person.name,
			removeLabel: `Remove ${person.name}`,
		})
	}
	return chips
})

const discoverHeading = computed(() =>
	media.value === "tv" ? "Discover new shows" : "Discover new movies",
)

const castHint = computed(() =>
	media.value === "tv"
		? "Shows starring all selected actors."
		: "Movies starring all selected actors.",
)

watch(media, async (next, prev) => {
	if (next === prev) return
	clearFilters()
	page.value = 1
	movies.value = []
	hasMore.value = false
	await refreshGenres()
})

watch([rating, genreKey, castKey, yearKey], () => {
	page.value = 1
	movies.value = []
	hasMore.value = false
})

watch(debouncedCastSearch, async (term) => {
	castSearchAbort?.abort()
	const trimmed = term.trim()
	if (trimmed.length < PERSON_SEARCH_MIN_LENGTH) {
		castSuggestionItems.value = []
		return
	}
	const controller = new AbortController()
	castSearchAbort = controller
	try {
		const people = await fetchPersonSuggestions(trimmed, { signal: controller.signal })
		if (controller.signal.aborted) return
		const selectedIds = new Set(castPeople.value.map((person) => person.id))
		castSuggestionItems.value = people
			.filter((person) => !selectedIds.has(person.id))
			.map((person) => ({ label: person.name, value: person.id }))
	} catch {
		if (!controller.signal.aborted) {
			castSuggestionItems.value = []
		}
	}
})

const discoverKey = computed(
	() => `${media.value}|${page.value}|${rating.value}|${genreKey.value}|${castKey.value}|${yearKey.value}`,
)

const { data, status, error } = await useAsyncData(
	() => `discover-${discoverKey.value}`,
	async () => {
		const requestedMedia = media.value
		const requestedPage = page.value
		const requestedRating = rating.value
		const requestedGenres = genreKey.value
		const requestedCast = castKey.value
		const requestedYears = yearKey.value
		const { from, to } = releaseYears.value
		const results = await $fetch<DiscoverTitle[]>("/api/catalog/discover", {
			query: {
				media: requestedMedia,
				page: requestedPage,
				rating: requestedRating,
				genres: requestedGenres,
				with_cast: requestedCast,
				release_year_gte: from || undefined,
				release_year_lte: to || undefined,
			},
		})
		return {
			results,
			requestedMedia,
			requestedPage,
			requestedRating,
			requestedGenres,
			requestedCast,
			requestedYears,
		}
	},
	{ watch: [media, page, rating, genreKey, castKey, yearKey] },
)

watch(data, (payload) => {
	if (!payload) return
	if (
		payload.requestedMedia !== media.value
		|| payload.requestedPage !== page.value
		|| payload.requestedRating !== rating.value
		|| payload.requestedGenres !== genreKey.value
		|| payload.requestedCast !== castKey.value
		|| payload.requestedYears !== yearKey.value
	) return
	const visible = payload.results.filter((movie) => movie.poster)
	hasMore.value = payload.results.length >= 20
	if (payload.requestedPage === 1) {
		movies.value = visible
	} else {
		const seen = new Set(movies.value.map((movie) => `${movie.mediaType}-${movie.id}`))
		movies.value = [...movies.value, ...visible.filter((movie) => !seen.has(`${movie.mediaType}-${movie.id}`))]
	}
}, { immediate: true })

const pending = computed(() => status.value === "pending")

const awaitingResults = computed(
	() => movies.value.length === 0 && (pending.value || status.value === "idle"),
)

function onCastPick(value: number | undefined) {
	if (value == null) return
	const item = castSuggestionItems.value.find((entry) => entry.value === value)
	const name = item?.label
	if (!name || castPeople.value.some((person) => person.id === value)) {
		castSearchTerm.value = ""
		castInputKey.value += 1
		return
	}
	castPeople.value = [...castPeople.value, { id: value, name }]
	castSearchTerm.value = ""
	castSuggestionItems.value = []
	castInputKey.value += 1
}

function removeFilterChip(chipId: string) {
	if (chipId === "rating") {
		rating.value = 0
		return
	}
	if (chipId === "year-from") {
		releaseYearFrom.value = 0
		return
	}
	if (chipId === "year-to") {
		releaseYearTo.value = 0
		return
	}
	if (chipId.startsWith("genre-")) {
		const genreId = Number(chipId.slice("genre-".length))
		genreIds.value = genreIds.value.filter((id) => id !== genreId)
		return
	}
	if (chipId.startsWith("cast-")) {
		const personId = Number(chipId.slice("cast-".length))
		castPeople.value = castPeople.value.filter((person) => person.id !== personId)
	}
}

function clearFilters() {
	rating.value = 0
	genreIds.value = []
	releaseYearFrom.value = 0
	releaseYearTo.value = 0
	castPeople.value = []
	castSearchTerm.value = ""
	castSuggestionItems.value = []
	castInputKey.value += 1
}

function loadMore() {
	if (pending.value || !hasMore.value) return
	page.value += 1
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading>{{ discoverHeading }}</Heading>
			<div class="flex flex-wrap gap-4 items-center">
				<DiscoverMediaToggle v-model="media" />
				<USelect
					v-model="rating"
					:items="ratingItems"
					:class="filterFieldClass" />
				<USelectMenu
					v-model="genreIds"
					v-bind="filterMenuControl"
					:items="genreItems"
					value-key="value"
					multiple
					placeholder="Any Genres"
					:class="filterFieldClass">
					<template #default>
						<span class="truncate text-fg-default">Any Genres</span>
					</template>
				</USelectMenu>
				<USelect
					v-model="releaseYearFrom"
					:items="yearFromItems"
					:class="filterFieldClass" />
				<USelect
					v-model="releaseYearTo"
					:items="yearToItems"
					:class="filterFieldClass" />
				<UInputMenu
					:key="castInputKey"
					v-model:search-term="castSearchTerm"
					:model-value="undefined"
					v-bind="filterMenuControl"
					:items="castSuggestionItems"
					ignore-filter
					value-key="value"
					placeholder="Search actors"
					:class="filterFieldClass"
					:ui="castActorInputUi"
					@update:model-value="onCastPick" />
			</div>
			<div v-if="filtersActive" class="flex flex-wrap items-center gap-2">
				<DiscoverFilterChip
					v-for="chip in filterChips"
					:key="chip.id"
					:label="chip.label"
					:remove-label="chip.removeLabel"
					@remove="removeFilterChip(chip.id)" />
				<p v-if="castPeople.length > 1" class="w-full text-sm text-fg-muted">
					{{ castHint }}
				</p>
				<UButton label="Clear" variant="outline" class="ml-auto sm:ml-0" @click="clearFilters" />
			</div>
		</div>
		<div class="flex flex-col items-stretch">
			<p v-if="error && movies.length === 0 && !awaitingResults" class="text-lg">Couldn't load titles.</p>
			<p v-else-if="awaitingResults" class="text-lg">Loading…</p>
			<p v-else-if="movies.length === 0" class="text-lg">No titles match these filters.</p>
			<div v-if="movies.length > 0" class="movie-grid">
				<MovieCard
					v-for="movie in movies"
					:key="`${movie.mediaType}-${movie.id}`"
					:movie="movie"
					:media-type="movie.mediaType" />
			</div>
			<UButton
				v-if="movies.length > 0 && hasMore"
				label="Load more"
				size="xl"
				class="mt-14 mb-8 self-center"
				:loading="pending && page > 1"
				:disabled="pending"
				@click="loadMore" />
		</div>
	</div>
</template>

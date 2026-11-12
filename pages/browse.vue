<script setup lang="ts">
import { refDebounced, useWindowSize } from "@vueuse/core";
import { castActorInputUi } from "~/constants/discoverFilterUi";
import {
	fetchPersonSuggestions,
	PERSON_SEARCH_DEBOUNCE_MS,
	PERSON_SEARCH_MIN_LENGTH,
} from "~/composables/usePersonSearch";
import {
	MOVIE_SEARCH_DEBOUNCE_MS,
	MOVIE_SEARCH_MIN_LENGTH,
} from "~/composables/useMovieSearch";
import {
	RECENT_SEARCHES_DESKTOP_DISPLAY,
	RECENT_SEARCHES_MOBILE_DISPLAY,
	useRecentSearches,
} from "~/composables/useRecentSearches";
import { searchQuerySchema } from "~/schemas/schemas";

type GenreList = {
	genres: { id: number, name: string }[]
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

definePageMeta({
	middleware: "auth",
});

const filterMenuControl = { highlightOnHover: true };
const filterFieldClass = "w-full sm:w-48";

const ratingItems = [
	{ label: "Any rating", value: 0 },
	{ label: "8+", value: 8 },
	{ label: "7+", value: 7 },
	{ label: "6+", value: 6 },
	{ label: "5+", value: 5 },
	{ label: "4+", value: 4 },
	{ label: "3+", value: 3 },
	{ label: "2+", value: 2 },
];

const currentYear = new Date().getFullYear();
const yearChoices = Array.from({ length: currentYear - 1899 }, (_, index) => {
	const year = currentYear - index;
	return { label: String(year), value: year };
});
const yearFromItems = [{ label: "From (any year)", value: 0 }, ...yearChoices];
const yearToItems = [{ label: "To (any year)", value: 0 }, ...yearChoices];

const {
	ready,
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
	status,
	error,
	hasMore,
	page,
	loadMore,
	commitSearch,
	clearSearch,
	addCast,
	removeCast,
	clearFilters,
} = useCatalogListing();

await ready;

const { recents } = useRecentSearches();

const state = reactive({
	query: "",
});

const debouncedQuery = refDebounced(toRef(state, "query"), MOVIE_SEARCH_DEBOUNCE_MS);
const formRef = useTemplateRef("searchForm");
const { width: viewportWidth } = useWindowSize();
const isMobileChrome = computed(() => viewportWidth.value < 640);
const recentDisplayLimit = computed(() =>
	isMobileChrome.value ? RECENT_SEARCHES_MOBILE_DISPLAY : RECENT_SEARCHES_DESKTOP_DISPLAY,
);
const visibleRecents = computed(() => recents.value.slice(0, recentDisplayLimit.value));

const castSearchTerm = ref("");
const debouncedCastSearch = refDebounced(castSearchTerm, PERSON_SEARCH_DEBOUNCE_MS);
const castSuggestionItems = ref<CastMenuItem[]>([]);
const castInputKey = ref(0);
let castSearchAbort: AbortController | null = null;

const genreUrl = computed(() => (media.value === "tv" ? "/api/tv/genres" : "/api/movies/genres"));
const { data: genreList } = await useFetch<GenreList>(() => genreUrl.value, {
	watch: [genreUrl],
});
const genreItems = computed(() =>
	(genreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
);
const genreNameById = computed(() => new Map(genreItems.value.map((genre) => [genre.value, genre.label])));

const subtitle = computed(() =>
	mode.value === "search"
		? `Results for «${q.value}»`
		: "Popular titles — narrow with filters below.",
);

const castHint = computed(() =>
	media.value === "tv"
		? "Shows starring all selected actors."
		: "Movies starring all selected actors.",
);

const filterChips = computed<FilterChip[]>(() => {
	const chips: FilterChip[] = [];
	if (rating.value > 0) {
		chips.push({
			id: "rating",
			label: `Rating: ${rating.value}+`,
			removeLabel: "Remove rating filter",
		});
	}
	for (const genreId of genreIds.value) {
		const name = genreNameById.value.get(genreId) ?? String(genreId);
		chips.push({
			id: `genre-${genreId}`,
			label: name,
			removeLabel: `Remove genre ${name}`,
		});
	}
	if (releaseYearFrom.value > 0) {
		chips.push({
			id: "year-from",
			label: `From: ${releaseYearFrom.value}`,
			removeLabel: "Remove release year from filter",
		});
	}
	if (releaseYearTo.value > 0) {
		chips.push({
			id: "year-to",
			label: `To: ${releaseYearTo.value}`,
			removeLabel: "Remove release year to filter",
		});
	}
	for (const person of castPeople.value) {
		chips.push({
			id: `cast-${person.id}`,
			label: person.name,
			removeLabel: `Remove ${person.name}`,
		});
	}
	return chips;
});

const awaitingResults = computed(
	() => movies.value.length === 0 && (pending.value || status.value === "idle"),
);

const statusMessage = computed(() => {
	if (awaitingResults.value) {
		return mode.value === "search" ? "Loading results…" : "Loading…";
	}
	if (error.value && movies.value.length === 0) {
		return mode.value === "search" ? "Couldn't load search results." : "Couldn't load titles.";
	}
	if (movies.value.length === 0) {
		return mode.value === "search"
			? "No matching results can be found."
			: "No titles match these filters.";
	}
	return "";
});

watch(q, (next) => {
	if (state.query.trim() !== next) {
		state.query = next;
	}
}, { immediate: true });

watch(debouncedQuery, (value) => {
	const trimmed = value.trim();
	if (trimmed.length >= MOVIE_SEARCH_MIN_LENGTH) {
		if (trimmed !== q.value) {
			void commitSearch(trimmed);
		}
		return;
	}
	if (trimmed.length === 0 && q.value) {
		void clearSearch();
	}
});

watch(() => state.query, () => {
	formRef.value?.clear();
});

watch(media, () => {
	resetCastInput();
});

watch(debouncedCastSearch, async (term) => {
	castSearchAbort?.abort();
	const trimmed = term.trim();
	if (trimmed.length < PERSON_SEARCH_MIN_LENGTH) {
		castSuggestionItems.value = [];
		return;
	}
	const controller = new AbortController();
	castSearchAbort = controller;
	try {
		const people = await fetchPersonSuggestions(trimmed, { signal: controller.signal });
		if (controller.signal.aborted) return;
		const selectedIds = new Set(castPeople.value.map((person) => person.id));
		castSuggestionItems.value = people
			.filter((person) => !selectedIds.has(person.id))
			.map((person) => ({ label: person.name, value: person.id }));
	} catch {
		if (!controller.signal.aborted) {
			castSuggestionItems.value = [];
		}
	}
});

function resetCastInput() {
	castSearchTerm.value = "";
	castSuggestionItems.value = [];
	castInputKey.value += 1;
}

async function onExplicitSearch() {
	const parsed = searchQuerySchema.safeParse({ query: state.query });
	if (!parsed.success) {
		const message
			= parsed.error.issues.find((issue) => issue.path[0] === "query")?.message
			?? "Enter at least 2 characters";
		formRef.value?.setErrors([{ name: "query", message }]);
		return;
	}
	formRef.value?.clear();
	await commitSearch(parsed.data.query.trim());
}

function onClearQuery() {
	state.query = "";
}

function onSelectRecent(query: string) {
	state.query = query;
	void commitSearch(query.trim());
}

function onCastPick(value: number | undefined) {
	if (value == null) return;
	const item = castSuggestionItems.value.find((entry) => entry.value === value);
	const name = item?.label;
	if (!name) {
		resetCastInput();
		return;
	}
	addCast({ id: value, name });
	resetCastInput();
}

function removeFilterChip(chipId: string) {
	if (chipId === "rating") {
		rating.value = 0;
		return;
	}
	if (chipId === "year-from") {
		releaseYearFrom.value = 0;
		return;
	}
	if (chipId === "year-to") {
		releaseYearTo.value = 0;
		return;
	}
	if (chipId.startsWith("genre-")) {
		const genreId = Number(chipId.slice("genre-".length));
		genreIds.value = genreIds.value.filter((id) => id !== genreId);
		return;
	}
	if (chipId.startsWith("cast-")) {
		const personId = Number(chipId.slice("cast-".length));
		removeCast(personId);
	}
}

function onClearFilters() {
	resetCastInput();
	clearFilters();
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading>Browse</Heading>

			<UForm
				ref="searchForm"
				:state="state"
				class="w-full"
				@submit="onExplicitSearch">
				<UFormField name="query" class="w-full">
					<UInput
						v-model="state.query"
						type="search"
						name="query"
						placeholder="Search by title, or leave empty to browse with filters below."
						aria-label="Search movies and shows"
						autocomplete="off"
						enterkeyhint="search"
						size="xl"
						:ui="{
							base: 'text-lg placeholder:italic [appearance:textfield]',
							trailing: 'pe-1',
						}"
						class="search-page-input w-full">
						<template #trailing>
							<div class="flex shrink-0 items-center gap-0.5">
								<UButton
									v-show="state.query !== ''"
									type="button"
									color="neutral"
									variant="ghost"
									icon="i-heroicons-x-mark-20-solid"
									size="sm"
									square
									aria-label="Clear search"
									@click="onClearQuery" />
								<UButton
									type="submit"
									color="primary"
									variant="ghost"
									icon="i-heroicons-magnifying-glass-20-solid"
									size="sm"
									square
									aria-label="Search"
									:ui="{ base: 'font-medium justify-center' }" />
							</div>
						</template>
					</UInput>
				</UFormField>

				<div
					v-if="recents.length > 0"
					class="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
					<p class="shrink-0 text-base font-medium text-fg-muted">
						Recent Searches
					</p>
					<button
						v-for="recent in visibleRecents"
						:key="recent"
						type="button"
						class="max-w-[120px] max-sm:min-w-10 min-w-16 shrink-0 cursor-pointer truncate rounded-md border border-border-default/50 bg-surface-inset px-1.5 py-1 text-base text-fg-muted transition-colors hover:border-border-default hover:bg-surface-hover hover:text-fg-default"
						:title="recent"
						@click="onSelectRecent(recent)">
						<span class="block truncate">{{ recent }}</span>
					</button>
				</div>
			</UForm>

			<div
				class="flex flex-col gap-4"
				:class="q ? 'opacity-60' : undefined"
				:aria-describedby="q ? 'browse-filter-hint' : undefined">
				<div class="flex flex-wrap items-center gap-4">
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
					<p v-if="castPeople.length > 1" class="w-full text-base text-fg-muted">
						{{ castHint }}
					</p>
					<UButton label="Clear all" variant="outline" size="lg" class="ml-auto sm:ml-0"
						@click="onClearFilters" />
				</div>
			</div>

			<p class="text-xl md:text-2xl">{{ subtitle }}</p>
			<p v-if="q" id="browse-filter-hint" class="text-base text-fg-muted">
				Movie and show filter applies after you clear search.
				<template v-if="filtersActive">
					Clear search to apply genre, year, cast, and rating filters.
				</template>
			</p>
		</div>

		<div class="flex flex-col items-stretch">
			<p v-if="statusMessage" class="text-xl md:text-2xl">{{ statusMessage }}</p>
			<div v-if="movies.length > 0" class="movie-grid">
				<MovieCard
					v-for="movie in movies"
					:key="`${movie.mediaType}-${movie.id}`"
					:movie="movie"
					:media-type="movie.mediaType"
					:show-media-type="mode === 'search'" />
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

<style scoped>
.search-page-input :deep(input) {

	&::-webkit-search-cancel-button,
	&::-webkit-search-decoration {
		display: none;
	}
}
</style>

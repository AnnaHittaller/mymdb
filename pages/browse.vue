<script setup lang="ts">
import { refDebounced, useWindowSize } from "@vueuse/core";
import { discoverFilterContent } from "~/constants/discoverFilterUi";
import {
	fetchPersonSuggestions,
	PERSON_SEARCH_DEBOUNCE_MS,
	PERSON_SEARCH_MIN_LENGTH,
} from "~/composables/usePersonSearch";
import {
	MOVIE_SEARCH_DEBOUNCE_MS,
	MOVIE_SEARCH_MIN_LENGTH,
} from "~/composables/useMovieSearch";
import { MAX_CATALOG_KEYWORD_PREFS } from "~/domain/user-document/catalogPrefs";
import {
	RECENT_SEARCHES_DESKTOP_DISPLAY,
	RECENT_SEARCHES_MOBILE_DISPLAY,
	useRecentSearches,
} from "~/composables/useRecentSearches";
import { searchQuerySchema } from "~/schemas/schemas";
import { DISCOVER_SORT_DEFAULT } from "~/constants/discoverFilters";

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

const { t, locale } = useI18n();
const { ratingItems, discoverSortItems } = useDiscoverFilterLabels();

const filterMenuControl = { highlightOnHover: true };
const filterFieldClass = "w-full min-w-0";
const browsePanelClass
	= "flex h-full w-full min-w-0 flex-col gap-4 rounded-[12px] border border-border-default bg-surface-overlay/70 p-4 transition-opacity";
const browseFilterGridClass
	= "grid w-full min-w-0 gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))]";
const browseChipClass
	= "rounded-md bg-surface-hover px-2 py-1 text-base text-fg-default transition-colors hover:bg-surface-inset";

const currentYear = new Date().getFullYear();
const yearChoices = Array.from({ length: currentYear - 1899 }, (_, index) => {
	const year = currentYear - index;
	return { label: String(year), value: year };
});
const yearFromItems = computed(() => [
	{ label: t("browse.fromAnyYear"), value: 0 },
	...yearChoices,
]);
const yearToItems = computed(() => [
	{ label: t("browse.toAnyYear"), value: 0 },
	...yearChoices,
]);

const catalogListing = useCatalogListing();

await catalogListing.ready;

const {
	q,
	mode,
	media,
	sort,
	rating,
	genreIds,
	releaseYearFrom,
	releaseYearTo,
	castPeople,
	keywordEntries,
	filtersActive,
	discoverDimmed,
	searchDimmed,
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
	addKeyword,
	removeKeyword,
	clearFilters,
} = catalogListing;

const { recents } = useRecentSearches();

const state = reactive({
	query: "",
});

const debouncedQuery = refDebounced(toRef(state, "query"), MOVIE_SEARCH_DEBOUNCE_MS);
const formRef = useTemplateRef("searchForm");
const { width: viewportWidth } = useWindowSize();
const afterHydration = ref(false);
onMounted(() => {
	afterHydration.value = true;
});
const isMobileChrome = computed(() => afterHydration.value && viewportWidth.value < 640);
const recentDisplayLimit = computed(() =>
	isMobileChrome.value ? RECENT_SEARCHES_MOBILE_DISPLAY : RECENT_SEARCHES_DESKTOP_DISPLAY,
);
const visibleRecents = computed(() => recents.value.slice(0, recentDisplayLimit.value));

const castSearchTerm = ref("");
const debouncedCastSearch = refDebounced(castSearchTerm, PERSON_SEARCH_DEBOUNCE_MS);
const castSuggestionItems = ref<CastMenuItem[]>([]);
const castInputKey = ref(0);
let castSearchAbort: AbortController | null = null;

const keywordExcludeIds = computed(() => keywordEntries.value.map((keyword) => keyword.id));
const {
	searchTerm: keywordSearchTerm,
	suggestions: keywordSuggestionItems,
	inputKey: keywordInputKey,
	resetKeywordInput,
} = useKeywordSuggestionInput(keywordExcludeIds);
const keywordPickerDisabled = computed(
	() => keywordEntries.value.length >= MAX_CATALOG_KEYWORD_PREFS,
);

const genreUrl = computed(() => (media.value === "tv" ? "/api/tv/genres" : "/api/movies/genres"));
const { data: genreList } = await useFetch<GenreList>(() => genreUrl.value, {
	query: computed(() => ({ language: locale.value })),
	watch: [genreUrl, locale],
});
const genreItems = computed(() =>
	(genreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
);
const genreNameById = computed(() => new Map(genreItems.value.map((genre) => [genre.value, genre.label])));

const subtitle = computed(() =>
	mode.value === "search"
		? t("browse.resultsFor", { query: q.value })
		: t("browse.popularSubtitle"),
);

const castHint = computed(() =>
	media.value === "tv" ? t("browse.castHintShows") : t("browse.castHintMovies"),
);

const sortLabelByValue = computed(
	() => new Map(discoverSortItems.value.map((item) => [item.value, item.label])),
);

const filterChips = computed<FilterChip[]>(() => {
	const chips: FilterChip[] = [];
	if (sort.value !== DISCOVER_SORT_DEFAULT) {
		const label = sortLabelByValue.value.get(sort.value) ?? sort.value;
		chips.push({
			id: "sort",
			label: t("browse.sortChip", { label }),
			removeLabel: t("browse.resetSort"),
		});
	}
	if (rating.value > 0) {
		chips.push({
			id: "rating",
			label: t("browse.ratingChip", { value: rating.value }),
			removeLabel: t("browse.removeRatingFilter"),
		});
	}
	for (const genreId of genreIds.value) {
		const name = genreNameById.value.get(genreId) ?? String(genreId);
		chips.push({
			id: `genre-${genreId}`,
			label: name,
			removeLabel: t("lists.removeGenre", { name }),
		});
	}
	if (releaseYearFrom.value > 0) {
		chips.push({
			id: "year-from",
			label: t("browse.fromChip", { year: releaseYearFrom.value }),
			removeLabel: t("browse.removeYearFrom"),
		});
	}
	if (releaseYearTo.value > 0) {
		chips.push({
			id: "year-to",
			label: t("browse.toChip", { year: releaseYearTo.value }),
			removeLabel: t("browse.removeYearTo"),
		});
	}
	for (const person of castPeople.value) {
		chips.push({
			id: `cast-${person.id}`,
			label: person.name,
			removeLabel: t("browse.removeCast", { name: person.name }),
		});
	}
	for (const keyword of keywordEntries.value) {
		chips.push({
			id: `keyword-${keyword.id}`,
			label: keyword.name,
			removeLabel: t("browse.removeKeywordName", { name: keyword.name }),
		});
	}
	return chips;
});

const awaitingResults = computed(
	() => movies.value.length === 0 && (pending.value || status.value === "idle"),
);

const statusMessage = computed(() => {
	if (awaitingResults.value) {
		return mode.value === "search" ? t("browse.loadingResults") : t("common.loading");
	}
	if (error.value && movies.value.length === 0) {
		return mode.value === "search" ? t("browse.loadSearchError") : t("browse.loadTitlesError");
	}
	if (movies.value.length === 0) {
		return mode.value === "search" ? t("lists.noMatchingResults") : t("browse.noFiltersMatch");
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
	resetKeywordInput();
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
			?? t("browse.minChars");
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
	if (chipId === "sort") {
		sort.value = DISCOVER_SORT_DEFAULT;
		return;
	}
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
		return;
	}
	if (chipId.startsWith("keyword-")) {
		const keywordId = Number(chipId.slice("keyword-".length));
		removeKeyword(keywordId);
	}
}

function onKeywordPick(value: number | undefined) {
	if (value == null) return;
	const item = keywordSuggestionItems.value.find((entry) => entry.value === value);
	if (!item?.label) {
		resetKeywordInput();
		return;
	}
	addKeyword({ id: value, name: item.label });
	resetKeywordInput();
}

function onClearFilters() {
	resetCastInput();
	resetKeywordInput();
	clearFilters();
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading>{{ $t('browse.title') }}</Heading>

			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
				<section
					:class="[browsePanelClass, searchDimmed ? 'opacity-60' : undefined]"
					aria-labelledby="browse-search-heading">
					<div
						id="browse-search-heading"
						class="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-fg-default">
						<UIcon name="i-heroicons-magnifying-glass-20-solid" class="size-5 shrink-0 text-primary" />
						{{ $t('browse.searchHeading') }}
					</div>
					<UForm
						ref="searchForm"
						:state="state"
						class="w-full"
						@submit="onExplicitSearch">
						<UFormField name="query" class="w-full">
							<CatalogSearchInput
								v-model="state.query"
								submit-on-trailing
								@clear="onClearQuery" />
						</UFormField>

						<div
							v-if="recents.length > 0"
							class="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
							<p class="shrink-0 text-base font-medium text-fg-muted">
								{{ $t('browse.recentSearches') }}
							</p>
							<button
								v-for="recent in visibleRecents"
								:key="recent"
								type="button"
								:class="[
									browseChipClass,
									'max-w-[120px] max-sm:min-w-10 min-w-16 shrink-0 cursor-pointer truncate text-fg-muted hover:text-fg-default',
								]"
								:title="recent"
								@click="onSelectRecent(recent)">
								<span class="block truncate">{{ recent }}</span>
							</button>
						</div>
					</UForm>
				</section>

				<section
					:class="[browsePanelClass, discoverDimmed ? 'opacity-60' : undefined]"
					aria-labelledby="browse-filter-heading"
					:aria-describedby="discoverDimmed ? 'browse-filter-hint' : undefined">
					<div
						id="browse-filter-heading"
						class="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-fg-default">
						<UIcon name="i-heroicons-funnel-20-solid" class="size-5 shrink-0 text-primary" />
						{{ $t('browse.discoverByFilter') }}
					</div>
					<p v-if="discoverDimmed" id="browse-filter-hint" class="sr-only">
						{{ $t('browse.clearSearchToUseFilters') }}
					</p>
					<div :class="browseFilterGridClass">
						<DiscoverMediaToggle v-model="media" class="min-w-0" />
						<USelect
							v-model="sort"
							:content="discoverFilterContent"
							:items="discoverSortItems"
							:class="filterFieldClass" />
						<USelect
							v-model="rating"
							:content="discoverFilterContent"
							:items="ratingItems"
							:class="filterFieldClass" />
						<USelectMenu
							v-model="genreIds"
							v-bind="filterMenuControl"
							:content="discoverFilterContent"
							:items="genreItems"
							value-key="value"
							multiple
							:placeholder="$t('common.anyGenres')"
							:class="filterFieldClass">
							<template #default>
								<span class="truncate text-fg-default">{{ $t('common.anyGenres') }}</span>
							</template>
						</USelectMenu>
						<USelect
							v-model="releaseYearFrom"
							:content="discoverFilterContent"
							:items="yearFromItems"
							:class="filterFieldClass" />
						<USelect
							v-model="releaseYearTo"
							:content="discoverFilterContent"
							:items="yearToItems"
							:class="filterFieldClass" />
						<UInputMenu
							:key="castInputKey"
							v-model:search-term="castSearchTerm"
							:model-value="undefined"
							:content="discoverFilterContent"
							v-bind="filterMenuControl"
							:items="castSuggestionItems"
							ignore-filter
							value-key="value"
							:placeholder="$t('browse.searchActors')"
							:class="filterFieldClass"
							@update:model-value="onCastPick" />
						<UInputMenu
							:key="keywordInputKey"
							v-model:search-term="keywordSearchTerm"
							:model-value="undefined"
							:content="discoverFilterContent"
							v-bind="filterMenuControl"
							:items="keywordSuggestionItems"
							ignore-filter
							value-key="value"
							:placeholder="$t('profile.searchKeywords')"
							:class="filterFieldClass"
							:disabled="keywordPickerDisabled"
							@update:model-value="onKeywordPick" />
					</div>
					<div v-if="filtersActive" class="flex flex-wrap items-center gap-2">
						<p class="w-full text-base font-medium text-fg-muted">
							{{ $t('lists.activeFilters') }}
						</p>
						<DiscoverFilterChip
							v-for="chip in filterChips"
							:key="chip.id"
							:label="chip.label"
							:remove-label="chip.removeLabel"
							@remove="removeFilterChip(chip.id)" />
						<p v-if="castPeople.length > 1" class="w-full text-base text-fg-muted">
							{{ castHint }}
						</p>
						<UButton
							:label="$t('common.clearAll')"
							variant="outline"
							size="lg"
							class="ml-auto sm:ml-0"
							@click="onClearFilters" />
					</div>
				</section>
			</div>

			<p class="text-xl md:text-2xl">{{ subtitle }}</p>
		</div>

		<div class="flex min-h-[2.75rem] flex-col items-stretch md:min-h-[3rem]">
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
				:label="$t('common.loadMore')"
				size="xl"
				class="mt-14 mb-8 self-center"
				:loading="pending && page > 1"
				:disabled="pending"
				@click="loadMore" />
		</div>
	</div>
</template>

<style scoped>
/* Scoped slot reserved for page-local overrides (search input styles live in CatalogSearchInput). */
</style>

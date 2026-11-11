<script setup lang="ts">
import { refDebounced, useWindowSize } from "@vueuse/core";
import type { SearchMovie } from "~/composables/useMovieSearch";
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

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const { recents, add: addRecentSearch } = useRecentSearches();

const q = computed(() => String(route.query.q ?? "").trim());

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

const page = ref(1);
const movies = ref<SearchMovie[]>([]);
const totalPages = ref(0);

watch(q, (next) => {
	if (state.query.trim() !== next) {
		state.query = next;
	}
}, { immediate: true });

watch(q, () => {
	page.value = 1;
	movies.value = [];
	totalPages.value = 0;
});

async function commitQuery(trimmed: string) {
	addRecentSearch(trimmed);
	await navigateTo({ path: "/search", query: { q: trimmed } }, { replace: true });
}

watch(debouncedQuery, (value) => {
	const trimmed = value.trim();
	if (trimmed.length >= MOVIE_SEARCH_MIN_LENGTH) {
		if (trimmed !== q.value) {
			void commitQuery(trimmed);
		}
		return;
	}
	if (trimmed.length === 0 && q.value) {
		void navigateTo({ path: "/search" }, { replace: true });
	}
});

watch(() => state.query, () => {
	formRef.value?.clear();
});

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
	await commitQuery(parsed.data.query.trim());
}

function onClearQuery() {
	state.query = "";
}

function onSelectRecent(query: string) {
	state.query = query;
	void commitQuery(query.trim());
}

const { data, status, error } = await useAsyncData(
	"movie-search-results",
	async () => {
		const requestedQ = q.value;
		if (!requestedQ) return null;
		const requestedPage = page.value;
		const response = await $fetch<{
			results: SearchMovie[]
			total_pages: number
		}>("/api/catalog/search", {
			query: {
				query: requestedQ,
				page: requestedPage,
			},
		});
		return {
			results: response.results,
			total_pages: response.total_pages,
			requestedPage,
			requestedQ,
		};
	},
	{ watch: [q, page] },
);

watch(data, (payload) => {
	if (!payload) {
		if (!q.value) {
			movies.value = [];
			totalPages.value = 0;
		}
		return;
	}
	if (payload.requestedQ !== q.value || payload.requestedPage !== page.value) return;

	const visible = payload.results.filter((movie) => movie.poster);
	totalPages.value = payload.total_pages;

	if (payload.requestedPage === 1) {
		movies.value = visible;
		return;
	}

	const seen = new Set(movies.value.map((movie) => `${movie.mediaType}-${movie.id}`));
	movies.value = [
		...movies.value,
		...visible.filter((movie) => !seen.has(`${movie.mediaType}-${movie.id}`)),
	];
}, { immediate: true });

const pending = computed(() => status.value === "pending");
const hasMore = computed(() => page.value < totalPages.value);

function loadMore() {
	if (pending.value || !hasMore.value) return;
	page.value += 1;
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading v-if="q">Results for “{{ q }}”</Heading>
			<Heading v-else>Search</Heading>

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
						placeholder="Search movies and shows..."
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
		</div>

		<div v-if="q" class="flex flex-col items-stretch">
			<p v-if="error && movies.length === 0" class="text-xl md:text-2xl">
				Couldn't load search results.
			</p>
			<p v-else-if="pending && movies.length === 0" class="text-xl md:text-2xl">
				Loading results…
			</p>
			<p v-else-if="movies.length === 0" class="text-xl md:text-2xl">
				No matching results can be found.
			</p>
			<div v-if="movies.length > 0" class="movie-grid">
				<MovieCard
					v-for="movie in movies"
					:key="`${movie.mediaType}-${movie.id}`"
					:movie="movie"
					:media-type="movie.mediaType"
					show-media-type />
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

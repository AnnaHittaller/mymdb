<script setup lang="ts">
import { refDebounced, useWindowSize } from "@vueuse/core";
import type { SearchMovie } from "~/composables/useMovieSearch";
import {
	fetchMovieSuggestions,
	MOVIE_SEARCH_DEBOUNCE_MS,
	MOVIE_SEARCH_MIN_LENGTH,
	SUGGESTION_DESKTOP_MAX,
	suggestionDisplayLimit,
} from "~/composables/useMovieSearch";

const user = useCurrentUser();
const route = useRoute();

const draft = ref("");
const debouncedDraft = refDebounced(draft, MOVIE_SEARCH_DEBOUNCE_MS);

const stripGridOpen = ref(false);
const stripBodyMounted = ref(false);
const suggestPending = ref(false);
const suggestions = ref<SearchMovie[]>([]);
const suggestForQuery = ref("");

let suggestAbort: AbortController | null = null;
let suggestRequestId = 0;

const { width: viewportWidth } = useWindowSize();

const suggestionLimit = computed(() => suggestionDisplayLimit(viewportWidth.value));

const isUnder380 = computed(() => viewportWidth.value < 380);

const displaySuggestions = computed(() =>
	suggestions.value.slice(0, suggestionLimit.value),
);

const hasResults = computed(() => displaySuggestions.value.length > 0);

const suggestStripId = "movie-search-suggestions";

const titleCardClass
	= "flex h-11 min-h-11 w-full min-w-0 cursor-pointer items-center justify-center rounded-md border border-fg-muted/35 bg-surface-inset px-2 py-1.5 text-center text-sm leading-tight text-fg-default transition-colors hover:border-primary hover:text-primary max-sm:text-base sm:rounded-md sm:text-xs";

const titleClampClass = "line-clamp-1";

function movieGridSpanClass(index: number): string {
	const count = displaySuggestions.value.length;
	const isLastOdd = count % 2 === 1 && index === count - 1;
	return isLastOdd ? "min-[380px]:max-sm:col-span-2" : "";
}

function openStrip() {
	if (!stripBodyMounted.value) {
		stripBodyMounted.value = true;
	}
	nextTick(() => {
		stripGridOpen.value = true;
	});
}

function finishStripClose() {
	stripBodyMounted.value = false;
	suggestions.value = [];
	suggestPending.value = false;
	suggestForQuery.value = "";
}

function closeStripAnimated() {
	if (!stripBodyMounted.value) return;
	stripGridOpen.value = false;
}

function closeStripInstant() {
	stripGridOpen.value = false;
	suggestAbort?.abort();
	finishStripClose();
}

function onStripTransitionEnd(event: TransitionEvent) {
	if (event.propertyName !== "grid-template-rows") return;
	if (!stripGridOpen.value) {
		finishStripClose();
	}
}

watch(
	() => route.fullPath,
	() => {
		closeStripInstant();
		if (route.path === "/search") {
			const q = route.query.q;
			if (typeof q === "string" && q.length > 0) {
				draft.value = q;
			}
			return;
		}
		draft.value = "";
	},
);

onMounted(() => {
	if (route.path === "/search" && typeof route.query.q === "string" && route.query.q) {
		draft.value = route.query.q;
	}
});

watch(draft, (value) => {
	if (value.trim().length < MOVIE_SEARCH_MIN_LENGTH) {
		suggestAbort?.abort();
		closeStripAnimated();
	}
});

watch(debouncedDraft, async (query) => {
	const trimmed = query.trim();
	if (trimmed.length < MOVIE_SEARCH_MIN_LENGTH) return;

	suggestAbort?.abort();
	const controller = new AbortController();
	suggestAbort = controller;
	const requestId = ++suggestRequestId;

	openStrip();
	suggestPending.value = true;
	suggestForQuery.value = trimmed;

	try {
		const results = await fetchMovieSuggestions(trimmed, {
			signal: controller.signal,
			limit: SUGGESTION_DESKTOP_MAX,
		});
		if (requestId !== suggestRequestId || controller.signal.aborted) return;
		if (trimmed !== debouncedDraft.value.trim()) return;
		suggestions.value = results;
	}
	catch (error) {
		if (controller.signal.aborted) return;
		console.error(error);
		if (trimmed === debouncedDraft.value.trim()) {
			suggestions.value = [];
		}
	}
	finally {
		if (requestId === suggestRequestId) {
			suggestPending.value = false;
		}
	}
});

function goToSearch() {
	const trimmed = draft.value.trim();
	if (!trimmed) return;
	closeStripAnimated();
	navigateTo({ path: "/search", query: { q: trimmed } });
}

function goToMovie(id: number) {
	closeStripAnimated();
	navigateTo(`/movie/${id}`);
}

function onClear() {
	draft.value = "";
	closeStripAnimated();
}

function onEscape() {
	closeStripAnimated();
}

function onInputKeydown(event: KeyboardEvent) {
	if (event.key === "Enter") {
		event.preventDefault();
		goToSearch();
	}
	if (event.key === "Escape") {
		event.preventDefault();
		onEscape();
	}
}
</script>

<template>
	<div v-if="user" class="w-full p-4">
		<div class="flex w-full flex-row items-center gap-2">
			<div class="min-w-0 flex-1">
				<UInput
					v-model="draft"
					type="text"
					name="global-search"
					placeholder="Search movies..."
					aria-label="Search movies"
					autocomplete="off"
					enterkeyhint="search"
					:aria-expanded="stripGridOpen"
					:aria-controls="suggestStripId"
					size="md"
					:ui="{
						base: 'text-sm placeholder:italic [appearance:textfield]',
						trailing: 'pe-1',
					}"
					class="global-search-input w-full"
					@keydown="onInputKeydown">
					<template #trailing>
						<div class="flex shrink-0 items-center gap-0.5">
							<UButton
								v-show="draft !== ''"
								color="neutral"
								variant="ghost"
								icon="i-heroicons-x-mark-20-solid"
								size="xs"
								square
								aria-label="Clear search"
								@click="onClear" />
							<UButton
								type="button"
								color="primary"
								variant="ghost"
								icon="i-heroicons-magnifying-glass-20-solid"
								size="md"
								square
								aria-label="Search"
								@click="goToSearch" />
						</div>
					</template>
				</UInput>
			</div>
			<NuxtLink to="/profile" class="shrink-0" aria-label="Profile">
				<UAvatar
					:alt="user.displayName ?? 'Profile'"
					size="md"
					class="border border-border-default" />
			</NuxtLink>
		</div>

		<div
			class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
			:class="stripGridOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
			@transitionend="onStripTransitionEnd">
			<div class="min-h-0 overflow-hidden">
				<div
					v-if="stripBodyMounted"
					:id="suggestStripId"
					role="region"
					aria-label="Search suggestions"
					class="pt-4"
					:class="{ 'opacity-80': suggestPending && hasResults }">
					<p v-if="suggestPending && !hasResults" class="text-sm text-fg-muted max-sm:text-base">
						Loading suggestions…
					</p>
					<div
						v-else-if="hasResults && isUnder380"
						class="flex w-full flex-col gap-1.5"
						role="list">
						<button
							v-for="movie in displaySuggestions"
							:key="movie.id"
							type="button"
							role="listitem"
							:class="titleCardClass"
							@click="goToMovie(movie.id)">
							<span :class="titleClampClass">{{ movie.title }}</span>
						</button>
						<UButton
							role="listitem"
							label="See all results"
							variant="outline"
							color="primary"
							block
							:ui="{ base: 'rounded-md' }"
							class="see-all-results mt-2 h-11 min-h-11 w-full text-base"
							@click="goToSearch" />
					</div>
					<div
						v-else-if="hasResults"
						class="grid min-[380px]:max-sm:grid-cols-2 gap-1.5 sm:flex sm:flex-nowrap sm:items-stretch sm:gap-1.5"
						role="list">
						<button
							v-for="(movie, index) in displaySuggestions"
							:key="movie.id"
							type="button"
							role="listitem"
							:class="[titleCardClass, movieGridSpanClass(index), 'sm:min-w-0 sm:flex-1']"
							@click="goToMovie(movie.id)">
							<span :class="titleClampClass">{{ movie.title }}</span>
						</button>
						<UButton
							role="listitem"
							label="See all results"
							variant="outline"
							color="primary"
							block
							:ui="{ base: 'rounded-md' }"
							class="see-all-results h-11 min-h-11 min-w-0 w-full max-sm:mt-2 max-sm:col-span-2 max-sm:justify-center max-sm:text-center max-sm:text-base sm:max-w-none sm:shrink-0 sm:flex-1 sm:text-xs"
							@click="goToSearch" />
					</div>
					<p
						v-else-if="!suggestPending && suggestForQuery === debouncedDraft.trim()"
						class="text-sm text-fg-muted max-sm:text-base">
						No quick matches for that title. Press Enter or the search button to search anyway.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.see-all-results {
	justify-content: center;
}

.global-search-input :deep(input) {

	&::-webkit-search-cancel-button,
	&::-webkit-search-decoration {
		display: none;
	}
}
</style>

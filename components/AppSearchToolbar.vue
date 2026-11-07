<script setup lang="ts">
import { refDebounced, useWindowSize } from "@vueuse/core";
import type { SearchMovie } from "~/composables/useMovieSearch";
import {
	fetchMovieSuggestions,
	MOVIE_SEARCH_DEBOUNCE_MS,
	MOVIE_SEARCH_MIN_LENGTH,
	SUGGESTION_MAX,
} from "~/composables/useMovieSearch";
import {
	RECENT_SEARCHES_DESKTOP_DISPLAY,
	RECENT_SEARCHES_MOBILE_DISPLAY,
} from "~/composables/useRecentSearches";

const user = useCurrentUser();
const route = useRoute();
const { recents, add: addRecentSearch } = useRecentSearches();
const searchFocused = ref(false);
const pointerInsideFlyout = ref(false);
const suppressPopoverToggle = ref(false);
const allowFlyoutAutoOpen = ref(false);
const searchAnchorRef = ref<HTMLElement | null>(null);

const draft = ref("");
const debouncedDraft = refDebounced(draft, MOVIE_SEARCH_DEBOUNCE_MS);

const flyoutOpen = ref(false);
const suggestPending = ref(false);
const suggestions = ref<SearchMovie[]>([]);
const suggestForQuery = ref("");

let suggestAbort: AbortController | null = null;
let suggestRequestId = 0;

const { width: viewportWidth } = useWindowSize();
const isMobileChrome = computed(() => viewportWidth.value < 640);

const suggestFlyoutId = "movie-search-suggestions";

const recentDisplayLimit = computed(() =>
	isMobileChrome.value ? RECENT_SEARCHES_MOBILE_DISPLAY : RECENT_SEARCHES_DESKTOP_DISPLAY,
);

const displayRecents = computed(() => recents.value.slice(0, recentDisplayLimit.value));

const trimmedDraft = computed(() => draft.value.trim());
const queryLongEnough = computed(() => trimmedDraft.value.length >= MOVIE_SEARCH_MIN_LENGTH);

const displayMovies = computed(() => suggestions.value.slice(0, SUGGESTION_MAX));

const showNoMatches = computed(
	() =>
		!suggestPending.value
		&& suggestForQuery.value === debouncedDraft.value.trim()
		&& queryLongEnough.value
		&& displayMovies.value.length === 0,
);

const showMoviesSection = computed(() => queryLongEnough.value);

const flyoutHasBody = computed(
	() =>
		displayRecents.value.length > 0
		|| (queryLongEnough.value
			&& (suggestPending.value || displayMovies.value.length > 0 || showNoMatches.value)),
);

const popoverOpen = computed(() => flyoutOpen.value && flyoutHasBody.value);

const popoverContentUi
	= "w-(--reka-popover-trigger-width) max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-xl border border-fg-muted/25 bg-surface-inset p-0 shadow-surface-sidebar ring-0 data-[state=closed]:pointer-events-none data-[state=open]:animate-search-flyout-open! data-[state=closed]:animate-search-flyout-close!";

function openFlyoutWhenAllowed() {
	if (!allowFlyoutAutoOpen.value) return;
	if (flyoutHasBody.value) {
		flyoutOpen.value = true;
	}
}

function enableFlyoutForUser() {
	allowFlyoutAutoOpen.value = true;
}

function onPopoverOpenChange(next: boolean) {
	if (next) {
		flyoutOpen.value = flyoutHasBody.value;
		return;
	}
	if (suppressPopoverToggle.value && flyoutHasBody.value) {
		flyoutOpen.value = true;
		return;
	}
	if (allowFlyoutAutoOpen.value && searchFocused.value && flyoutHasBody.value) {
		flyoutOpen.value = true;
		return;
	}
	if (pointerInsideFlyout.value && flyoutHasBody.value) {
		flyoutOpen.value = true;
		return;
	}
	flyoutOpen.value = false;
}

function onFlyoutPointerEnter() {
	pointerInsideFlyout.value = true;
}

function onFlyoutPointerLeave() {
	pointerInsideFlyout.value = false;
}

watch([draft, displayRecents, queryLongEnough, suggestPending, displayMovies, showNoMatches], () => {
	if (!flyoutHasBody.value) {
		flyoutOpen.value = false;
	}
});

function resetSuggestions() {
	suggestAbort?.abort();
	suggestions.value = [];
	suggestPending.value = false;
	suggestForQuery.value = "";
}

function closeFlyout({ resetSuggestions: clearSuggestions = false }: { resetSuggestions?: boolean } = {}) {
	flyoutOpen.value = false;
	if (clearSuggestions) {
		resetSuggestions();
	}
}

function dismissFlyoutAfterNavigate() {
	flyoutOpen.value = false;
	pointerInsideFlyout.value = false;
	searchFocused.value = false;
	allowFlyoutAutoOpen.value = false;
	suggestAbort?.abort();
	suggestPending.value = false;
}

async function navigateAfterFlyoutDismiss(
	target: string | { path: string, query?: Record<string, string> },
) {
	const wasOpen = flyoutOpen.value;
	dismissFlyoutAfterNavigate();
	await nextTick();
	if (wasOpen) {
		await new Promise((resolve) => window.setTimeout(resolve, 130));
	}
	await navigateTo(target);
}

watch(
	() => route.fullPath,
	() => {
		dismissFlyoutAfterNavigate();
		if (route.path === "/search") {
			const q = route.query.q;
			if (typeof q === "string" && q.length > 0) {
				draft.value = q;
			}
			return;
		}
		draft.value = "";
		closeFlyout({ resetSuggestions: true });
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
		suggestions.value = [];
		suggestPending.value = false;
		suggestForQuery.value = "";
		return;
	}
	enableFlyoutForUser();
});

async function loadSuggestions(trimmed: string) {
	if (trimmed.length < MOVIE_SEARCH_MIN_LENGTH) return;

	suggestAbort?.abort();
	const controller = new AbortController();
	suggestAbort = controller;
	const requestId = ++suggestRequestId;

	if (allowFlyoutAutoOpen.value && searchFocused.value) {
		flyoutOpen.value = true;
	}
	suggestPending.value = true;
	suggestForQuery.value = trimmed;

	try {
		const results = await fetchMovieSuggestions(trimmed, {
			signal: controller.signal,
			limit: SUGGESTION_MAX,
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
}

function refreshSuggestionsIfNeeded() {
	const trimmed = trimmedDraft.value;
	if (trimmed.length < MOVIE_SEARCH_MIN_LENGTH) return;
	if (suggestPending.value) return;
	if (suggestForQuery.value === trimmed && suggestions.value.length > 0) return;
	if (suggestForQuery.value === trimmed && showNoMatches.value) return;
	void loadSuggestions(trimmed);
}

watch(debouncedDraft, (query) => {
	void loadSuggestions(query.trim());
});

function goToSearch() {
	const trimmed = draft.value.trim();
	if (!trimmed) return;
	addRecentSearch(trimmed);
	void navigateAfterFlyoutDismiss({ path: "/search", query: { q: trimmed } });
}

function goToMovie(id: number) {
	void navigateAfterFlyoutDismiss(`/movie/${id}`);
}

function onSelectRecent(query: string) {
	draft.value = query;
	goToSearch();
}

function onClear() {
	draft.value = "";
	allowFlyoutAutoOpen.value = false;
	flyoutOpen.value = false;
}

function onInputFocus() {
	searchFocused.value = true;
	enableFlyoutForUser();
	openFlyoutWhenAllowed();
	refreshSuggestionsIfNeeded();
}

function onSearchAnchorPointerDown(event: PointerEvent) {
	if ((event.target as HTMLElement).closest("button")) return;

	suppressPopoverToggle.value = true;
	enableFlyoutForUser();
	const input = searchAnchorRef.value?.querySelector("input");
	if (input && document.activeElement !== input) {
		input.focus({ preventScroll: true });
	}

	openFlyoutWhenAllowed();
	refreshSuggestionsIfNeeded();

	nextTick(() => {
		suppressPopoverToggle.value = false;
	});
}

function onInputBlur() {
	window.setTimeout(() => {
		const active = document.activeElement;
		const inSearch = active?.closest(".global-search-input") != null;
		const inFlyout = active?.closest(`#${suggestFlyoutId}`) != null;
		searchFocused.value = inSearch;
		if (!inSearch && !inFlyout && !pointerInsideFlyout.value) {
			flyoutOpen.value = false;
		}
	}, 0);
}

function onInputKeydown(event: KeyboardEvent) {
	if (event.key === "Enter") {
		event.preventDefault();
		goToSearch();
	}
	if (event.key === "Escape") {
		event.preventDefault();
		closeFlyout();
	}
}
</script>

<template>
	<div v-if="user" class="w-full p-4">
		<div class="flex w-full flex-row items-center gap-2">
			<div class="relative z-50 min-w-0 flex-1">
				<UPopover
					:open="popoverOpen"
					:portal="false"
					:content="{ side: 'bottom', align: 'start', sideOffset: 8 }"
					:ui="{ content: popoverContentUi }"
					@update:open="onPopoverOpenChange">
					<template #anchor>
						<div
							ref="searchAnchorRef"
							class="w-full"
							@pointerdown="onSearchAnchorPointerDown">
							<UInput
								v-model="draft"
								type="text"
								name="global-search"
								placeholder="Search movies..."
								aria-label="Search movies"
								autocomplete="off"
								enterkeyhint="search"
								:aria-expanded="popoverOpen"
								:aria-controls="suggestFlyoutId"
								:size="isMobileChrome ? 'lg' : 'md'"
								:ui="{
									base: 'text-sm placeholder:italic [appearance:textfield] max-sm:text-base',
									trailing: 'pe-1 max-sm:pe-1.5',
								}"
								class="global-search-input w-full"
								@focus="onInputFocus"
								@blur="onInputBlur"
								@keydown="onInputKeydown">
								<template #trailing>
									<div class="flex shrink-0 items-center gap-0.5">
										<UButton
											v-show="draft !== ''"
											color="neutral"
											variant="ghost"
											icon="i-heroicons-x-mark-20-solid"
											:size="isMobileChrome ? 'sm' : 'xs'"
											square
											aria-label="Clear search"
											@click="onClear" />
										<UButton
											type="button"
											color="primary"
											variant="ghost"
											icon="i-heroicons-magnifying-glass-20-solid"
											:size="isMobileChrome ? 'sm' : 'xs'"
											:ui="{ base: 'font-medium justify-center' }"
											square
											aria-label="Search"
											@click="goToSearch" />
									</div>
								</template>
							</UInput>
						</div>
					</template>

					<template #content>
						<SearchSuggestionsFlyout
							:flyout-id="suggestFlyoutId"
							:recents="displayRecents"
							:movies="displayMovies"
							:suggest-pending="suggestPending"
							:show-no-matches="showNoMatches"
							:show-movies-section="showMoviesSection"
							:class="{ 'opacity-90': suggestPending && displayMovies.length > 0 }"
							@pointerenter="onFlyoutPointerEnter"
							@pointerleave="onFlyoutPointerLeave"
							@select-recent="onSelectRecent"
							@select-movie="goToMovie"
							@see-all="goToSearch" />
					</template>
				</UPopover>
			</div>
			<NuxtLink to="/profile" class="shrink-0" aria-label="Profile">
				<UAvatar
					:alt="user.displayName ?? 'Profile'"
					:size="isMobileChrome ? 'lg' : 'md'"
					class="border border-border-default" />
			</NuxtLink>
		</div>
	</div>
</template>

<style scoped>
.global-search-input :deep(input) {

	&::-webkit-search-cancel-button,
	&::-webkit-search-decoration {
		display: none;
	}
}
</style>

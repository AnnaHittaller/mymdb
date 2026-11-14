<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { discoverFilterContent } from "~/constants/discoverFilterUi";
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import { MOVIE_SEARCH_DEBOUNCE_MS } from "~/composables/useMovieSearch";
import type { UserList } from "~/types/list";
import type { UserMovie } from "~/types/movie";
import { mergeGenreNames } from "~/utils/filterLibraryMovies";
import { defaultMediaType } from "~/utils/catalogKey";

const props = defineProps<{
	list: UserList;
}>();

const { moviesInList, renameList, deleteList, removeFromList } = useUserDocument();
const router = useRouter();
const { isOffline } = useOfflineReady();

const filterMenuControl = { highlightOnHover: true };
const filterFieldClass = "w-full min-w-0";
const listFilterGridClass
	= "grid w-full min-w-0 gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))]";

type GenreList = {
	genres: { id: number; name: string }[];
};

const editing = ref(false);
const draftName = ref("");
const deleteConfirmOpen = ref(false);
const deleting = ref(false);
const shareOpen = ref(false);

const listMovies = computed(() => moviesInList(props.list.id));
const { state: filterState, filteredMovies, filtersActive, clearFilters } = useLibraryListFilters(
	listMovies,
);

const searchTerm = ref("");
const debouncedSearchTerm = refDebounced(searchTerm, MOVIE_SEARCH_DEBOUNCE_MS);

watch(debouncedSearchTerm, (value) => {
	filterState.titleQuery = value;
}, { immediate: true });

const { data: movieGenreList } = await useFetch<GenreList>("/api/movies/genres", {
	key: "list-movie-genres",
});
const { data: tvGenreList } = await useFetch<GenreList>("/api/tv/genres", {
	key: "list-tv-genres",
});

const mergedGenreNames = computed(() =>
	mergeGenreNames(
		movieGenreList.value?.genres ?? [],
		tvGenreList.value?.genres ?? [],
	),
);

const genreItems = computed(() =>
	mergedGenreNames.value.map((name) => ({ label: name, value: name })),
);

const displayTitle = computed(() => props.list.name);

const countLabel = computed(() => {
	const n = listMovies.value.length;
	return n === 1 ? "1 title" : `${n} titles`;
});

const showingLabel = computed(() => {
	if (!filtersActive.value) return "";
	const n = filteredMovies.value.length;
	return n === 1 ? "Showing 1 title" : `Showing ${n} titles`;
});

type FilterChip = {
	id: string;
	label: string;
	removeLabel: string;
};

const filterChips = computed<FilterChip[]>(() => {
	const chips: FilterChip[] = [];
	const title = filterState.titleQuery.trim();
	if (title) {
		chips.push({
			id: "title",
			label: `Title: «${title}»`,
			removeLabel: "Clear title filter",
		});
	}
	if (filterState.media !== "all") {
		const label = filterState.media === "tv" ? "Shows" : "Movies";
		chips.push({
			id: "media",
			label,
			removeLabel: `Show all movies and shows`,
		});
	}
	for (const name of filterState.genreNames) {
		chips.push({
			id: `genre-${name}`,
			label: name,
			removeLabel: `Remove genre ${name}`,
		});
	}
	return chips;
});

watch(
	() => props.list.name,
	(name) => {
		draftName.value = name;
	},
	{ immediate: true },
);

function startEdit() {
	editing.value = true;
	draftName.value = props.list.name;
}

function doneEdit() {
	editing.value = false;
}

async function commitRename() {
	if (!props.list.renamable) return;
	const trimmed = draftName.value.trim();
	if (trimmed && trimmed !== props.list.name) {
		await renameList(props.list.id, trimmed);
	}
	doneEdit();
}

async function confirmDeleteList() {
	if (props.list.kind === "system") return;
	deleting.value = true;
	try {
		await deleteList(props.list.id);
		deleteConfirmOpen.value = false;
		await router.push("/lists");
	} finally {
		deleting.value = false;
	}
}

async function removeMovie(movie: UserMovie) {
	await removeFromList(props.list.id, movie.id, defaultMediaType(movie.mediaType));
}

function onClearSearch() {
	searchTerm.value = "";
}

function removeFilterChip(chipId: string) {
	if (chipId === "title") {
		searchTerm.value = "";
		return;
	}
	if (chipId === "media") {
		filterState.media = "all";
		return;
	}
	if (chipId.startsWith("genre-")) {
		const name = chipId.slice("genre-".length);
		filterState.genreNames = filterState.genreNames.filter((genre) => genre !== name);
	}
}

function onClearFilters() {
	searchTerm.value = "";
	clearFilters();
}
</script>

<template>
	<div class="min-w-0 max-w-full">
		<div class="flex flex-col gap-1 max-md:gap-0">
			<StackBackButton />
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
				<Heading v-if="!editing || !list.renamable" class="min-w-0">
					<span>{{ displayTitle }}</span>
					<span class="ml-2 text-xl font-normal text-fg-muted">[{{ countLabel }}]</span>
				</Heading>
				<UInput
					v-else
					v-model="draftName"
					size="xl"
					class="min-w-48 flex-1"
					:maxlength="60"
					@keydown.enter.prevent="commitRename" />
			</div>
			<div class="flex shrink-0 flex-wrap items-center gap-2">
				<UButton
					v-if="!editing"
					variant="outline"
					size="lg"
					label="Share"
					icon="i-heroicons-share"
					:disabled="isOffline"
					@click="shareOpen = true" />
				<UButton
					v-if="!editing"
					variant="outline"
					size="lg"
					label="Edit list"
					icon="i-heroicons-pencil-square"
					:disabled="isOffline"
					@click="startEdit" />
				<template v-else>
					<UButton variant="outline" size="lg" label="Done" @click="list.renamable ? commitRename() : doneEdit()" />
					<UButton
						v-if="list.kind === 'custom'"
						color="error"
						variant="outline"
						size="lg"
						label="Delete list"
						@click="deleteConfirmOpen = true" />
				</template>
			</div>
		</div>
		</div>
		<CatalogSearchInput
			v-model="searchTerm"
			placeholder="Filter by title"
			aria-label="Filter list by title"
			name="list-title-filter"
			trailing-icon="i-heroicons-funnel-20-solid"
			trailing-icon-label="Filter"
			class="mb-4"
			@clear="onClearSearch" />
		<div :class="[listFilterGridClass, 'mb-10']">
			<LibraryMediaToggle v-model="filterState.media" class="min-w-0" />
			<USelectMenu
				v-model="filterState.genreNames"
				v-bind="filterMenuControl"
				:content="discoverFilterContent"
				:items="genreItems"
				value-key="value"
				multiple
				placeholder="Any Genres"
				:class="filterFieldClass">
				<template #default>
					<span class="truncate text-fg-default">Any Genres</span>
				</template>
			</USelectMenu>
			<div
				class="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-[8px] border border-border-default bg-surface-inset px-3 py-2">
				<span class="text-base font-medium text-fg-default">Best rating first</span>
				<USwitch
					v-model="filterState.sortByBestRating"
					aria-label="Sort by best rating" />
			</div>
		</div>
		<div v-if="filtersActive" class="mb-6 flex flex-wrap items-center gap-2">
			<p class="w-full text-base font-medium text-fg-muted">
				Active filters
			</p>
			<DiscoverFilterChip
				v-for="chip in filterChips"
				:key="chip.id"
				:label="chip.label"
				:remove-label="chip.removeLabel"
				@remove="removeFilterChip(chip.id)" />
			<UButton
				label="Clear all"
				variant="outline"
				size="lg"
				class="ml-auto sm:ml-0"
				@click="onClearFilters" />
		</div>
		<div class="flex flex-col items-stretch">
			<p v-if="showingLabel" class="mb-2 text-base text-fg-muted">
				{{ showingLabel }}
			</p>
			<Heading v-if="debouncedSearchTerm.trim() !== ''">Results</Heading>
			<p v-if="filtersActive && filteredMovies.length === 0" class="text-xl md:text-2xl">
				No matching results can be found.
			</p>
			<p v-if="listMovies.length === 0" class="text-xl md:text-2xl">This list is empty.</p>
			<div v-if="filteredMovies.length > 0" class="movie-grid">
				<MovieCard
					v-for="movie in filteredMovies"
					:key="`${defaultMediaType(movie.mediaType)}-${movie.id}`"
					:movie="movie"
					:media-type="defaultMediaType(movie.mediaType)"
					:list-id="list.id"
					:editing="editing"
					show-media-type
					@remove-from-list="removeMovie(movie)" />
			</div>
		</div>
		<ShareListModal v-model:open="shareOpen" :list-id="list.id" :list-name="list.name" />
		<UModal v-model:open="deleteConfirmOpen" title="Delete this list?" :ui="browsingModalUi">
			<template #body>
				<p class="text-base text-fg-muted">
					Titles stay in your library if they are on other lists. This cannot be undone.
				</p>
			</template>
			<template #footer>
				<div class="flex w-full justify-end gap-2">
					<UButton variant="outline" size="lg" label="Cancel" @click="deleteConfirmOpen = false" />
					<UButton color="error" size="lg" label="Delete" :loading="deleting" @click="confirmDeleteList" />
				</div>
			</template>
		</UModal>
	</div>
</template>
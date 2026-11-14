<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import type { UserList } from "~/types/list";
import type { UserMovie } from "~/types/movie";
import { defaultMediaType } from "~/utils/catalogKey";

const props = defineProps<{
	list: UserList;
}>();

const { moviesInList, renameList, deleteList, removeFromList } = useUserDocument();
const router = useRouter();

const editing = ref(false);
const draftName = ref("");
const searchTerm = ref("");
const debouncedSearchTerm = refDebounced(searchTerm, 700);
const deleteConfirmOpen = ref(false);
const deleting = ref(false);

const listMovies = computed(() => moviesInList(props.list.id));

const filteredMovies = computed(() => {
	const term = debouncedSearchTerm.value.toLowerCase();
	return listMovies.value.filter((movie: UserMovie) => movie.title.toLowerCase().includes(term));
});

const displayTitle = computed(() => props.list.name);

const countLabel = computed(() => {
	const n = listMovies.value.length;
	return n === 1 ? "1 title" : `${n} titles`;
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
					label="Edit list"
					icon="i-heroicons-pencil-square"
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
		<UInput
			size="xl"
			placeholder="Filter for title..."
			v-model="searchTerm"
			name="search"
			:ui="{ base: 'text-xl placeholder:italic', trailing: 'pointer-events-none' }"
			class="relative mb-8 w-full">
			<template #trailing>
				<UButton
					v-show="searchTerm !== ''"
					color="neutral"
					variant="link"
					icon="i-heroicons-x-mark-20-solid"
					square
					class="pointer-events-auto pr-10"
					@click="searchTerm = ''" />
				<div
					class="search-btn absolute right-0 top-0 flex h-full items-center justify-center rounded-r-md bg-primary">
					<UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-xl text-fg-on-accent" />
				</div>
			</template>
		</UInput>
		<div class="flex flex-col items-stretch">
			<Heading v-if="debouncedSearchTerm !== ''">Results</Heading>
			<p v-if="debouncedSearchTerm !== '' && filteredMovies.length === 0" class="text-xl md:text-2xl">
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

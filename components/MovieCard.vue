<script setup lang="ts">
import type { CatalogUpdate } from "~/domain/user-document/createUserDocument";
import type { MediaType } from "~/types/catalog";
import { POSTER_IMAGE_URL } from "~/constants/movie";
import { catalogKey, defaultMediaType } from "~/utils/catalogKey";
import { catalogDetailPath } from "~/utils/catalogPath";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";

type MovieCardMovie = {
	id: number | string;
	mediaType?: MediaType;
	title: string;
	poster?: string | null;
	poster_path?: string | null;
	rating?: number;
	vote_average?: number;
	genres?: string[] | { name: string }[];
};

function genreNamesFrom(movie: MovieCardMovie): string[] {
	const genres = movie.genres;
	if (!genres?.length) return [];
	if (typeof genres[0] === "string") return genres as string[];
	if (typeof genres[0] === "object" && genres[0] && "name" in genres[0]) {
		return (genres as { name: string }[]).map((genre) => genre.name);
	}
	return [];
}

const props = withDefaults(
	defineProps<{
		movie: MovieCardMovie;
		mediaType?: MediaType;
		showMediaType?: boolean;
		listId?: string;
		editing?: boolean;
		highlighted?: boolean;
	}>(),
	{ showMediaType: false, editing: false, highlighted: false },
);

const emit = defineEmits<{
	"remove-from-list": [];
}>();

const user = useCurrentUser();
const { isOnAnyList, isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();
const { shareCatalogTitle } = useCatalogShare();

const pickerOpen = ref(false);

const movieId = computed(() => String(props.movie.id));

const resolvedMediaType = computed((): MediaType =>
	defaultMediaType(props.mediaType ?? props.movie.mediaType),
);

const detailPath = computed(() => catalogDetailPath(movieId.value, resolvedMediaType.value));

const posterPath = computed(() => props.movie.poster || props.movie.poster_path || "");

const ratingLabel = computed(() =>
	formatMovieRating(props.movie.rating ?? props.movie.vote_average),
);

const resolvedGenres = ref<string[]>([]);

const genreLabel = computed(() => {
	const fromProps = genreNamesFrom(props.movie);
	if (fromProps.length) return fromProps.join(" · ");
	if (resolvedGenres.value.length) return resolvedGenres.value.join(" · ");
	return "";
});

watch(
	() => [props.movie.genres, movieId.value, resolvedMediaType.value] as const,
	async ([genres, id, mediaType]) => {
		if (genreNamesFrom({ ...props.movie, genres }).length) {
			resolvedGenres.value = [];
			return;
		}
		if (!/^\d+$/.test(id)) {
			resolvedGenres.value = [];
			return;
		}
		try {
			const summaries = await $fetch<CatalogUpdate[]>("/api/catalog/summaries", {
				query: { entries: catalogKey(id, mediaType) },
			});
			resolvedGenres.value = summaries[0]?.genres ?? [];
		} catch {
			resolvedGenres.value = [];
		}
	},
	{ immediate: true },
);

const moviePayload = computed(() => {
	const genres = genreNamesFrom(props.movie);
	const fromResolved = resolvedGenres.value;
	return togglePayloadFromCatalog(
		props.movie,
		resolvedMediaType.value,
		genres.length ? genres : fromResolved.length ? fromResolved : undefined,
	);
});

const onAnyList = computed(() => isOnAnyList(movieId.value, resolvedMediaType.value));
const inFavorites = computed(() => isInFavorites(movieId.value, resolvedMediaType.value));

const bookmarkClass = computed(() =>
	onAnyList.value
		? "text-primary hover:text-primary/75"
		: "text-fg-subtle hover:text-primary",
);

async function toggleFavorites() {
	try {
		await setFavorites(moviePayload.value, !inFavorites.value);
	} catch (error) {
		notifyListError(error);
	}
}

async function onShare() {
	await shareCatalogTitle({
		id: movieId.value,
		mediaType: resolvedMediaType.value,
		title: props.movie.title,
	});
}
</script>

<template>
	<article
		class="flex w-full flex-col gap-2 rounded-[12px] border border-border-default bg-surface-overlay p-3 backdrop-blur-md"
		:class="highlighted ? 'ring-2 ring-primary' : undefined">
		<NuxtLink :to="detailPath" class="relative block">
			<img
				v-if="posterPath"
				:src="`${POSTER_IMAGE_URL}${posterPath}`"
				:alt="movie.title"
				width="342"
				height="513"
				loading="lazy"
				decoding="async"
				class="aspect-2/3 w-full rounded-lg object-cover">
			<CatalogMediaBadge v-if="showMediaType" overlay :media-type="resolvedMediaType" />
			<div
				class="absolute right-1.5 top-1.5 inline-flex items-center justify-center gap-0.5 rounded bg-surface-overlay/50 px-1.5 py-0.5 text-fg-default backdrop-blur-sm">
				<UIcon name="i-heroicons-star-20-solid" class="block size-4 shrink-0 -translate-y-[2px] text-rating" />
				<span class="text-sm leading-none tabular-nums">{{ ratingLabel }}</span>
			</div>
		</NuxtLink>
		<div class="flex min-w-0 flex-col gap-0.5">
			<NuxtLink :to="detailPath" class="line-clamp-1 text-base font-medium leading-tight text-fg-default">
				{{ movie.title }}
			</NuxtLink>
			<p v-if="genreLabel" class="line-clamp-1 text-sm leading-tight text-fg-muted">
				{{ genreLabel }}
			</p>
		</div>
		<div
			v-if="user || !editing"
			class="flex h-6 max-h-6 min-h-6 w-full shrink-0 flex-nowrap items-center gap-3 transition-colors duration-200">
			<template v-if="user && !editing">
				<button
					type="button"
					class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200"
					:class="bookmarkClass"
					aria-label="Save to list"
					@click="pickerOpen = true">
					<IconAddToList class="size-6" />
				</button>
				<button
					type="button"
					class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
					:aria-label="inFavorites ? 'Remove from favorites' : 'Add to favorites'"
					@click="toggleFavorites">
					<UIcon
						:name="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
						:class="inFavorites ? 'size-6 text-primary' : 'size-6 text-fg-subtle hover:text-primary'" />
				</button>
			</template>
			<button
				v-if="!editing"
				type="button"
				class="ml-auto flex h-6 cursor-pointer items-center leading-none text-fg-subtle transition-colors duration-200 hover:text-primary"
				aria-label="Share"
				@click="onShare">
				<UIcon name="i-heroicons-share" class="size-6" />
			</button>
			<button
				v-if="editing && listId"
				type="button"
				class="ml-auto flex h-6 cursor-pointer items-center leading-none text-fg-subtle transition-colors duration-200 hover:text-primary"
				aria-label="Remove from this list"
				@click="emit('remove-from-list')">
				<UIcon name="i-heroicons-x-circle" class="size-6" />
			</button>
		</div>
		<ListPickerOverlay v-model:open="pickerOpen" :movie-payload="moviePayload" />
	</article>
</template>

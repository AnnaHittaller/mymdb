<script setup lang="ts">
import type { CatalogUpdate } from "~/domain/user-document/createUserDocument";
import type { MediaType } from "~/types/catalog";
import { POSTER_IMAGE_URL } from "~/constants/movie";
import { catalogKey, defaultMediaType } from "~/utils/catalogKey";
import { catalogDetailPath } from "~/utils/catalogPath";
import { formatMovieRating } from "~/utils/formatMovieRating";

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
		/** When true, show movie vs show badge on the poster (mixed grids only). */
		showMediaType?: boolean;
	}>(),
	{ mediaType: "movie", showMediaType: false },
);

const user = useCurrentUser();
const { movies, isInList, add, remove, setNext } = useUserDocument();

const movieId = computed(() => String(props.movie.id));

const resolvedMediaType = computed((): MediaType =>
	defaultMediaType(props.movie.mediaType ?? props.mediaType),
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

const isInMovieList = computed(() => isInList(movieId.value, resolvedMediaType.value));

const isInNextList = computed(() =>
	movies.value.some(
		(entry) =>
			entry.id === movieId.value
			&& defaultMediaType(entry.mediaType) === resolvedMediaType.value
			&& entry.next,
	),
);

async function addToList() {
	const m = props.movie;
	const genres = genreNamesFrom(m);
	const fromResolved = resolvedGenres.value;
	await add({
		id: movieId.value,
		mediaType: resolvedMediaType.value,
		title: m.title,
		rating: m.rating ?? m.vote_average ?? 0,
		poster: posterPath.value,
		...(genres.length ? { genres } : fromResolved.length ? { genres: fromResolved } : {}),
		seen: false,
		next: false,
		timestamp: new Date(),
	});
}

async function removeFromList() {
	await remove(movieId.value, resolvedMediaType.value);
}

async function toggleWatchNext() {
	await setNext(movieId.value, !isInNextList.value, resolvedMediaType.value);
}
</script>

<template>
	<article
		class="flex w-full flex-col gap-2 rounded-[12px] border border-border-default bg-surface-overlay p-3 backdrop-blur-md">
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
			<CatalogMediaBadge
				v-if="showMediaType"
				overlay
				:media-type="resolvedMediaType" />
			<div
				class="absolute right-1.5 top-1.5 inline-flex items-center justify-center gap-0.5 rounded bg-surface-overlay/50 px-1.5 py-0.5 text-fg-default backdrop-blur-sm">
				<UIcon
					name="i-heroicons-star-20-solid"
					class=" block size-3 shrink-0 text-rating" />
				<span class="text-xs leading-none mt-0.5 tabular-nums">{{ ratingLabel }}</span>
			</div>
		</NuxtLink>
		<div class="flex min-w-0 flex-col gap-0.5">
			<NuxtLink :to="detailPath" class="line-clamp-1 text-sm font-medium leading-tight text-fg-default">
				{{ movie.title }}
			</NuxtLink>
			<p v-if="genreLabel" class="line-clamp-1 text-xs leading-tight text-fg-muted">
				{{ genreLabel }}
			</p>
		</div>
		<div v-if="user" class="flex h-6 max-h-6 min-h-6 shrink-0 flex-nowrap items-center gap-3 text-fg-subtle">
			<button
				v-if="!isInMovieList"
				type="button"
				class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
				aria-label="Add to my list"
				@click="addToList">
				<IconAddToList class="size-6" />
			</button>
			<button
				v-else
				type="button"
				class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
				aria-label="Remove from watchlist"
				@click="removeFromList">
				<UIcon name="i-heroicons-x-circle" class="size-6" />
			</button>
			<button
				v-if="isInMovieList"
				type="button"
				class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
				:aria-label="isInNextList ? 'Remove from favorites' : 'Add to favorites'"
				@click="toggleWatchNext">
				<UIcon :name="isInNextList ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="size-6" />
			</button>
		</div>
	</article>
</template>

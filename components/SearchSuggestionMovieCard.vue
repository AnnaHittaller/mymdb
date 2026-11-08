<script setup lang="ts">
import { POSTER_SUGGESTION_IMAGE_URL } from "~/constants/movie";
import type { SearchMovie } from "~/composables/useMovieSearch";
import { formatMovieRating } from "~/utils/formatMovieRating";

const props = defineProps<{
	movie: SearchMovie;
}>();

const emit = defineEmits<{
	select: [];
}>();

const ratingLabel = computed(() => formatMovieRating(props.movie.rating));

const yearLabel = computed(() => {
	const year = props.movie.releaseYear;
	return year != null ? String(year) : null;
});
</script>

<template>
	<button
		type="button"
		class="flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border border-border-default bg-surface-overlay/70 p-1.5 text-left backdrop-blur-md transition-colors hover:bg-surface-hover"
		@mousedown.prevent
		@click="emit('select')">
		<div
			class="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-poster sm:size-14">
			<img
				v-if="movie.poster"
				:src="`${POSTER_SUGGESTION_IMAGE_URL}${movie.poster}`"
				:alt="''"
				width="154"
				height="231"
				loading="lazy"
				decoding="async"
				class="size-full object-cover">
			<div
				v-else
				class="flex size-full items-center justify-center text-fg-muted"
				aria-hidden="true">
				<UIcon name="i-heroicons-film-20-solid" class="size-5 opacity-60" />
			</div>
		</div>
		<div class="min-w-0 flex-1 py-0.5">
			<p class="line-clamp-2 text-sm font-medium leading-snug text-fg-default sm:line-clamp-1">
				{{ movie.title }}
			</p>
			<p class="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-fg-muted">
				<UIcon name="i-heroicons-star-20-solid" class="size-3 shrink-0 text-rating" aria-hidden="true" />
				<span class="tabular-nums">{{ ratingLabel }}</span>
				<template v-if="yearLabel">
					<span aria-hidden="true">·</span>
					<span class="tabular-nums">{{ yearLabel }}</span>
				</template>
			</p>
		</div>
	</button>
</template>

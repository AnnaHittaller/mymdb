<script setup lang="ts">
import { POSTER_SUGGESTION_IMAGE_URL } from "~/constants/movie";
import type { UserMovie } from "~/types/movie";

const props = defineProps<{
	title: string;
	to: string;
	movies: UserMovie[];
}>();

function timestampMillis(movie: UserMovie): number {
	const timestamp = movie.timestamp as Date | { toMillis?: () => number } | undefined;
	if (timestamp instanceof Date) {
		return timestamp.getTime();
	}
	if (timestamp && typeof timestamp.toMillis === "function") {
		return timestamp.toMillis();
	}
	return 0;
}

const sortedWithPoster = computed(() =>
	[...props.movies]
		.sort((a, b) => timestampMillis(b) - timestampMillis(a))
		.filter((movie) => movie.poster),
);

const previewPosters = computed(() => sortedWithPoster.value.slice(0, 4));

const countLabel = computed(() => {
	const n = props.movies.length;
	return n === 1 ? "1 title" : `${n} titles`;
});

const isEmpty = computed(() => props.movies.length === 0);
</script>

<template>
	<NuxtLink
		:to="to"
		class="group flex w-full items-center gap-3 rounded-[12px] border border-fg-muted/40 bg-surface-overlay/70 p-2 backdrop-blur-md transition-colors hover:border-primary md:gap-4">
		<!-- Posters: right on mobile, left on desktop -->
		<div
			class="order-2 shrink-0 md:order-1"
			:class="isEmpty ? 'size-12 md:size-[4.25rem]' : 'md:w-[4.25rem]'">
			<div
				v-if="isEmpty"
				class="flex size-full items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster"
				aria-hidden="true">
				<UIcon name="i-heroicons-film-20-solid" class="size-6 text-fg-muted opacity-60 md:size-8" />
			</div>
			<template v-else>
				<div class="flex gap-1 md:hidden">
					<div
						v-for="movie in previewPosters"
						:key="movie.id"
						class="relative size-10 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster">
						<img
							:src="`${POSTER_SUGGESTION_IMAGE_URL}${movie.poster}`"
							:alt="''"
							width="154"
							height="231"
							loading="lazy"
							decoding="async"
							class="size-full object-cover">
					</div>
				</div>
				<div class="hidden grid-cols-2 gap-1 md:grid">
					<div
						v-for="movie in previewPosters"
						:key="movie.id"
						class="relative size-8 overflow-hidden rounded-[4px] bg-surface-poster">
						<img
							:src="`${POSTER_SUGGESTION_IMAGE_URL}${movie.poster}`"
							:alt="''"
							width="154"
							height="231"
							loading="lazy"
							decoding="async"
							class="size-full object-cover">
					</div>
				</div>
			</template>
		</div>

		<div class="order-1 min-w-0 flex-1 md:order-2">
			<p class="line-clamp-2 text-base font-semibold leading-snug text-fg-default md:line-clamp-1">
				{{ title }}
			</p>
			<p class="mt-0.5 text-sm text-fg-muted">{{ countLabel }}</p>
		</div>

		<UIcon
			name="i-heroicons-arrow-right-circle"
			class="order-3 hidden size-8 shrink-0 text-fg-muted transition-colors group-hover:text-primary md:block"
			aria-hidden="true" />
	</NuxtLink>
</template>

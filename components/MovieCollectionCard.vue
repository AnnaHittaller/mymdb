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
	<div class="@container w-full min-w-0">
		<NuxtLink
			:to="to"
			class="group flex w-full flex-wrap items-center gap-3 rounded-[12px] border border-border-default bg-surface-overlay/70 p-2 backdrop-blur-md transition-colors hover:border-primary @min-[350px]:gap-4">
			<div class="shrink-0 @max-[349px]:w-full @min-[350px]:w-auto">
				<div
					v-if="isEmpty"
					class="mx-auto flex aspect-2/3 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster @min-[350px]:mx-0 lg:w-14"
					aria-hidden="true">
					<UIcon name="i-heroicons-film-20-solid" class="size-6 text-fg-muted opacity-60 md:size-8" />
				</div>
				<div
					v-else
					class="flex gap-1 @max-[349px]:grid @max-[349px]:w-full @max-[349px]:grid-cols-4 @max-[349px]:gap-1">
					<div
						v-for="movie in previewPosters"
						:key="movie.id"
						class="relative aspect-2/3 w-12 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster lg:w-14 @max-[349px]:w-full">
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
			</div>

			<div class="min-w-0 grow basis-[8.5rem] @max-[349px]:basis-full">
				<div class="flex items-start gap-2">
					<p class="min-w-0 flex-1 text-base font-semibold leading-snug text-fg-default">
						{{ title }}
					</p>
					<UButton
						variant="iconbutton"
						color="custom"
						size="icon"
						square
						icon="i-heroicons-arrow-right-20-solid"
						tabindex="-1"
						aria-hidden="true"
						class="pointer-events-none shrink-0 group-hover:border-primary group-hover:text-primary"
						:ui="{ leadingIcon: 'size-5' }" />
				</div>
				<p class="mt-0.5 text-sm text-fg-muted">{{ countLabel }}</p>
			</div>
		</NuxtLink>
	</div>
</template>

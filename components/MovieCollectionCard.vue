<script setup lang="ts">
import { POSTER_SUGGESTION_IMAGE_URL } from "~/constants/movie";
import type { UserMovie } from "~/types/movie";
import { defaultMediaType } from "~/utils/catalogKey";

const props = defineProps<{
	title: string;
	to: string;
	movies: UserMovie[];
	listId?: string;
}>();

function joinedAtMillis(movie: UserMovie, listId: string): number {
	const membership = movie.memberships.find((m) => m.listId === listId);
	if (!membership) return 0;
	const joinedAt = membership.joinedAt;
	if (joinedAt instanceof Date) return joinedAt.getTime();
	return 0;
}

function timestampMillis(movie: UserMovie): number {
	const stamps = movie.memberships.map((m) => {
		const joinedAt = m.joinedAt;
		return joinedAt instanceof Date ? joinedAt.getTime() : 0;
	});
	if (stamps.length) return Math.max(...stamps);
	const legacy = movie.timestamp;
	return legacy instanceof Date ? legacy.getTime() : 0;
}

const sortedWithPoster = computed(() =>
	[...props.movies]
		.sort((a, b) => {
			const left = props.listId ? joinedAtMillis(b, props.listId) : timestampMillis(b);
			const right = props.listId ? joinedAtMillis(a, props.listId) : timestampMillis(a);
			return left - right;
		})
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
					class="mx-auto flex aspect-2/3 w-14 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster @min-[350px]:mx-0 lg:w-16"
					aria-hidden="true">
					<UIcon name="i-heroicons-film-20-solid" class="size-8 text-fg-muted opacity-60 md:size-10" />
				</div>
				<div
					v-else
					class="flex gap-1 @max-[349px]:grid @max-[349px]:w-full @max-[349px]:grid-cols-4 @max-[349px]:gap-1">
					<div
						v-for="movie in previewPosters"
						:key="`${defaultMediaType(movie.mediaType)}-${movie.id}`"
						class="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster lg:w-16 @max-[349px]:w-full">
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
						:ui="{ leadingIcon: 'size-6' }" />
				</div>
				<p class="mt-0.5 text-base text-fg-muted">{{ countLabel }}</p>
			</div>
		</NuxtLink>
	</div>
</template>

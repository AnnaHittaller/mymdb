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
	<NuxtLink
		:to="to"
		class="group flex w-full items-center gap-3 rounded-[12px] border border-border-default bg-surface-overlay/70 p-2 backdrop-blur-md transition-colors hover:border-primary md:gap-4">
		<div class="order-2 shrink-0 md:order-1">
			<div
				v-if="isEmpty"
				class="flex aspect-2/3 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster lg:w-14"
				aria-hidden="true">
				<UIcon name="i-heroicons-film-20-solid" class="size-6 text-fg-muted opacity-60 md:size-8" />
			</div>
			<div v-else class="flex gap-1">
				<div
					v-for="movie in previewPosters"
					:key="`${defaultMediaType(movie.mediaType)}-${movie.id}`"
					class="relative aspect-2/3 w-12 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster lg:w-14">
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

		<div class="order-1 min-w-0 flex-1 md:order-2">
			<p class="line-clamp-2 text-base font-semibold leading-snug text-fg-default md:line-clamp-1">
				{{ title }}
			</p>
			<p class="mt-0.5 text-sm text-fg-muted">{{ countLabel }}</p>
		</div>

		<UIcon
			name="i-heroicons-arrow-right"
			class="order-3 hidden size-6 shrink-0 text-fg-subtle transition-colors group-hover:text-primary md:block"
			aria-hidden="true" />
	</NuxtLink>
</template>

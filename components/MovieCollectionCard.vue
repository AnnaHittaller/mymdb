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

const arrowButtonUi = {
	base: "size-8",
	leadingIcon: "size-4",
};
</script>

<template>
	<!-- Width is this card, not the viewport. Under 420px the posters stack above the title. -->
	<div class="@container h-full w-full min-w-0">
		<NuxtLink
			:to="to"
			class="group flex h-full w-full flex-wrap gap-3 rounded-[12px] border border-border-default bg-surface-overlay/70 p-2 backdrop-blur-md transition-colors hover:border-primary @min-[420px]:flex-nowrap @min-[420px]:items-center @min-[420px]:gap-4">
			<div class="w-full min-w-0 @min-[420px]:w-auto @min-[420px]:shrink-0">
				<div
					v-if="isEmpty"
					class="grid w-full grid-cols-4 @min-[420px]:flex @min-[420px]:w-auto"
					aria-hidden="true">
					<div
						class="flex aspect-2/3 min-w-0 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster @min-[420px]:w-14 @min-[420px]:shrink-0 @min-[420px]:lg:w-16">
						<UIcon name="i-heroicons-film-20-solid" class="size-8 text-fg-muted opacity-60 md:size-10" />
					</div>
				</div>
				<div
					v-else
					class="grid w-full grid-cols-4 gap-1 @min-[420px]:flex @min-[420px]:w-auto @min-[420px]:gap-1">
					<div
						v-for="movie in previewPosters"
						:key="`${defaultMediaType(movie.mediaType)}-${movie.id}`"
						class="relative aspect-2/3 min-w-0 overflow-hidden rounded-[4px] bg-surface-poster @min-[420px]:w-14 @min-[420px]:shrink-0 @min-[420px]:lg:w-16">
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

			<!-- Side-by-side: title + subline stacked, arrow vertically centered -->
			<div
				class="hidden min-h-0 min-w-0 flex-1 items-center gap-2 @min-[420px]:flex">
				<div class="min-w-0 flex flex-1 flex-col justify-center gap-0.5">
					<p class="text-lg font-semibold leading-snug text-fg-default">
						{{ title }}
					</p>
					<p class="text-base text-fg-muted">{{ countLabel }}</p>
				</div>
				<UButton
					variant="iconbutton"
					color="custom"
					size="icon"
					square
					icon="i-heroicons-arrow-right-20-solid"
					tabindex="-1"
					aria-hidden="true"
					class="pointer-events-none shrink-0 group-hover:border-primary group-hover:text-primary"
					:ui="arrowButtonUi" />
			</div>

			<!-- Wrapped: text stack + arrow top-aligned with title -->
			<div class="flex w-full items-start gap-2 @min-[420px]:hidden">
				<div class="min-w-0 flex flex-1 flex-col gap-0.5">
					<p class="text-lg font-semibold leading-snug text-fg-default">
						{{ title }}
					</p>
					<p class="text-base text-fg-muted">{{ countLabel }}</p>
				</div>
				<UButton
					variant="iconbutton"
					color="custom"
					size="icon"
					square
					icon="i-heroicons-arrow-right-20-solid"
					tabindex="-1"
					aria-hidden="true"
					class="pointer-events-none shrink-0 group-hover:border-primary group-hover:text-primary"
					:ui="arrowButtonUi" />
			</div>
		</NuxtLink>
	</div>
</template>

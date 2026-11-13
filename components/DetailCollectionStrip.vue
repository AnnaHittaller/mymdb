<script setup lang="ts">
import type { DetailCollection } from "~/types/detailCollection";

const props = defineProps<{
	collection: DetailCollection;
	currentMovieId: string;
}>();

const {
	scrollEl,
	canScrollLeft,
	canScrollRight,
	isGrabbing,
} = useHorizontalScrollStrip();
</script>

<template>
	<section class="flex min-w-0 flex-col gap-3">
		<Heading flush tier="section" class="mb-4">
			{{ collection.name }}
		</Heading>
		<div class="relative min-w-0 pt-2">
			<div
				ref="scrollEl"
				role="region"
				:aria-label="`${collection.name}, scroll horizontally`"
				tabindex="0"
				class="flex gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain py-2 scrollbar-none select-none touch-pan-x"
				:class="isGrabbing ? 'cursor-grabbing' : 'cursor-grab'">
				<div
					v-for="part in collection.parts"
					:key="part.id"
					class="w-[12.5rem] shrink-0">
					<MovieCard
						:movie="{
							id: part.id,
							title: part.title,
							poster_path: part.poster_path,
							vote_average: part.vote_average,
						}"
						media-type="movie"
						:highlighted="String(part.id) === currentMovieId" />
				</div>
			</div>
			<div
				v-if="canScrollLeft"
				class="pointer-events-none absolute inset-y-0 start-0 z-10 flex w-10 items-center justify-start bg-gradient-to-r from-surface-page via-surface-page/80 to-transparent ps-0.5"
				aria-hidden="true">
				<UIcon name="i-heroicons-chevron-left-20-solid" class="size-5 text-fg-muted" />
			</div>
			<div
				v-if="canScrollRight"
				class="pointer-events-none absolute inset-y-0 end-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-surface-page via-surface-page/80 to-transparent pe-0.5"
				aria-hidden="true">
				<UIcon name="i-heroicons-chevron-right-20-solid" class="size-5 text-fg-muted" />
			</div>
		</div>
	</section>
</template>

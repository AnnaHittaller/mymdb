<script setup lang="ts">
import { POSTER_SUGGESTION_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";

const props = defineProps<{
	title: string;
	to: string;
	mediaType: MediaType;
	items: TrendingItem[];
}>();

const previewPosters = computed(() =>
	props.items.filter((item) => item.poster).slice(0, 4),
);

const isEmpty = computed(() => props.items.length === 0);

const emptyIcon = computed(() =>
	props.mediaType === "tv" ? "i-heroicons-tv-20-solid" : "i-heroicons-film-20-solid",
);
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
				<UIcon :name="emptyIcon" class="size-6 text-fg-muted opacity-60 md:size-8" />
			</div>
			<div v-else class="flex gap-1">
				<div
					v-for="item in previewPosters"
					:key="`${item.mediaType}-${item.id}`"
					class="relative aspect-2/3 w-12 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster lg:w-14">
					<img
						:src="`${POSTER_SUGGESTION_IMAGE_URL}${item.poster}`"
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
		</div>

		<UIcon
			name="i-heroicons-arrow-right"
			class="order-3 hidden size-8 shrink-0 text-fg-subtle transition-colors group-hover:text-primary md:block"
			aria-hidden="true" />
	</NuxtLink>
</template>

<script setup lang="ts">
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import {
	BACKDROP_COMPACT_IMAGE_URL,
	BACKDROP_IMAGE_URL,
	POSTER_DETAIL_IMAGE_URL,
	POSTER_IMAGE_URL,
} from "~/constants/movie";
import type { DetailGalleryImage, DetailGalleryItem } from "~/types/detailGallery";
import type { TrailerRef } from "~/types/trailer";

const props = defineProps<{
	items: DetailGalleryItem[];
}>();

const emit = defineEmits<{
	play: [trailer: TrailerRef];
}>();

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const images = computed(() =>
	props.items.filter((item): item is DetailGalleryImage => item.kind === "image"),
);

const activeImage = computed(() => images.value[lightboxIndex.value] ?? null);

function thumbUrl(item: DetailGalleryItem): string | null {
	if (item.kind === "trailer") {
		return item.stillPath ? `${BACKDROP_COMPACT_IMAGE_URL}${item.stillPath}` : null;
	}
	const base = item.variant === "poster" ? POSTER_IMAGE_URL : BACKDROP_COMPACT_IMAGE_URL;
	return `${base}${item.filePath}`;
}

function fullUrl(image: DetailGalleryImage): string {
	const base = image.variant === "poster" ? POSTER_DETAIL_IMAGE_URL : BACKDROP_IMAGE_URL;
	return `${base}${image.filePath}`;
}

function openItem(item: DetailGalleryItem) {
	if (item.kind === "trailer") {
		emit("play", item.trailer);
		return;
	}
	const index = images.value.findIndex((image) => image.id === item.id);
	if (index < 0) return;
	lightboxIndex.value = index;
	lightboxOpen.value = true;
}

function showPrevious() {
	if (lightboxIndex.value > 0) lightboxIndex.value -= 1;
}

function showNext() {
	if (lightboxIndex.value < images.value.length - 1) lightboxIndex.value += 1;
}
</script>

<template>
	<section v-if="items.length > 0" class="flex min-w-0 flex-col gap-3">
		<Heading flush tier="section">
			More images & trailers
		</Heading>
		<div class="flex h-40 gap-3 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-mandatory">
			<button
				v-for="item in items"
				:key="item.id"
				type="button"
				class="relative h-full shrink-0 snap-start overflow-hidden rounded-lg bg-surface-poster focus-visible:outline-3 focus-visible:outline-primary/25"
				:style="{ aspectRatio: String(item.aspectRatio) }"
				:aria-label="item.kind === 'trailer' ? `Play ${item.name}` : `View ${item.alt}`"
				@click="openItem(item)">
				<img
					v-if="thumbUrl(item)"
					:src="thumbUrl(item) || ''"
					:alt="item.kind === 'trailer' ? '' : item.alt"
					:width="Math.round(160 * item.aspectRatio)"
					height="160"
					loading="lazy"
					decoding="async"
					class="size-full object-cover">
				<span
					v-if="item.kind === 'trailer'"
					class="absolute inset-0 flex items-center justify-center bg-surface-page/25">
					<span class="flex size-11 items-center justify-center rounded-full bg-surface-overlay/90 text-fg-default">
						<UIcon name="i-heroicons-play-20-solid" class="size-6" />
					</span>
					<span class="absolute inset-x-0 bottom-0 truncate bg-surface-page/80 px-2 py-1 text-left text-xs text-fg-default">
						{{ item.name }}
					</span>
				</span>
			</button>
		</div>

		<UModal
			v-model:open="lightboxOpen"
			:title="activeImage?.alt"
			:description="images.length > 1 ? `${lightboxIndex + 1} of ${images.length}` : undefined"
			:ui="{
				...browsingModalUi,
				content: 'w-[calc(100vw-2rem)] max-w-5xl',
			}">
			<template #body>
				<img
					v-if="activeImage"
					:src="fullUrl(activeImage)"
					:alt="activeImage.alt"
					class="max-h-[70vh] w-full rounded-md object-contain"
					decoding="async">
				<div v-if="images.length > 1" class="mt-4 flex items-center justify-between gap-3">
					<UButton
						type="button"
						color="neutral"
						variant="outline"
						icon="i-heroicons-chevron-left"
						label="Previous"
						:disabled="lightboxIndex === 0"
						@click="showPrevious" />
					<UButton
						type="button"
						color="neutral"
						variant="outline"
						trailing-icon="i-heroicons-chevron-right"
						label="Next"
						:disabled="lightboxIndex >= images.length - 1"
						@click="showNext" />
				</div>
			</template>
		</UModal>
	</section>
</template>

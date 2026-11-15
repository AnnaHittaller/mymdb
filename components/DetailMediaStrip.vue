<script setup lang="ts">
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import {
	BACKDROP_COMPACT_IMAGE_URL,
	BACKDROP_IMAGE_URL,
	POSTER_DETAIL_IMAGE_URL,
	POSTER_IMAGE_URL,
} from "~/constants/movie";
import type { DetailGalleryImage, DetailGalleryItem } from "~/types/detailGallery";

const props = defineProps<{
	items: DetailGalleryItem[];
}>();

const { t } = useI18n();

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const {
	scrollEl,
	canScrollLeft,
	canScrollRight,
	isGrabbing,
	consumeDragClick,
} = useHorizontalScrollStrip();

const images = computed(() =>
	props.items.filter((item): item is DetailGalleryImage => item.kind === "image"),
);

const activeImage = computed(() => images.value[lightboxIndex.value] ?? null);

const lightboxNavDisabledClass =
	"disabled:pointer-events-none disabled:border-border-default disabled:bg-transparent disabled:text-fg-muted disabled:opacity-50";

function thumbUrl(image: DetailGalleryImage): string {
	const base =
		image.variant === "poster" ? POSTER_IMAGE_URL : BACKDROP_COMPACT_IMAGE_URL;
	return `${base}${image.filePath}`;
}

function fullUrl(image: DetailGalleryImage): string {
	const base = image.variant === "poster" ? POSTER_DETAIL_IMAGE_URL : BACKDROP_IMAGE_URL;
	return `${base}${image.filePath}`;
}

function openImage(index: number) {
	if (consumeDragClick()) return;
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
	<section v-if="images.length > 0" class="flex min-w-0 flex-col gap-3">
		<Heading flush tier="section" class="mb-4">
			{{ $t("detail.moreImages") }}
		</Heading>
		<div class="relative min-w-0">
			<div
				ref="scrollEl"
				role="region"
				:aria-label="$t('detail.moreImagesScroll')"
				tabindex="0"
				class="flex h-40 gap-3 overflow-x-auto overscroll-x-contain pb-1 scrollbar-none select-none touch-pan-x"
				:class="isGrabbing ? 'cursor-grabbing' : 'cursor-grab'">
				<button
					v-for="(image, index) in images"
					:key="image.id"
					type="button"
					class="relative h-full shrink-0 cursor-pointer overflow-hidden rounded-lg bg-surface-poster focus-visible:outline-3 focus-visible:outline-primary/25"
					:style="{ aspectRatio: String(image.aspectRatio) }"
					:aria-label="t('detail.viewImage', { alt: image.alt })"
					@click="openImage(index)">
					<img
						:src="thumbUrl(image)"
						:alt="image.alt"
						:width="Math.round(160 * image.aspectRatio)"
						height="160"
						loading="lazy"
						decoding="async"
						draggable="false"
						class="pointer-events-none size-full object-cover">
				</button>
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

		<UModal
			v-model:open="lightboxOpen"
			:title="activeImage?.alt"
			:description="
				images.length > 1
					? t('detail.imagePagination', { current: lightboxIndex + 1, total: images.length })
					: undefined
			"
			:ui="{
				...browsingModalUi,
				content: 'w-[calc(100vw-2rem)] max-w-5xl',
			}">
			<template #body>
				<div
					class="flex h-[min(70vh,40rem)] w-full items-center justify-center rounded-md bg-surface-inset">
					<img
						v-if="activeImage"
						:src="fullUrl(activeImage)"
						:alt="activeImage.alt"
						class="max-h-full max-w-full object-contain"
						decoding="async">
				</div>
				<div v-if="images.length > 1" class="mt-4 flex items-center justify-between gap-3">
					<UButton
						type="button"
						color="neutral"
						variant="outline"
						icon="i-heroicons-chevron-left"
						:label="$t('common.previous')"
						:disabled="lightboxIndex === 0"
						:class="lightboxNavDisabledClass"
						@click="showPrevious" />
					<UButton
						type="button"
						color="neutral"
						variant="outline"
						trailing-icon="i-heroicons-chevron-right"
						:label="$t('common.next')"
						:disabled="lightboxIndex >= images.length - 1"
						:class="lightboxNavDisabledClass"
						@click="showNext" />
				</div>
			</template>
		</UModal>
	</section>
</template>

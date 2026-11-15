<script setup lang="ts">
import { useCurrentUser } from "vuefire";
import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL, POSTER_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";
import { catalogDetailPath } from "~/utils/catalogPath";
import { defaultMediaType } from "~/utils/catalogKey";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { catalogKey } from "~/utils/catalogKey";
import { localizeTmdbGenreNames } from "~/domain/locale/tmdbGenreLabels";

const { locale } = useI18n();
const user = useCurrentUser();
const { data: trendingItems } = await useTrendingHero();

const backdropSizes = "(max-width: 639px) calc(100vw - 2rem), calc(100vw - 7.25rem - 2rem)";

const firstBackdrop = computed(() => trendingItems.value?.[0]?.backdrop ?? "");

function backdropSrcSet(path: string) {
	return `${BACKDROP_COMPACT_IMAGE_URL}${path} 780w, ${BACKDROP_IMAGE_URL}${path} 1280w`;
}

useHead(() => {
	if (!firstBackdrop.value) return {};
	return {
		link: [{
			rel: "preload",
			as: "image",
			href: `${BACKDROP_IMAGE_URL}${firstBackdrop.value}`,
			imagesrcset: backdropSrcSet(firstBackdrop.value),
			imagesizes: backdropSizes,
			fetchpriority: "high",
		}],
	};
});

function ratingLabel(item: TrendingItem) {
	return formatMovieRating(item.rating);
}

function genreLine(item: TrendingItem) {
	return localizeTmdbGenreNames(item.genres ?? [], locale.value).join(" · ");
}

function yearLabel(item: TrendingItem) {
	return item.releaseDate?.slice(0, 4) ?? (item.releaseYear ? String(item.releaseYear) : "");
}

function itemMediaType(item: TrendingItem): MediaType {
	return defaultMediaType(item.mediaType);
}

const heroCarouselArrow = {
	variant: "iconbutton" as const,
	color: "custom" as const,
	size: "icon" as const,
	square: true,
	ui: { leadingIcon: "size-8" },
};

const heroArrowSlotClass =
	"z-10 sm:size-11";

const {
	modalOpen: trailerModalOpen,
	activeTitle: trailerModalTitle,
	activeTrailer,
	openTrailer,
} = useTrailerPlayback();

const heroAutoplay = computed(() =>
	trailerModalOpen.value
		? false
		: { delay: 8000, stopOnMouseEnter: true, stopOnInteraction: false },
);

const trailerLoadingKey = ref<string | null>(null);
const trailerUnavailableKeys = ref(new Set<string>());

function trailerItemKey(item: TrendingItem) {
	return catalogKey(item.id, itemMediaType(item));
}

function isTrailerLoading(item: TrendingItem) {
	return trailerLoadingKey.value === trailerItemKey(item);
}

function isTrailerDisabled(item: TrendingItem) {
	return trailerUnavailableKeys.value.has(trailerItemKey(item));
}

async function onWatchTrailer(item: TrendingItem) {
	const key = trailerItemKey(item);
	if (trailerUnavailableKeys.value.has(key)) return;

	trailerLoadingKey.value = key;
	const ok = await openTrailer({
		id: item.id,
		mediaType: itemMediaType(item),
		title: item.title,
	});
	trailerLoadingKey.value = null;
	if (!ok) {
		trailerUnavailableKeys.value = new Set([...trailerUnavailableKeys.value, key]);
	}
}
</script>

<template>
	<div class="pb-4">
		<UCarousel
			v-if="trendingItems?.length"
			v-slot="{ item, index }"
			class="@container"
			fade
			loop
			arrows
			prev-icon="i-heroicons-chevron-left-20-solid"
			next-icon="i-heroicons-chevron-right-20-solid"
			:prev="heroCarouselArrow"
			:next="heroCarouselArrow"
			:autoplay="heroAutoplay"
			:items="trendingItems"
			:ui="{
				container: 'items-stretch',
				item: 'flex basis-full',
				viewport: 'min-h-[390px] overflow-hidden rounded-[12px] [transform:translateZ(0)]',
				prev: `start-4 top-1/2 -translate-y-1/2 sm:start-4 @max-[447px]:start-1/2 @max-[447px]:end-auto @max-[447px]:top-auto @max-[447px]:bottom-4 @max-[447px]:size-10 @max-[447px]:translate-x-[calc(-100%-12px)] @max-[447px]:translate-y-0 ${heroArrowSlotClass}`,
				next: `end-4 top-1/2 -translate-y-1/2 sm:end-4 @max-[447px]:end-auto @max-[447px]:start-1/2 @max-[447px]:top-auto @max-[447px]:bottom-4 @max-[447px]:size-10 @max-[447px]:translate-x-[12px] @max-[447px]:translate-y-0 ${heroArrowSlotClass}`,
			}">
			<div
				class="relative flex h-full min-h-[390px] w-full flex-1 items-center justify-center px-6 py-16 @min-[400px]:py-[4.5rem] @max-[447px]:py-[4.75rem]">
				<img
					v-if="item.backdrop"
					:src="`${BACKDROP_IMAGE_URL}${item.backdrop}`"
					:srcset="index === 0 ? backdropSrcSet(item.backdrop) : undefined"
					:sizes="index === 0 ? backdropSizes : undefined"
					:alt="item.title"
					width="1280"
					height="720"
					:fetchpriority="index === 0 ? 'high' : 'low'"
					:loading="index === 0 ? 'eager' : 'lazy'"
					decoding="async"
					class="absolute inset-0 h-full w-full object-cover">
				<div class="@container relative z-10 flex w-full justify-center">
					<div
						class="flex h-fit w-full min-h-0 flex-col items-center gap-4 rounded-[12px] border border-border-default bg-surface-overlay/70 p-4 backdrop-blur-md @min-[300px]:@max-[399px]:grid @min-[300px]:@max-[399px]:w-full @min-[300px]:@max-[399px]:grid-cols-[8.5rem_1fr] @min-[300px]:@max-[399px]:items-start @min-[300px]:@max-[399px]:gap-x-4 @min-[300px]:@max-[399px]:gap-y-2 @min-[400px]:w-[min(100%,680px,max(400px,72%))] @min-[400px]:flex-row @min-[400px]:items-stretch">
						<NuxtLink
							:to="catalogDetailPath(item.id, itemMediaType(item))"
							class="relative flex min-h-0 w-[8.5rem] shrink-0 self-center overflow-hidden rounded-lg @min-[300px]:@max-[399px]:col-start-1 @min-[300px]:@max-[399px]:row-start-1 @min-[300px]:@max-[399px]:self-start @min-[400px]:w-[10rem] @min-[400px]:max-h-full @min-[400px]:self-stretch">
							<img
								v-if="item.poster"
								:src="`${POSTER_IMAGE_URL}${item.poster}`"
								:alt="item.title"
								width="342"
								height="513"
								:fetchpriority="index === 0 ? 'auto' : 'low'"
								:loading="index === 0 ? 'eager' : 'lazy'"
								decoding="async"
								class="aspect-[2/3] h-auto w-full rounded-lg object-cover @min-[400px]:aspect-auto @min-[400px]:h-full @min-[400px]:max-h-full @min-[400px]:min-h-0">
						</NuxtLink>
						<div
							class="flex min-h-0 min-w-0 flex-1 flex-col gap-2 text-fg-default @min-[300px]:@max-[399px]:contents">
							<NuxtLink
								:to="catalogDetailPath(item.id, itemMediaType(item))"
								class="flex min-w-0 flex-col gap-2 @min-[300px]:@max-[399px]:col-start-2 @min-[300px]:@max-[399px]:row-start-1">
								<span class="flex flex-col gap-0.5">
									<span class="text-xl uppercase leading-tight">{{ item.title }}</span>
									<span v-if="item.genres?.length" class="text-base leading-tight text-fg-muted">{{
										genreLine(item) }}</span>
								</span>
								<span class="text-base">
									<UIcon name="i-heroicons-star-20-solid" class="mr-1 size-5 align-[-0.15em] text-rating" />
									{{ ratingLabel(item) }}<span v-if="yearLabel(item)" class="text-fg-muted"> · {{
										yearLabel(item) }}</span><span class="text-fg-muted"> · </span><CatalogMediaBadge
										embedded
										:media-type="itemMediaType(item)" />
								</span>
							</NuxtLink>
							<div
								class="flex flex-col gap-2 @min-[300px]:@max-[399px]:col-span-2 @min-[300px]:@max-[399px]:row-start-2">
								<NuxtLink
									:to="catalogDetailPath(item.id, itemMediaType(item))"
									class="line-clamp-3 min-h-[4.5rem] text-base leading-7">
									{{ item.overview }}
								</NuxtLink>
								<WatchTrailerButton
									:id="item.id"
									:media-type="itemMediaType(item)"
									:title="item.title"
									:loading="isTrailerLoading(item)"
									:disabled="isTrailerDisabled(item)"
									size="lg"
									class="self-start"
									:ui="{ leadingIcon: 'size-5' }"
									@play="onWatchTrailer(item)" />
								<HeroTrendingListControls v-if="user" :item="item" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</UCarousel>
		<TrailerModal
			v-model:open="trailerModalOpen"
			:title="trailerModalTitle"
			:trailer="activeTrailer" />
	</div>
</template>

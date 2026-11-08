<script setup lang="ts">
import { useCurrentUser } from "vuefire";
import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL, POSTER_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";
import { catalogDetailPath } from "~/utils/catalogPath";
import { defaultMediaType } from "~/utils/catalogKey";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { catalogKey } from "~/utils/catalogKey";

const user = useCurrentUser();
const { isInList, movies, add, remove, setNext } = useUserDocument();
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

function yearLabel(item: TrendingItem) {
	return item.releaseDate?.slice(0, 4) ?? (item.releaseYear ? String(item.releaseYear) : "");
}

function itemMediaType(item: TrendingItem): MediaType {
	return defaultMediaType(item.mediaType);
}

function inWatchNext(item: TrendingItem) {
	return movies.value.some(
		(entry) =>
			entry.id === String(item.id)
			&& defaultMediaType(entry.mediaType) === itemMediaType(item)
			&& entry.next,
	);
}

async function addToList(item: TrendingItem) {
	const mediaType = itemMediaType(item);
	await add({
		id: String(item.id),
		mediaType,
		title: item.title,
		rating: item.rating,
		poster: item.poster ?? "",
		...(item.genres?.length ? { genres: item.genres } : {}),
		seen: false,
		next: false,
		timestamp: new Date(),
	});
}

async function removeFromList(item: TrendingItem) {
	await remove(String(item.id), itemMediaType(item));
}

async function toggleWatchNext(item: TrendingItem) {
	const mediaType = itemMediaType(item);
	await setNext(String(item.id), !inWatchNext(item), mediaType);
}

const arrowClass = "z-10 size-8 cursor-pointer justify-center rounded-full border border-primary bg-surface-overlay/80 p-0 text-primary hover:bg-surface-overlay sm:size-10";

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
			:prev="{ variant: 'ghost', color: 'neutral', ui: { leadingIcon: 'size-6' } }"
			:next="{ variant: 'ghost', color: 'neutral', ui: { leadingIcon: 'size-6' } }"
			:autoplay="heroAutoplay"
			:items="trendingItems"
			:ui="{
				container: 'items-stretch',
				item: 'flex basis-full',
				viewport: 'min-h-[390px] overflow-hidden rounded-[12px] [transform:translateZ(0)]',
				prev: `start-4 top-1/2 -translate-y-1/2 sm:start-4 @max-[447px]:start-1/2 @max-[447px]:end-auto @max-[447px]:top-auto @max-[447px]:bottom-4 @max-[447px]:size-8 @max-[447px]:translate-x-[calc(-100%-12px)] @max-[447px]:translate-y-0 ${arrowClass}`,
				next: `end-4 top-1/2 -translate-y-1/2 sm:end-4 @max-[447px]:end-auto @max-[447px]:start-1/2 @max-[447px]:top-auto @max-[447px]:bottom-4 @max-[447px]:size-8 @max-[447px]:translate-x-[12px] @max-[447px]:translate-y-0 ${arrowClass}`,
			}">
			<div
				class="relative flex h-full min-h-[390px] w-full flex-1 items-center justify-center px-6 py-12 @min-[400px]:py-14 @max-[447px]:py-[68px]">
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
						class="flex h-fit w-full min-h-0 flex-col items-center gap-4 rounded-[12px] border border-border-default bg-surface-overlay/70 p-4 backdrop-blur-md @min-[300px]:@max-[399px]:grid @min-[300px]:@max-[399px]:w-full @min-[300px]:@max-[399px]:grid-cols-[7.5rem_1fr] @min-[300px]:@max-[399px]:items-start @min-[300px]:@max-[399px]:gap-x-4 @min-[300px]:@max-[399px]:gap-y-2 @min-[400px]:w-[min(100%,600px,max(400px,66.67%))] @min-[400px]:flex-row @min-[400px]:items-stretch">
						<NuxtLink
							:to="catalogDetailPath(item.id, itemMediaType(item))"
							class="relative flex min-h-0 w-[7.5rem] shrink-0 self-center overflow-hidden rounded-lg @min-[300px]:@max-[399px]:col-start-1 @min-[300px]:@max-[399px]:row-start-1 @min-[300px]:@max-[399px]:self-start @min-[400px]:w-[8.5rem] @min-[400px]:max-h-full @min-[400px]:self-stretch">
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
									<span class="text-lg uppercase leading-tight">{{ item.title }}</span>
									<span v-if="item.genres?.length" class="text-sm leading-tight text-fg-muted">{{
										item.genres.join(" · ") }}</span>
								</span>
								<span>
									<UIcon name="i-heroicons-star-20-solid" class="mr-1 align-[-0.15em] text-rating" />
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
									class="line-clamp-3 min-h-[4.5rem] leading-6">
									{{ item.overview }}
								</NuxtLink>
								<WatchTrailerButton
									:id="item.id"
									:media-type="itemMediaType(item)"
									:title="item.title"
									:loading="isTrailerLoading(item)"
									:disabled="isTrailerDisabled(item)"
									class="self-start"
									@play="onWatchTrailer(item)" />
								<div v-if="user"
									class="flex h-6 max-h-6 min-h-6 shrink-0 flex-nowrap items-center gap-3 text-fg-subtle">
									<button
										v-if="!isInList(String(item.id), itemMediaType(item))"
										type="button"
										class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
										aria-label="Add to my list"
										@click="addToList(item)">
										<IconAddToList class="size-6" />
									</button>
									<button
										v-else
										type="button"
										class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
										aria-label="Remove from watchlist"
										@click="removeFromList(item)">
										<UIcon name="i-heroicons-x-circle" class="size-6" />
									</button>
									<button
										v-if="isInList(String(item.id), itemMediaType(item))"
										type="button"
										class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
										:aria-label="inWatchNext(item) ? 'Remove from favorites' : 'Add to favorites'"
										@click="toggleWatchNext(item)">
										<UIcon :name="inWatchNext(item) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
											class="size-6" />
									</button>
								</div>
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

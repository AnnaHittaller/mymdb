<script setup lang="ts">
import { POSTER_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { trendingLeadingGenre } from "~/utils/trendingLeadingGenre";

const props = defineProps<{
	title: string;
	to: string;
	mediaType: MediaType;
	items: TrendingItem[];
	pending?: boolean;
}>();

const topThreeRanked = computed(() => {
	const result: { item: TrendingItem; rank: number }[] = [];
	for (let i = 0; i < props.items.length && result.length < 3; i++) {
		const item = props.items[i]!;
		if (item.poster) {
			result.push({ item, rank: i + 1 });
		}
	}
	return result;
});

const leadingGenre = computed(() => trendingLeadingGenre(props.items));

const isEmpty = computed(() => props.items.length === 0);

const showSkeleton = computed(() => Boolean(props.pending) && isEmpty.value);

const emptyIcon = computed(() =>
	props.mediaType === "tv" ? "i-heroicons-tv-20-solid" : "i-heroicons-film-20-solid",
);

function yearLabel(item: TrendingItem) {
	return item.releaseDate?.slice(0, 4) ?? (item.releaseYear ? String(item.releaseYear) : "");
}

function ratingLabel(item: TrendingItem) {
	return formatMovieRating(item.rating);
}

function firstGenre(item: TrendingItem) {
	return item.genres[0] ?? "";
}

function hasMeta(item: TrendingItem) {
	return ratingLabel(item) !== "N/A" || Boolean(yearLabel(item)) || Boolean(firstGenre(item));
}

const cardAriaLabel = computed(() => {
	const segments: string[] = [props.title];
	const genre = leadingGenre.value;
	if (genre) segments.push(`Leading genre ${genre}`);
	const topTitles = props.items.slice(0, 3).map((item, index) => `Number ${index + 1} ${item.title}`);
	if (topTitles.length > 0) segments.push(topTitles.join(". "));
	return segments.join(". ");
});

const cardShellClass =
	"group flex h-full min-h-0 w-full flex-col gap-3 rounded-[12px] border border-border-default bg-surface-elevated p-3 shadow-surface-overlay transition-colors hover:border-primary @min-[400px]:gap-4 @min-[400px]:p-4";

const rowShellClass =
	"relative flex items-stretch gap-2.5 overflow-hidden rounded-[8px] border border-border-default bg-surface-inset p-2 pr-12";

const rankFlagRowClass =
	"absolute right-0 top-0 z-10 flex items-center justify-center rounded-bl-[6px] bg-primary px-2.5 py-1 text-sm font-bold leading-none text-inverted tabular-nums";

const rankFlagOnPosterClass =
	"absolute left-0 top-0 z-10 flex items-center justify-center rounded-br-[6px] bg-primary px-2.5 py-1 text-sm font-bold leading-none text-inverted tabular-nums";

const ratingInlineClass = "inline-flex items-center gap-1";
const starIconClass = "block size-4 shrink-0 text-rating";
const ratingTextClass = "text-sm leading-snug tabular-nums";
const metaLineClass = "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm leading-snug text-fg-muted";
</script>

<template>
	<div class="@container h-full min-h-0 w-full min-w-0">
		<div
			v-if="showSkeleton"
			:class="[cardShellClass, 'pointer-events-none']"
			aria-hidden="true">
			<div class="flex items-start gap-2">
				<USkeleton class="size-6 shrink-0 rounded" />
				<USkeleton class="h-8 min-w-0 flex-1" />
				<USkeleton class="size-9 shrink-0 rounded-[8px]" />
			</div>
			<div class="flex items-center gap-2">
				<USkeleton class="h-4 w-24" />
				<USkeleton class="h-7 w-28 rounded-full" />
			</div>
			<div class="hidden flex-col gap-2 @max-[399px]:flex">
				<USkeleton v-for="n in 3" :key="n" class="h-20 w-full rounded-[8px]" />
			</div>
			<div class="hidden grid-cols-3 gap-2 @min-[400px]:grid">
				<USkeleton v-for="n in 3" :key="`w-${n}`" class="aspect-2/3 w-full rounded-[4px]" />
			</div>
		</div>

		<NuxtLink
			v-else
			:to="to"
			:aria-label="cardAriaLabel"
			:class="cardShellClass">
			<div class="flex items-start gap-2.5">
				<UIcon
					name="i-heroicons-arrow-trending-up"
					class="mt-1 size-6 shrink-0 text-primary"
					aria-hidden="true" />
				<div class="min-w-0 flex-1">
					<p class="text-xl font-semibold leading-tight text-fg-default @min-[400px]:text-2xl">
						{{ title }}
					</p>
					<div
						v-if="leadingGenre"
						class="mt-2 flex flex-wrap items-center gap-2">
						<span class="text-sm font-medium text-fg-muted">Leading genre this week:</span>
						<UBadge
							variant="outline"
							color="neutral"
							size="md"
							class="border-primary/40 px-3 py-1 text-sm font-medium text-fg-default"
							aria-hidden="true">
							{{ leadingGenre }}
						</UBadge>
					</div>
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
					:ui="{ leadingIcon: 'size-5' }" />
			</div>

			<div class="flex min-h-0 flex-1 flex-col gap-2">
				<div v-if="isEmpty" class="flex items-center gap-3 py-2">
					<div
						class="flex aspect-2/3 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster lg:w-14"
						aria-hidden="true">
						<UIcon :name="emptyIcon" class="size-6 text-fg-muted opacity-60 md:size-8" />
					</div>
					<p class="text-sm text-fg-muted">Nothing trending right now.</p>
				</div>

				<div
					v-else-if="topThreeRanked.length === 0"
					class="flex items-center gap-3 py-2">
					<div
						class="flex aspect-2/3 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster lg:w-14"
						aria-hidden="true">
						<UIcon :name="emptyIcon" class="size-6 text-fg-muted opacity-60 md:size-8" />
					</div>
					<p class="text-sm text-fg-muted">No posters to preview.</p>
				</div>

				<!-- Narrow: poster, then text; rank flag top-right of row -->
				<div v-else class="flex flex-col gap-2 @min-[400px]:hidden">
					<div
						v-for="{ item, rank } in topThreeRanked"
						:key="`${item.mediaType}-${item.id}`"
						:class="rowShellClass">
						<span :class="rankFlagRowClass" aria-hidden="true">#{{ rank }}</span>
						<div
							class="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster sm:w-16">
							<img
								:src="`${POSTER_IMAGE_URL}${item.poster}`"
								:alt="''"
								width="342"
								height="513"
								loading="lazy"
								decoding="async"
								class="size-full object-cover">
						</div>
						<div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
							<p class="line-clamp-2 text-sm font-semibold leading-snug text-fg-default">{{ item.title }}
							</p>
							<p v-if="hasMeta(item)" :class="metaLineClass">
								<template v-if="ratingLabel(item) !== 'N/A'">
									<span :class="ratingInlineClass">
										<UIcon name="i-heroicons-star-20-solid" :class="starIconClass"
											aria-hidden="true" />
										<span :class="ratingTextClass">{{ ratingLabel(item) }}</span>
									</span>
								</template>
								<template v-if="yearLabel(item)">
									<span v-if="ratingLabel(item) !== 'N/A'" class="text-fg-muted"
										aria-hidden="true">·</span>
									<span>{{ yearLabel(item) }}</span>
								</template>
								<template v-if="firstGenre(item)">
									<span
										v-if="ratingLabel(item) !== 'N/A' || yearLabel(item)"
										class="text-fg-muted"
										aria-hidden="true">·</span>
									<span>{{ firstGenre(item) }}</span>
								</template>
							</p>
						</div>
					</div>
				</div>

				<!-- Wide: three equal mini-cards (movie-card style) -->
				<div
					v-if="!isEmpty && topThreeRanked.length > 0"
					class="hidden min-h-0 flex-1 grid-cols-3 gap-2 @min-[400px]:grid">
					<div
						v-for="{ item, rank } in topThreeRanked"
						:key="`${item.mediaType}-${item.id}-grid`"
						class="flex min-w-0 flex-col gap-1.5">
						<div
							class="relative overflow-hidden rounded-[6px] bg-surface-poster"
							:class="rank === 1 ? 'ring-1 ring-primary/50' : ''">
							<span :class="rankFlagOnPosterClass" aria-hidden="true">#{{ rank }}</span>
							<img
								:src="`${POSTER_IMAGE_URL}${item.poster}`"
								:alt="''"
								width="342"
								height="513"
								loading="lazy"
								decoding="async"
								class="aspect-2/3 w-full object-cover">
						</div>
						<p class="line-clamp-2 text-center text-sm font-semibold leading-snug text-fg-default pt-2">
							{{ item.title }}
						</p>
						<p
							v-if="hasMeta(item)"
							:class="[metaLineClass, 'justify-center text-center']">
							<template v-if="ratingLabel(item) !== 'N/A'">
								<span :class="ratingInlineClass">
									<UIcon name="i-heroicons-star-20-solid" :class="starIconClass" aria-hidden="true" />
									<span :class="ratingTextClass">{{ ratingLabel(item) }}</span>
								</span>
							</template>
							<template v-if="yearLabel(item)">
								<span v-if="ratingLabel(item) !== 'N/A'" aria-hidden="true">·</span>
								<span>{{ yearLabel(item) }}</span>
							</template>
							<template v-if="firstGenre(item)">
								<span v-if="ratingLabel(item) !== 'N/A' || yearLabel(item)" aria-hidden="true">·</span>
								<span class="line-clamp-1">{{ firstGenre(item) }}</span>
							</template>
						</p>
					</div>
				</div>
			</div>
		</NuxtLink>
	</div>
</template>

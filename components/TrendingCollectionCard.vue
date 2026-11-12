<script setup lang="ts">
import { POSTER_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { formatReleaseDate } from "~/utils/formatReleaseDate";
import { trendingLeadingGenre } from "~/utils/trendingLeadingGenre";

const props = withDefaults(
	defineProps<{
		title: string;
		to: string;
		mediaType: MediaType | "mixed";
		items: TrendingItem[];
		pending?: boolean;
		variant?: "trending" | "upcoming";
		leadingGenreOverride?: string | null;
		leadingGenreCaption?: string;
		showReleaseDate?: boolean;
	}>(),
	{
		variant: "trending",
		leadingGenreOverride: undefined,
		leadingGenreCaption: undefined,
		showReleaseDate: false,
	},
);

const showRankBadges = computed(() => props.variant !== "upcoming");

function rankedWithPosters(limit: number) {
	const result: { item: TrendingItem; rank: number }[] = [];
	for (let i = 0; i < props.items.length && result.length < limit; i++) {
		const item = props.items[i]!;
		if (item.poster) {
			result.push({ item, rank: i + 1 });
		}
	}
	return result;
}

const topThreeRanked = computed(() => rankedWithPosters(3));
const topFiveRanked = computed(() => rankedWithPosters(5));

const showUpcomingBanner = computed(() =>
	props.variant === "upcoming" && topFiveRanked.value.length > 0,
);

const leadingGenre = computed(() => props.leadingGenreOverride ?? trendingLeadingGenre(props.items));

const leadingGenreCaption = computed(
	() => props.leadingGenreCaption
		?? (props.variant === "upcoming" ? "Highlighted genre:" : "Leading genre this week:"),
);

const headerIcon = computed(() =>
	props.variant === "upcoming"
		? "i-heroicons-calendar-days-20-solid"
		: "i-heroicons-arrow-trending-up",
);

const emptyMessage = computed(() =>
	props.variant === "upcoming" ? "Nothing coming soon right now." : "Nothing trending right now.",
);

const isEmpty = computed(() => props.items.length === 0);

const showSkeleton = computed(() => Boolean(props.pending) && isEmpty.value);

const emptyIcon = computed(() => {
	if (props.mediaType === "mixed") return "i-heroicons-calendar-days-20-solid";
	return props.mediaType === "tv" ? "i-heroicons-tv-20-solid" : "i-heroicons-film-20-solid";
});

function yearLabel(item: TrendingItem) {
	return item.releaseDate?.slice(0, 4) ?? (item.releaseYear ? String(item.releaseYear) : "");
}

function releaseDateBadgeLabel(item: TrendingItem) {
	return props.showReleaseDate ? formatReleaseDate(item.releaseDate) : "";
}

function ratingLabel(item: TrendingItem) {
	return formatMovieRating(item.rating);
}

function firstGenre(item: TrendingItem) {
	return item.genres[0] ?? "";
}

function hasMeta(item: TrendingItem) {
	if (props.showReleaseDate) {
		return true;
	}
	return ratingLabel(item) !== "N/A" || Boolean(yearLabel(item)) || Boolean(firstGenre(item));
}

const cardAriaLabel = computed(() => {
	const segments: string[] = [props.title];
	const genre = leadingGenre.value;
	if (genre) segments.push(`Leading genre ${genre}`);
	const previewCount = props.variant === "upcoming" ? 5 : 3;
	const topTitles = props.items.slice(0, previewCount).map((item, index) => {
		const prefix = showRankBadges.value ? `Number ${index + 1} ` : "";
		return `${prefix}${item.title}`;
	});
	if (topTitles.length > 0) segments.push(topTitles.join(". "));
	return segments.join(". ");
});

const cardShellClass =
	"group flex h-full min-h-0 w-full flex-col gap-3 rounded-[12px] border border-border-default bg-surface-elevated p-3 shadow-surface-overlay transition-colors hover:border-primary @min-[400px]:gap-4 @min-[400px]:p-4";

const rowShellClass = computed(() =>
	showRankBadges.value
		? "relative flex items-stretch gap-2.5 overflow-hidden rounded-[8px] border border-border-default bg-surface-inset p-2 pr-12"
		: "flex items-stretch gap-2.5 overflow-hidden rounded-[8px] border border-border-default bg-surface-inset p-2",
);

const rankFlagRowClass =
	"absolute right-0 top-0 z-10 flex items-center justify-center rounded-bl-[6px] bg-primary px-2.5 py-1 text-base font-bold leading-none text-inverted tabular-nums";

const rankFlagOnPosterClass =
	"absolute left-0 top-0 z-10 flex items-center justify-center rounded-br-[6px] bg-primary px-2.5 py-1 text-base font-bold leading-none text-inverted tabular-nums";

const ratingInlineClass = "inline-flex items-center gap-1";
const starIconClass = "block size-5 shrink-0 text-rating";
const ratingTextClass = "text-base leading-snug tabular-nums";
const metaLineClass = "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-base leading-snug text-fg-muted";
const releaseDateBadgeClass
	= "inline-flex w-fit rounded-md bg-primary px-2 py-1 text-base font-medium leading-snug text-inverted";
const itemMetaStackClass = "flex min-w-0 flex-col gap-1.5";
const itemMetaStackCenteredClass = "flex min-w-0 flex-col items-center gap-1.5";

/** Viewport bands (tablet full-width row): ≥1100 → 5, 950–1099 → 4, &lt;950 → 3 */
const upcomingBannerPosterGridClass
	= "grid min-h-0 min-w-0 flex-1 grid-cols-3 gap-2 min-[950px]:grid-cols-4 min-[1100px]:grid-cols-5";

function upcomingBannerPosterCellClass(index: number) {
	if (index === 4) return "hidden min-[1100px]:flex";
	if (index === 3) return "hidden min-[950px]:flex";
	return "";
}
</script>

<template>
	<div class="@container h-full min-h-0 w-full min-w-0">
		<div
			v-if="showSkeleton"
			:class="[cardShellClass, 'pointer-events-none']"
			aria-hidden="true">
			<template v-if="variant === 'upcoming'">
				<div class="hidden min-h-0 flex-1 items-stretch gap-4 @min-[700px]:flex">
					<div class="flex min-w-[12rem] max-w-sm shrink-0 flex-col gap-3">
						<USkeleton class="size-8 shrink-0 rounded" />
						<USkeleton class="h-9 w-full" />
						<div class="flex flex-wrap items-center gap-2">
							<USkeleton class="h-4 w-24" />
							<USkeleton class="h-7 w-28 rounded-full" />
						</div>
						<USkeleton class="size-9 shrink-0 rounded-full" />
					</div>
					<div :class="upcomingBannerPosterGridClass">
						<USkeleton
							v-for="n in 5"
							:key="`banner-${n}`"
							class="aspect-2/3 w-full rounded-[4px]"
							:class="upcomingBannerPosterCellClass(n - 1)" />
					</div>
				</div>
				<div class="@min-[700px]:hidden">
					<div class="flex items-start gap-2">
						<USkeleton class="size-6 shrink-0 rounded" />
						<USkeleton class="h-8 min-w-0 flex-1" />
						<USkeleton class="size-9 shrink-0 rounded-[8px]" />
					</div>
					<div class="mt-3 flex items-center gap-2">
						<USkeleton class="h-4 w-24" />
						<USkeleton class="h-7 w-28 rounded-full" />
					</div>
					<div class="mt-3 hidden flex-col gap-2 @max-[399px]:flex">
						<USkeleton v-for="n in 3" :key="n" class="h-20 w-full rounded-[8px]" />
					</div>
					<div class="mt-3 hidden grid-cols-3 gap-2 @min-[400px]:grid">
						<USkeleton v-for="n in 3" :key="`w-${n}`" class="aspect-2/3 w-full rounded-[4px]" />
					</div>
				</div>
			</template>
			<template v-else>
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
			</template>
		</div>

		<NuxtLink
			v-else
			:to="to"
			:aria-label="cardAriaLabel"
			:class="cardShellClass">
			<div
				v-if="showUpcomingBanner"
				class="hidden min-h-0 flex-1 items-stretch gap-4 @min-[700px]:flex">
				<div class="flex min-w-[12rem] max-w-sm shrink-0 flex-col gap-2">
					<UIcon
						:name="headerIcon"
						class="size-8 shrink-0 text-primary"
						aria-hidden="true" />
					<p class="text-2xl font-semibold leading-tight text-fg-default @min-[400px]:text-3xl">
						{{ title }}
					</p>
					<div
						v-if="leadingGenre"
						class="flex flex-wrap items-center gap-2">
						<span class="text-base font-medium text-fg-muted">{{ leadingGenreCaption }}</span>
						<UBadge
							variant="outline"
							color="neutral"
							size="md"
							class="border-primary/40 px-3 py-1 text-base font-medium text-fg-default"
							aria-hidden="true">
							{{ leadingGenre }}
						</UBadge>
					</div>
					<UButton
						variant="iconbutton"
						color="custom"
						size="icon"
						icon="i-heroicons-arrow-right-20-solid"
						tabindex="-1"
						aria-hidden="true"
						class="pointer-events-none mt-1 shrink-0 group-hover:border-primary group-hover:text-primary"
						:ui="{ leadingIcon: 'size-6' }" />
				</div>
				<div :class="upcomingBannerPosterGridClass">
					<div
						v-for="({ item }, index) in topFiveRanked"
						:key="`${item.mediaType}-${item.id}-banner`"
						class="flex min-w-0 flex-col gap-1.5"
						:class="upcomingBannerPosterCellClass(index)">
						<div class="relative overflow-hidden rounded-[6px] bg-surface-poster">
							<img
								:src="`${POSTER_IMAGE_URL}${item.poster}`"
								:alt="''"
								width="342"
								height="513"
								loading="lazy"
								decoding="async"
								class="aspect-2/3 w-full object-cover">
						</div>
						<p class="line-clamp-2 text-center text-base font-semibold leading-snug text-fg-default pt-1">
							{{ item.title }}
						</p>
						<div
							v-if="hasMeta(item) && showReleaseDate"
							:class="itemMetaStackCenteredClass">
							<p :class="[metaLineClass, 'justify-center text-center']">
								<span :class="ratingInlineClass">
									<UIcon name="i-heroicons-star-20-solid" :class="starIconClass" aria-hidden="true" />
									<span :class="ratingTextClass">{{ ratingLabel(item) }}</span>
								</span>
								<template v-if="firstGenre(item)">
									<span aria-hidden="true">·</span>
									<span class="line-clamp-1">{{ firstGenre(item) }}</span>
								</template>
							</p>
							<span
								v-if="releaseDateBadgeLabel(item)"
								:class="releaseDateBadgeClass">
								{{ releaseDateBadgeLabel(item) }}
							</span>
						</div>
						<p
							v-else-if="hasMeta(item)"
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

			<div
				class="flex items-start gap-2.5"
				:class="{ '@min-[700px]:hidden': showUpcomingBanner }">
				<UIcon
					:name="headerIcon"
					class="mt-1 size-8 shrink-0 text-primary"
					aria-hidden="true" />
				<div class="min-w-0 flex-1">
					<p class="text-2xl font-semibold leading-tight text-fg-default @min-[400px]:text-3xl">
						{{ title }}
					</p>
					<div
						v-if="leadingGenre"
						class="mt-2 flex flex-wrap items-center gap-2">
						<span class="text-base font-medium text-fg-muted">{{ leadingGenreCaption }}</span>
						<UBadge
							variant="outline"
							color="neutral"
							size="md"
							class="border-primary/40 px-3 py-1 text-base font-medium text-fg-default"
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
					:ui="{ leadingIcon: 'size-6' }" />
			</div>

			<div
				class="flex min-h-0 flex-1 flex-col gap-2"
				:class="{ '@min-[700px]:hidden': showUpcomingBanner }">
				<div v-if="isEmpty" class="flex items-center gap-3 py-2">
					<div
						class="flex aspect-2/3 w-14 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster lg:w-16"
						aria-hidden="true">
						<UIcon :name="emptyIcon" class="size-8 text-fg-muted opacity-60 md:size-10" />
					</div>
					<p class="text-base text-fg-muted">{{ emptyMessage }}</p>
				</div>

				<div
					v-else-if="topThreeRanked.length === 0"
					class="flex items-center gap-3 py-2">
					<div
						class="flex aspect-2/3 w-14 items-center justify-center overflow-hidden rounded-[4px] bg-surface-poster lg:w-16"
						aria-hidden="true">
						<UIcon :name="emptyIcon" class="size-8 text-fg-muted opacity-60 md:size-10" />
					</div>
					<p class="text-base text-fg-muted">No posters to preview.</p>
				</div>

				<!-- Narrow: poster, then text; rank flag top-right of row -->
				<div v-else class="flex flex-col gap-2 @min-[400px]:hidden">
					<div
						v-for="{ item, rank } in topThreeRanked"
						:key="`${item.mediaType}-${item.id}`"
						:class="rowShellClass">
						<span v-if="showRankBadges" :class="rankFlagRowClass" aria-hidden="true">#{{ rank }}</span>
						<div
							class="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-[4px] bg-surface-poster sm:w-[4.5rem]">
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
							<p class="line-clamp-2 text-base font-semibold leading-snug text-fg-default">{{ item.title }}
							</p>
							<div v-if="hasMeta(item) && showReleaseDate" :class="itemMetaStackClass">
								<p :class="metaLineClass">
									<span :class="ratingInlineClass">
										<UIcon name="i-heroicons-star-20-solid" :class="starIconClass"
											aria-hidden="true" />
										<span :class="ratingTextClass">{{ ratingLabel(item) }}</span>
									</span>
									<template v-if="firstGenre(item)">
										<span class="text-fg-muted" aria-hidden="true">·</span>
										<span>{{ firstGenre(item) }}</span>
									</template>
								</p>
								<span
									v-if="releaseDateBadgeLabel(item)"
									:class="releaseDateBadgeClass">
									{{ releaseDateBadgeLabel(item) }}
								</span>
							</div>
							<p v-else-if="hasMeta(item)" :class="metaLineClass">
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
					class="hidden min-h-0 flex-1 grid-cols-3 gap-2 @min-[400px]:grid"
					:class="{ '@min-[700px]:hidden': variant === 'upcoming' }">
					<div
						v-for="{ item, rank } in topThreeRanked"
						:key="`${item.mediaType}-${item.id}-grid`"
						class="flex min-w-0 flex-col gap-1.5">
						<div
							class="relative overflow-hidden rounded-[6px] bg-surface-poster"
							:class="showRankBadges && rank === 1 ? 'ring-1 ring-primary/50' : ''">
							<span v-if="showRankBadges" :class="rankFlagOnPosterClass" aria-hidden="true">#{{ rank }}</span>
							<img
								:src="`${POSTER_IMAGE_URL}${item.poster}`"
								:alt="''"
								width="342"
								height="513"
								loading="lazy"
								decoding="async"
								class="aspect-2/3 w-full object-cover">
						</div>
						<p class="line-clamp-2 text-center text-base font-semibold leading-snug text-fg-default pt-2">
							{{ item.title }}
						</p>
						<div
							v-if="hasMeta(item) && showReleaseDate"
							:class="itemMetaStackCenteredClass">
							<p :class="[metaLineClass, 'justify-center text-center']">
								<span :class="ratingInlineClass">
									<UIcon name="i-heroicons-star-20-solid" :class="starIconClass" aria-hidden="true" />
									<span :class="ratingTextClass">{{ ratingLabel(item) }}</span>
								</span>
								<template v-if="firstGenre(item)">
									<span aria-hidden="true">·</span>
									<span class="line-clamp-1">{{ firstGenre(item) }}</span>
								</template>
							</p>
							<span
								v-if="releaseDateBadgeLabel(item)"
								:class="releaseDateBadgeClass">
								{{ releaseDateBadgeLabel(item) }}
							</span>
						</div>
						<p
							v-else-if="hasMeta(item)"
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

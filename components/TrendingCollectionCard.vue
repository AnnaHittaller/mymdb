<script setup lang="ts">
import { POSTER_IMAGE_URL } from "~/constants/movie";
import { localizeTmdbGenreName } from "~/domain/locale/tmdbGenreLabels";
import type { MediaType } from "~/types/catalog";
import type { TrendingItem } from "~/types/catalog";
import {
	trendingItemFirstGenre,
	trendingItemHasMeta,
	trendingItemRatingLabel,
	trendingItemReleaseBadge,
	trendingItemYearLabel,
} from "~/utils/catalogDisplay";
import { trendingLeadingGenre } from "~/utils/trendingLeadingGenre";

const { t, locale } = useI18n();

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
		subtitle?: string;
		showReleaseDate?: boolean;
	}>(),
	{
		variant: "trending",
		leadingGenreOverride: undefined,
		leadingGenreCaption: undefined,
		subtitle: undefined,
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

const leadingGenre = computed(() => {
	const raw = props.leadingGenreOverride ?? trendingLeadingGenre(props.items);
	return raw ? localizeTmdbGenreName(raw, locale.value) : raw;
});

const showLeadingGenre = computed(
	() => props.variant !== "upcoming" && Boolean(leadingGenre.value),
);

const showSubtitle = computed(
	() => props.variant === "upcoming" && Boolean(props.subtitle),
);

const leadingGenreCaption = computed(
	() => props.leadingGenreCaption ?? t("home.leadingGenreCaption"),
);

const headerIcon = computed(() =>
	props.variant === "upcoming"
		? "i-heroicons-calendar-days-20-solid"
		: "i-heroicons-arrow-trending-up",
);

const emptyMessage = computed(() =>
	props.variant === "upcoming" ? t("home.nothingComingSoon") : t("home.nothingTrending"),
);

const isEmpty = computed(() => props.items.length === 0);

const showSkeleton = computed(() => Boolean(props.pending) && isEmpty.value);

const emptyIcon = computed(() => {
	if (props.mediaType === "mixed") return "i-heroicons-calendar-days-20-solid";
	return props.mediaType === "tv" ? "i-heroicons-tv-20-solid" : "i-heroicons-film-20-solid";
});

function itemShowsMeta(item: TrendingItem) {
	return trendingItemHasMeta(item, locale.value, props.showReleaseDate);
}

function itemMeta(item: TrendingItem) {
	return {
		rating: trendingItemRatingLabel(item),
		year: trendingItemYearLabel(item),
		genre: trendingItemFirstGenre(item, locale.value),
		releaseBadge: trendingItemReleaseBadge(item, locale.value, props.showReleaseDate),
		showReleaseDate: props.showReleaseDate,
	};
}

const cardAriaLabel = computed(() => {
	const segments: string[] = [props.title];
	if (showSubtitle.value && props.subtitle) segments.push(props.subtitle);
	const genre = leadingGenre.value;
	if (showLeadingGenre.value && genre) segments.push(`Leading genre ${genre}`);
	const previewCount = props.variant === "upcoming" ? 5 : 3;
	const topTitles = props.items.slice(0, previewCount).map((item, index) => {
		const prefix = showRankBadges.value ? `Number ${index + 1} ` : "";
		return `${prefix}${item.title}`;
	});
	if (topTitles.length > 0) segments.push(topTitles.join(". "));
	return segments.join(". ");
});

const cardShellClass = computed(() => [
	"group flex h-full min-h-0 w-full flex-col gap-3 rounded-[12px] border border-border-default bg-surface-elevated p-3 transition-colors hover:border-primary @min-[400px]:gap-4 @min-[400px]:p-4",
	props.variant === "upcoming" ? "shadow-coming-soon-glow" : "shadow-surface-overlay",
]);

const rowShellClass = computed(() =>
	showRankBadges.value
		? "relative flex items-stretch gap-2.5 overflow-hidden rounded-[8px] border border-border-default bg-surface-inset p-2 pr-12"
		: "flex items-stretch gap-2.5 overflow-hidden rounded-[8px] border border-border-default bg-surface-inset p-2",
);

const rankFlagRowClass =
	"absolute right-0 top-0 z-10 flex items-center justify-center rounded-bl-[6px] bg-primary px-2.5 py-1 text-base font-bold leading-none text-inverted tabular-nums";

const rankFlagOnPosterClass =
	"absolute left-0 top-0 z-10 flex items-center justify-center rounded-br-[6px] bg-primary px-2.5 py-1 text-base font-bold leading-none text-inverted tabular-nums";

const upcomingPosterCellClass = "flex min-h-0 min-w-0 flex-1 flex-col gap-1.5";

/** Viewport bands (tablet full-width row): ≥1100 → 5, 950–1099 → 4, &lt;950 → 3 */
const upcomingBannerPosterGridClass
	= "grid min-h-0 min-w-0 flex-1 grid-cols-3 items-stretch gap-2 min-[950px]:grid-cols-4 min-[1100px]:grid-cols-5";

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
						<USkeleton class="h-5 w-full max-w-xs" />
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
					<div class="mt-3">
						<USkeleton class="h-5 w-full max-w-sm" />
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
				<TrendingCollectionCardHeader
					layout="banner"
					:title="title"
					:header-icon="headerIcon"
					:show-subtitle="showSubtitle"
					:subtitle="subtitle"
					:show-leading-genre="showLeadingGenre"
					:leading-genre="leadingGenre ?? undefined"
					:leading-genre-caption="leadingGenreCaption" />
				<div :class="upcomingBannerPosterGridClass">
					<div
						v-for="({ item }, index) in topFiveRanked"
						:key="`${item.mediaType}-${item.id}-banner`"
						:class="[upcomingPosterCellClass, upcomingBannerPosterCellClass(index)]">
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
						<TrendingCollectionItemMeta
							v-if="itemShowsMeta(item)"
							v-bind="itemMeta(item)"
							align="center" />
					</div>
				</div>
			</div>

			<div :class="{ '@min-[700px]:hidden': showUpcomingBanner }">
				<TrendingCollectionCardHeader
					layout="compact"
					:title="title"
					:header-icon="headerIcon"
					:show-subtitle="showSubtitle"
					:subtitle="subtitle"
					:show-leading-genre="showLeadingGenre"
					:leading-genre="leadingGenre ?? undefined"
					:leading-genre-caption="leadingGenreCaption" />
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
							<TrendingCollectionItemMeta
								v-if="itemShowsMeta(item)"
								v-bind="itemMeta(item)"
								align="start" />
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
						:class="variant === 'upcoming' && showReleaseDate
							? upcomingPosterCellClass
							: 'flex min-w-0 flex-col gap-1.5'">
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
						<TrendingCollectionItemMeta
							v-if="itemShowsMeta(item)"
							v-bind="itemMeta(item)"
							align="center" />
					</div>
				</div>
			</div>
		</NuxtLink>
	</div>
</template>
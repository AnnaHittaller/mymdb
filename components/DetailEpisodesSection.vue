<script setup lang="ts">
import {
	BACKDROP_COMPACT_IMAGE_URL,
	STILL_IMAGE_URL,
} from "~/constants/movie";
import type { DetailEpisode, DetailSeasonResponse } from "~/types/detailEpisode";
import type { TvSeasonSummary } from "~/types/tv";
import {
	discoverFilterContent,
	discoverMenuSlots,
	discoverFilterTrigger,
} from "~/constants/discoverFilterUi";

const props = defineProps<{
	showId: string;
	seasons: TvSeasonSummary[];
}>();

const { t } = useI18n();

const selectableSeasons = computed(() =>
	props.seasons.filter((season) => season.season_number > 0),
);

const seasonItems = computed(() =>
	selectableSeasons.value.map((season) => ({
		label: season.name?.trim()
			? season.name
			: t("detail.seasonNumber", { number: season.season_number }),
		value: season.season_number,
	})),
);

const selectedSeason = ref<number | undefined>(undefined);
const episodesExpanded = ref(false);
const selectedEpisodeNumber = ref<number | null>(null);
const seasonPayload = ref<DetailSeasonResponse | null>(null);
const loadingSeason = ref<number | null>(null);
const loadError = ref<string | null>(null);
const seasonCache = new Map<number, DetailSeasonResponse>();
const didInitSeason = ref(false);

const {
	scrollEl: pillScrollEl,
	canScrollLeft: pillsCanScrollLeft,
	canScrollRight: pillsCanScrollRight,
	isGrabbing: pillsGrabbing,
	consumeDragClick: consumePillDragClick,
} = useHorizontalScrollStrip();

const isLoading = computed(() => loadingSeason.value !== null);

const activeEpisode = computed(
	(): DetailEpisode | null =>
		seasonPayload.value?.episodes.find(
			(episode) => episode.episode_number === selectedEpisodeNumber.value,
		) ?? null,
);

const episodeImageUrl = computed((): string | null => {
	const episode = activeEpisode.value;
	if (!episode) return null;
	if (episode.still_path) {
		return `${STILL_IMAGE_URL}${episode.still_path}`;
	}
	const backdrop = seasonPayload.value?.season_backdrop_path;
	if (backdrop) {
		return `${BACKDROP_COMPACT_IMAGE_URL}${backdrop}`;
	}
	return null;
});

const accordionTransitionClass =
	"grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0";

const pillScrollFadeLeftClass =
	"w-16 bg-gradient-to-r from-surface-inset from-0% via-surface-inset via-[62%] to-transparent to-100%";
const pillScrollFadeRightClass =
	"w-16 bg-gradient-to-l from-surface-inset from-0% via-surface-inset via-[62%] to-transparent to-100%";

function pickDefaultEpisode(episodes: DetailEpisode[]) {
	if (episodes.length === 0) {
		selectedEpisodeNumber.value = null;
		return;
	}
	const first =
		episodes.find((episode) => episode.name.trim().length > 0) ?? episodes[0];
	selectedEpisodeNumber.value = first?.episode_number ?? null;
}

function seasonNumberFrom(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (value && typeof value === "object" && "value" in value) {
		const raw = Number((value as { value: unknown }).value);
		return Number.isFinite(raw) ? raw : null;
	}
	return null;
}

async function loadSeason(seasonNumber: number) {
	const cached = seasonCache.get(seasonNumber);
	if (cached) {
		seasonPayload.value = cached;
		pickDefaultEpisode(cached.episodes);
		return;
	}

	loadError.value = null;
	loadingSeason.value = seasonNumber;
	try {
		const data = await $fetch<DetailSeasonResponse>(
			`/api/tv/${props.showId}/season/${seasonNumber}`,
		);
		if (seasonNumberFrom(selectedSeason.value) !== seasonNumber) return;
		seasonCache.set(seasonNumber, data);
		seasonPayload.value = data;
		pickDefaultEpisode(data.episodes);
	} catch {
		if (seasonNumberFrom(selectedSeason.value) === seasonNumber) {
			loadError.value = "Could not load episodes for this season.";
			if (!seasonPayload.value) {
				selectedEpisodeNumber.value = null;
			}
		}
	} finally {
		if (loadingSeason.value === seasonNumber) {
			loadingSeason.value = null;
		}
	}
}

watch(selectedSeason, (value) => {
	const seasonNumber = seasonNumberFrom(value);
	if (seasonNumber == null) return;
	void loadSeason(seasonNumber);
});

watch(
	seasonItems,
	(items) => {
		if (didInitSeason.value || items.length === 0) return;
		didInitSeason.value = true;
		selectedSeason.value = items[0]!.value;
	},
	{ immediate: true },
);

function toggleEpisodesPanel() {
	episodesExpanded.value = !episodesExpanded.value;
}

function selectEpisode(episodeNumber: number) {
	if (consumePillDragClick()) return;
	selectedEpisodeNumber.value = episodeNumber;
}

const seasonSelectUi = {
	base: `${discoverFilterTrigger} min-h-10 min-w-[10.5rem] w-max max-w-none [&>span]:whitespace-nowrap`,
	placeholder: "text-fg-default",
	content: `${discoverMenuSlots.content} w-max min-w-[var(--reka-select-trigger-width)] max-w-[min(100vw-2rem,24rem)]`,
	viewport: discoverMenuSlots.viewport,
	item: `${discoverMenuSlots.item} whitespace-nowrap`,
	itemLabel: "whitespace-nowrap",
	itemLeadingIcon: "shrink-0",
	itemTrailingIcon: "shrink-0",
};
</script>

<template>
	<section
		v-if="seasonItems.length > 0"
		class="@container relative flex min-w-0 flex-col rounded-xl border border-border-default bg-surface-overlay/70 px-4 pb-6 pt-4 backdrop-blur-md [contain:layout]">
		<div
			class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
			<Heading flush tier="section" class="mb-0 min-w-0 shrink-0">
				{{ $t("detail.episodes") }}
			</Heading>
			<USelect
				v-model="selectedSeason"
				:items="seasonItems"
				:content="discoverFilterContent"
				:placeholder="$t('detail.season')"
				:ui="seasonSelectUi"
				class="shrink-0" />
		</div>

		<div
			v-if="selectedSeason != null"
			:class="[
				accordionTransitionClass,
				episodesExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
			]">
			<div class="min-h-0 overflow-hidden">
				<div class="relative flex flex-col gap-4 pt-4">
					<div
						v-if="isLoading"
						class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-surface-overlay/60">
						<p class="text-base text-fg-muted">
							{{ $t("detail.loadingEpisodes") }}
						</p>
					</div>

					<p v-if="loadError && !seasonPayload" class="text-fg-muted">
						{{ loadError }}
					</p>

					<template v-if="seasonPayload && seasonPayload.episodes.length > 0">
						<div
							class="relative min-w-0 overflow-hidden rounded-lg border border-border-default bg-surface-inset">
							<div
								ref="pillScrollEl"
								role="region"
								:aria-label="$t('detail.episodesSeasonScroll')"
								tabindex="0"
								class="flex items-center gap-2.5 overflow-x-auto overscroll-x-contain px-2 py-1.5 scrollbar-none select-none touch-pan-x"
								:class="pillsGrabbing ? 'cursor-grabbing' : 'cursor-grab'">
								<UButton
									v-for="episode in seasonPayload.episodes"
									:key="episode.episode_number"
									type="button"
									size="md"
									class="shrink-0 rounded-full text-base"
									:color="
										selectedEpisodeNumber === episode.episode_number
											? 'primary'
											: 'neutral'
									"
									:variant="
										selectedEpisodeNumber === episode.episode_number
											? 'solid'
											: 'subtle'
									"
									:aria-current="
										selectedEpisodeNumber === episode.episode_number
											? 'true'
											: undefined
									"
									@click="selectEpisode(episode.episode_number)">
									{{ episode.episode_number }}. {{ episode.name }}
								</UButton>
							</div>
							<div
								v-if="pillsCanScrollLeft"
								class="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-start ps-1"
								:class="pillScrollFadeLeftClass"
								aria-hidden="true">
								<UIcon
									name="i-heroicons-chevron-left-20-solid"
									class="size-4 shrink-0 text-fg-muted" />
							</div>
							<div
								v-if="pillsCanScrollRight"
								class="pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center justify-end pe-1"
								:class="pillScrollFadeRightClass"
								aria-hidden="true">
								<UIcon
									name="i-heroicons-chevron-right-20-solid"
									class="size-4 text-fg-muted" />
							</div>
						</div>

						<div
							v-if="activeEpisode"
							class="rounded-lg border border-border-default bg-surface-inset/80 p-4">
							<div
								class="flex flex-col items-stretch gap-4 @min-[640px]:flex-row @min-[640px]:items-start @min-[640px]:gap-4">
								<div
									class="mx-auto aspect-video w-full max-w-[10.5rem] shrink-0 self-center overflow-hidden rounded-lg bg-surface-poster @min-[640px]:mx-0 @min-[640px]:w-[18rem] @min-[640px]:max-w-[18rem] @min-[640px]:self-start">
									<img
										v-if="episodeImageUrl"
										:src="episodeImageUrl"
										:alt="t('detail.episodeStillAlt', { name: activeEpisode.name })"
										width="780"
										height="439"
										loading="lazy"
										decoding="async"
										class="size-full object-cover">
									<div
										v-else
										class="flex size-full items-center justify-center text-lg text-fg-muted"
										role="img"
										:aria-label="t('detail.episodeNumberAria', { number: activeEpisode.episode_number })">
										{{ t("detail.episodeShort", { number: activeEpisode.episode_number }) }}
									</div>
								</div>
								<div
									class="flex w-full min-w-0 flex-col justify-start gap-2 @min-[640px]:flex-1">
									<h4 class="line-clamp-2 text-xl font-bold text-fg-default">
										{{ activeEpisode.episode_number }}.
										{{ activeEpisode.name }}
									</h4>
									<p
										v-if="activeEpisode.overview"
										class="text-pretty text-base leading-snug text-fg-default">
										{{ activeEpisode.overview }}
									</p>
									<p v-else class="text-fg-muted">
										{{ $t("detail.noSynopsis") }}
									</p>
								</div>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>

		<UButton
			v-if="selectedSeason != null"
			type="button"
			variant="iconbutton"
			color="custom"
			size="icon"
			square
			class="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 border border-border-default bg-surface-overlay shadow-sm"
			:icon="
				episodesExpanded
					? 'i-heroicons-chevron-up-20-solid'
					: 'i-heroicons-chevron-down-20-solid'
			"
			:aria-expanded="episodesExpanded"
			:aria-label="episodesExpanded ? $t('detail.collapseEpisodes') : $t('detail.expandEpisodes')"
			@click="toggleEpisodesPanel" />
	</section>
</template>

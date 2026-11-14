<script setup lang="ts">
import { POSTER_DETAIL_IMAGE_URL } from "~/constants/movie";
import type { MediaType } from "~/types/catalog";
import type { DetailCastMember } from "~/types/detailCast";
import type { DetailGalleryItem, DetailKeyword } from "~/types/detailGallery";
import type { Genre } from "~/types/movie";
import type { TrailerRef } from "~/types/trailer";
import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";
import type { DetailCollection } from "~/types/detailCollection";
import type { DetailFact, DetailJob } from "~/types/detailFact";
import type { TvSeasonSummary } from "~/types/tv";

const props = defineProps<{
	title: string;
	posterPath: string | null;
	genres: Genre[];
	tagline?: string | null;
	overview?: string | null;
	facts: DetailFact[];
	jobs: DetailJob[];
	keywords: DetailKeyword[];
	cast: DetailCastMember[];
	gallery: DetailGalleryItem[];
	mediaId: string;
	mediaType: MediaType;
	trailer?: TrailerRef | null;
	listPayload: ToggleMoviePayload | null;
	collection?: DetailCollection | null;
	episodeSeasons?: TvSeasonSummary[];
}>();

const {
	modalOpen: trailerModalOpen,
	activeTitle: trailerModalTitle,
	activeTrailer,
	loading: trailerLoading,
	openTrailer,
} = useTrailerPlayback();

const genreLine = computed(() => props.genres.map((genre) => genre.name).join(" · "));

const visibleKeywords = computed(() => props.keywords.slice(0, 20));

const keywordBrowseLinkClass =
	"inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary hover:[&_.keyword-badge]:bg-surface-hover";

function browseKeywordQuery(keyword: DetailKeyword) {
	return {
		path: "/browse",
		query: {
			keywords: encodeKeywordsParam([{ id: keyword.id, name: keyword.name }]),
		},
	}
}

const mobilePosterClass =
	"aspect-[2/3] h-auto max-h-[37.5rem] w-[min(100%,400px)] max-w-full object-cover";
const desktopPosterClass = "md:w-full md:max-h-[calc(100dvh-8.5rem)] md:max-w-none";

async function play(trailer: TrailerRef) {
	await openTrailer({
		id: props.mediaId,
		mediaType: props.mediaType,
		title: props.title,
		trailer,
	});
}

async function onWatchTrailer() {
	if (!props.trailer) return;
	await play(props.trailer);
}
</script>

<template>
	<div class="flex flex-col gap-10 md:gap-12">
		<div class="flex flex-col gap-1 max-md:gap-0 md:gap-3">
			<StackBackButton />
			<div
				class="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start md:gap-x-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-x-16">
			<aside
				class="flex w-full min-w-0 flex-col items-center gap-4 md:sticky md:top-4 md:items-stretch md:self-start">
				<div
					class="flex w-full justify-center max-md:-mx-4 max-md:w-[calc(100%+2*theme(spacing.4))] md:justify-start">
					<img
						v-if="posterPath"
						:src="`${POSTER_DETAIL_IMAGE_URL}${posterPath}`"
						:alt="title"
						width="780"
						height="1170"
						fetchpriority="high"
						decoding="async"
						:class="[mobilePosterClass, desktopPosterClass]">
					<div
						v-else
						:class="[mobilePosterClass, desktopPosterClass, 'bg-surface-poster']"
						role="img"
						:aria-label="title" />
				</div>
				<div class="flex w-full max-w-full flex-col gap-4 max-md:max-w-[min(100%,400px)] md:max-w-none">
					<WatchTrailerButton
						v-if="trailer"
						:id="mediaId"
						:media-type="mediaType"
						:title="title"
						:trailer="trailer"
						:loading="trailerLoading"
						block
						size="lg"
						class="text-lg"
						@play="onWatchTrailer" />
					<DetailPosterActions :payload="listPayload" />
				</div>
			</aside>

			<div class="flex min-w-0 flex-col gap-10 md:gap-12">
				<div class="flex flex-col gap-4">
					<Heading>{{ title }}</Heading>
					<p v-if="genreLine" class="text-xl font-bold text-fg-muted">
						{{ genreLine }}
					</p>
					<h3 v-if="tagline" class="text-xl">
						{{ tagline }}
					</h3>
					<p v-if="overview" class="max-w-3xl">
						{{ overview }}
					</p>
					<DetailMetaRow :facts="facts" :jobs="jobs" />
					<div v-if="visibleKeywords.length > 0" class="flex flex-col gap-2.5">
						<p class="text-lg font-semibold text-fg-default">
							Keywords
						</p>
						<div class="flex flex-wrap gap-2.5">
							<NuxtLink
								v-for="keyword in visibleKeywords"
								:key="keyword.id"
								:to="browseKeywordQuery(keyword)"
								:class="keywordBrowseLinkClass"
								:aria-label="`Browse titles tagged «${keyword.name}»`">
								<UBadge
									color="neutral"
									variant="subtle"
									size="lg"
									class="keyword-badge rounded-full text-base">
									{{ keyword.name }}
								</UBadge>
							</NuxtLink>
						</div>
					</div>
				</div>

				<DetailCastSection :cast="cast" />
				<DetailMediaStrip :items="gallery" />
				<DetailCollectionStrip
					v-if="collection?.parts.length"
					:collection="collection"
					:current-movie-id="mediaId" />
				<DetailEpisodesSection
					v-if="mediaType === 'tv' && episodeSeasons?.length"
					:show-id="mediaId"
					:seasons="episodeSeasons" />
			</div>
		</div>
		</div>

		<div class="min-w-0 w-full">
			<slot name="related" />
		</div>
	</div>
	<TrailerModal
		v-model:open="trailerModalOpen"
		:title="trailerModalTitle"
		:trailer="activeTrailer" />
</template>

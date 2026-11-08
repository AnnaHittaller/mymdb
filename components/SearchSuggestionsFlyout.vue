<script setup lang="ts">
import type { SearchMovie } from "~/composables/useMovieSearch";

const props = defineProps<{
	flyoutId: string;
	recents: string[];
	movies: SearchMovie[];
	suggestPending: boolean;
	showNoMatches: boolean;
	showMoviesSection: boolean;
}>();

const emit = defineEmits<{
	selectRecent: [query: string];
	selectMovie: [id: number];
	seeAll: [];
}>();
</script>

<template>
	<div
		:id="flyoutId"
		role="region"
		aria-label="Search suggestions"
		class="flyout-panel max-h-[min(85vh,40rem)] overflow-y-auto overscroll-contain p-3 max-sm:scrollbar-none sm:max-h-[min(70vh,28rem)] sm:p-4"
		@mousedown.prevent>
		<div
			class="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] sm:items-start sm:gap-4">
			<section v-if="recents.length > 0" class="min-w-0 sm:max-w-none">
				<div class="mb-2 flex min-h-8 items-center sm:min-h-9">
					<p class="text-xs font-medium tracking-wide text-fg-muted uppercase">
						Recent searches
					</p>
				</div>
				<ul class="flex flex-col gap-0.5" role="list">
					<li v-for="query in recents" :key="query" role="listitem">
						<button
							type="button"
							class="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-fg-default transition-colors hover:bg-surface-hover max-sm:text-base sm:py-1.5 sm:text-sm"
							@mousedown.prevent
							@click="emit('selectRecent', query)">
							<UIcon
								name="i-heroicons-magnifying-glass-20-solid"
								class="size-4 shrink-0 text-fg-muted"
								aria-hidden="true" />
							<span class="line-clamp-1">{{ query }}</span>
						</button>
					</li>
				</ul>
			</section>

			<section
				v-if="showMoviesSection"
				class="min-w-0"
				:class="recents.length > 0 ? '' : 'sm:col-span-full'">
				<div class="mb-2 flex min-h-8 items-center justify-between gap-2 sm:min-h-9">
					<p class="shrink-0 text-xs font-medium tracking-wide text-fg-muted uppercase">
						Movies
					</p>
					<UButton
						label="See all"
						type="button"
						color="primary"
						variant="solid"
						size="sm"
						class="shrink-0 text-fg-on-accent"
						@mousedown.prevent
						@click="emit('seeAll')" />
				</div>

				<p
					v-if="suggestPending && movies.length === 0"
					class="text-sm text-fg-muted max-sm:text-base">
					Loading suggestions…
				</p>
				<div
					v-else-if="movies.length > 0"
					class="flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-2"
					role="list">
					<div v-for="movie in movies" :key="movie.id" role="listitem">
						<SearchSuggestionMovieCard
							:movie="movie"
							@select="emit('selectMovie', movie.id)" />
					</div>
				</div>
				<p
					v-else-if="showNoMatches"
					class="text-sm text-fg-muted max-sm:text-base">
					No quick matches for that title.
				</p>
			</section>
		</div>
	</div>
</template>

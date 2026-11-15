<script setup lang="ts">
import type { TrendingItem } from "~/types/catalog";
import { fetchTrendingCatalogPage } from "~/composables/useTrendingCatalog";

definePageMeta({
	layout: "default",
});

const page = ref(1);
const items = ref<TrendingItem[]>([]);
const hasMore = ref(false);
const pending = ref(false);
const error = ref(false);

async function loadPage(requestedPage: number) {
	pending.value = true;
	error.value = false;
	try {
		const results = await fetchTrendingCatalogPage("movie", requestedPage);
		hasMore.value = results.length >= 20;
		const visible = results.filter((item) => item.poster);
		if (requestedPage === 1) {
			items.value = visible;
			return;
		}
		const seen = new Set(items.value.map((item) => item.id));
		items.value = [...items.value, ...visible.filter((item) => !seen.has(item.id))];
	} catch {
		if (requestedPage === 1) items.value = [];
		error.value = true;
	} finally {
		pending.value = false;
	}
}

onMounted(() => {
	void loadPage(1);
});

function loadMore() {
	if (pending.value || !hasMore.value) return;
	page.value += 1;
	void loadPage(page.value);
}

function toCardMovie(item: TrendingItem) {
	return {
		id: item.id,
		mediaType: item.mediaType,
		title: item.title,
		poster: item.poster,
		rating: item.rating,
		genres: item.genres,
	};
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-1 max-md:gap-0">
			<StackBackButton />
			<Heading class="pb-8 max-md:pb-4">{{ $t('home.trendingMovies') }}</Heading>
		</div>
		<div class="flex flex-col items-stretch">
			<p v-if="error && items.length === 0" class="text-lg">{{ $t('home.loadTrendingMoviesError') }}</p>
			<p v-else-if="pending && items.length === 0" class="text-lg">{{ $t('common.loading') }}</p>
			<div v-if="items.length > 0" class="movie-grid">
				<MovieCard
					v-for="item in items"
					:key="`movie-${item.id}`"
					:movie="toCardMovie(item)"
					media-type="movie" />
			</div>
			<UButton
				v-if="items.length > 0 && hasMore"
				:label="$t('common.loadMore')"
				size="xl"
				class="mt-14 mb-8 self-center"
				:loading="pending && page > 1"
				:disabled="pending"
				@click="loadMore" />
		</div>
	</div>
</template>

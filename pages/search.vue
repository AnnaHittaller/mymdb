<script setup lang="ts">
import type { SearchMovie } from "~/composables/useMovieSearch";

definePageMeta({
	middleware: "auth",
});

const route = useRoute();

const q = computed(() => String(route.query.q ?? "").trim());

const page = ref(1);
const movies = ref<SearchMovie[]>([]);
const totalPages = ref(0);

watch(q, () => {
	page.value = 1;
	movies.value = [];
	totalPages.value = 0;
});

const { data, status, error } = await useAsyncData(
	"movie-search-results",
	async () => {
		const requestedQ = q.value;
		if (!requestedQ) return null;
		const requestedPage = page.value;
		const response = await $fetch<{
			results: SearchMovie[]
			total_pages: number
		}>("/api/catalog/search", {
			query: {
				query: requestedQ,
				page: requestedPage,
			},
		});
		return {
			results: response.results,
			total_pages: response.total_pages,
			requestedPage,
			requestedQ,
		};
	},
	{ watch: [q, page] },
);

watch(data, (payload) => {
	if (!payload) {
		if (!q.value) {
			movies.value = [];
			totalPages.value = 0;
		}
		return;
	}
	if (payload.requestedQ !== q.value || payload.requestedPage !== page.value) return;

	const visible = payload.results.filter((movie) => movie.poster);
	totalPages.value = payload.total_pages;

	if (payload.requestedPage === 1) {
		movies.value = visible;
		return;
	}

	const seen = new Set(movies.value.map((movie) => `${movie.mediaType}-${movie.id}`));
	movies.value = [
		...movies.value,
		...visible.filter((movie) => !seen.has(`${movie.mediaType}-${movie.id}`)),
	];
}, { immediate: true });

const pending = computed(() => status.value === "pending");
const hasMore = computed(() => page.value < totalPages.value);

function loadMore() {
	if (pending.value || !hasMore.value) return;
	page.value += 1;
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading v-if="q">Results for “{{ q }}”</Heading>
			<Heading v-else>Search</Heading>
			<p v-if="!q" class="text-lg text-fg-muted">
				Use the search bar above to find movies and shows.
			</p>
		</div>
		<div v-if="q" class="flex flex-col items-stretch">
			<p v-if="error && movies.length === 0" class="text-lg">
				Couldn't load search results.
			</p>
			<p v-else-if="pending && movies.length === 0" class="text-lg">
				Loading results…
			</p>
			<p v-else-if="movies.length === 0" class="text-lg">
				No matching results can be found.
			</p>
			<div v-if="movies.length > 0" class="movie-grid">
				<MovieCard
					v-for="movie in movies"
					:key="`${movie.mediaType}-${movie.id}`"
					:movie="movie"
					:media-type="movie.mediaType"
					show-media-type />
			</div>
			<UButton
				v-if="movies.length > 0 && hasMore"
				label="Load more"
				size="xl"
				class="mt-14 mb-8 self-center"
				:loading="pending && page > 1"
				:disabled="pending"
				@click="loadMore"
			/>
		</div>
	</div>
</template>

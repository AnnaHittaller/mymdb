<script setup lang="ts">
type DiscoverMovie = {
	id: number
	title: string
	popularity: number
	poster: string | null
	backdrop: string | null
	genres: string[]
	rating: number
}

type GenreList = {
	genres: { id: number, name: string }[]
}

definePageMeta({
	middleware: "auth",
})

const ratingItems = [
	{ label: "Any rating", value: 0 },
	{ label: "8+", value: 8 },
	{ label: "7+", value: 7 },
	{ label: "6+", value: 6 },
	{ label: "5+", value: 5 },
	{ label: "4+", value: 4 },
	{ label: "3+", value: 3 },
	{ label: "2+", value: 2 },
]

const page = ref(1)
const rating = ref(0)
const genreIds = ref<number[]>([])
const movies = ref<DiscoverMovie[]>([])
const hasMore = ref(false)

const { data: genreList } = await useFetch<GenreList>("/api/movies/genres")
const genreItems = computed(() =>
	(genreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
)

const genreKey = computed(() => genreIds.value.join(","))
const filtersActive = computed(() => rating.value > 0 || genreIds.value.length > 0)

watch([rating, genreKey], () => {
	page.value = 1
	movies.value = []
	hasMore.value = false
})

const { data, status, error } = await useAsyncData(
	"discover-movies",
	async () => {
		const requestedPage = page.value
		const requestedRating = rating.value
		const requestedGenres = genreKey.value
		const results = await $fetch<DiscoverMovie[]>("/api/movies/discover", {
			query: {
				page: requestedPage,
				rating: requestedRating,
				genres: requestedGenres,
			},
		})
		return { results, requestedPage, requestedRating, requestedGenres }
	},
	{ watch: [page, rating, genreKey] },
)

watch(data, (payload) => {
	if (!payload) return
	if (
		payload.requestedPage !== page.value
		|| payload.requestedRating !== rating.value
		|| payload.requestedGenres !== genreKey.value
	) return
	const visible = payload.results.filter((movie) => movie.poster)
	hasMore.value = payload.results.length >= 20
	if (payload.requestedPage === 1) {
		movies.value = visible
		return
	}
	const seen = new Set(movies.value.map((movie) => movie.id))
	movies.value = [...movies.value, ...visible.filter((movie) => !seen.has(movie.id))]
}, { immediate: true })

const pending = computed(() => status.value === "pending")

function clearFilters() {
	rating.value = 0
	genreIds.value = []
}

function loadMore() {
	if (pending.value || !hasMore.value) return
	page.value += 1
}
</script>

<template>
	<div>
		<div class="flex flex-col gap-4 pb-8">
			<Heading>Discover new movies</Heading>
			<div class="flex flex-wrap gap-4 items-center">
				<USelect v-model="rating" :items="ratingItems" class="w-full sm:w-48" />
				<USelectMenu
					v-model="genreIds"
					:items="genreItems"
					value-key="value"
					multiple
					placeholder="Genres"
					class="w-full sm:w-72"
				/>
				<UButton v-if="filtersActive" label="Clear" variant="outline" @click="clearFilters" />
			</div>
		</div>
		<div class="flex flex-col items-stretch">
			<p v-if="error && movies.length === 0" class="text-lg">Couldn't load movies.</p>
			<p v-else-if="pending && movies.length === 0" class="text-lg">Loading movies…</p>
			<p v-else-if="movies.length === 0" class="text-lg">No movies match these filters.</p>
			<div v-if="movies.length > 0" class="movie-grid">
				<MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
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

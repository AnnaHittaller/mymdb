<script setup lang="ts">
import { useCurrentUser } from "vuefire"
import type { TrendingItem } from "~/types/catalog"
import { fetchUpcomingCatalogPage } from "~/composables/useUpcomingCatalog"
import { useFavoriteGenreHints } from "~/composables/useFavoriteGenreHints"

definePageMeta({
	layout: "default",
})

const user = useCurrentUser()
const { moviesInList, favoritesListId } = useUserDocument()
const favorites = computed(() => moviesInList(favoritesListId))
const genreHints = useFavoriteGenreHints(favorites)

const personalizationReady = ref(false)
onMounted(() => {
	personalizationReady.value = true
})

const activeHints = computed(() => (personalizationReady.value && user.value ? genreHints.value : null))
const pageTitle = computed(() => (activeHints.value ? "Coming soon for you" : "Coming soon"))

const page = ref(1)
const items = ref<TrendingItem[]>([])
const hasMore = ref(false)
const pending = ref(false)
const error = ref(false)

async function loadPage(requestedPage: number) {
	pending.value = true
	error.value = false
	try {
		const results = await fetchUpcomingCatalogPage(requestedPage, activeHints.value)
		hasMore.value = results.length >= 20
		const visible = results.filter((item) => item.poster)
		if (requestedPage === 1) {
			items.value = visible
			return
		}
		const seen = new Set(items.value.map((item) => `${item.mediaType}-${item.id}`))
		items.value = [
			...items.value,
			...visible.filter((item) => !seen.has(`${item.mediaType}-${item.id}`)),
		]
	} catch {
		if (requestedPage === 1) items.value = []
		error.value = true
	} finally {
		pending.value = false
	}
}

watch(activeHints, () => {
	page.value = 1
	void loadPage(1)
}, { flush: "post" })

onMounted(() => {
	void loadPage(1)
})

function loadMore() {
	if (pending.value || !hasMore.value) return
	page.value += 1
	void loadPage(page.value)
}

function toCardMovie(item: TrendingItem) {
	return {
		id: item.id,
		mediaType: item.mediaType,
		title: item.title,
		poster: item.poster,
		rating: item.rating,
		genres: item.genres,
	}
}
</script>

<template>
	<div>
		<Heading class="pb-8">{{ pageTitle }}</Heading>
		<p v-if="activeHints?.highlightGenre" class="pb-6 text-lg text-fg-muted">
			Based on your taste for {{ activeHints.highlightGenre }}.
		</p>
		<div class="flex flex-col items-stretch">
			<p v-if="error && items.length === 0" class="text-lg">Couldn't load upcoming titles.</p>
			<p v-else-if="pending && items.length === 0" class="text-lg">Loading…</p>
			<div v-if="items.length > 0" class="movie-grid">
				<MovieCard
					v-for="item in items"
					:key="`${item.mediaType}-${item.id}`"
					:movie="toCardMovie(item)"
					:media-type="item.mediaType" />
			</div>
			<UButton
				v-if="items.length > 0 && hasMore"
				label="Load more"
				size="xl"
				class="mt-14 mb-8 self-center"
				:loading="pending && page > 1"
				:disabled="pending"
				@click="loadMore" />
		</div>
	</div>
</template>

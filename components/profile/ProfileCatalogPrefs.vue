<script setup lang="ts">
import { discoverFilterContent } from "~/constants/discoverFilterUi"
import {
	MAX_CATALOG_GENRE_PREFS,
	MAX_CATALOG_KEYWORD_PREFS,
	normalizeCatalogPrefs,
} from "~/domain/user-document/catalogPrefs"
import { PROFILE_WATCH_PROVIDER_LIMIT, WATCH_PROVIDERS_CLIENT_REV } from "~/constants/watchProviders"
import type { TmdbWatchProvider } from "~/server/utils/tmdbWatchProviders"
import { useCurrentUser } from "vuefire"

type GenreList = {
	genres: { id: number, name: string }[]
}

type TmdbCountry = {
	iso_3166_1: string
	english_name: string
}

type CountryItem = {
	label: string
	value: string | null
}

type WatchProvidersResponse = {
	providers: TmdbWatchProvider[]
}

const { t, locale } = useI18n()

const filterMenuControl = { highlightOnHover: true }

const user = useCurrentUser()
const userDocument = useUserDocument()
const { catalogPrefs, setCatalogPrefs } = userDocument

const { data: countries } = useFetch<TmdbCountry[]>("/api/configuration/countries", {
	key: "tmdb-countries",
})
const { data: movieGenreList } = useFetch<GenreList>("/api/movies/genres", {
	key: computed(() => `profile-movie-genres-${locale.value}`),
	query: computed(() => ({ language: locale.value })),
	watch: [locale],
})
const { data: tvGenreList } = useFetch<GenreList>("/api/tv/genres", {
	key: computed(() => `profile-tv-genres-${locale.value}`),
	query: computed(() => ({ language: locale.value })),
	watch: [locale],
})

const countryItems = computed((): CountryItem[] => {
	const fromApi = (countries.value ?? [])
		.map((country) => ({
			label: country.english_name,
			value: country.iso_3166_1,
		}))
		.sort((left, right) => left.label.localeCompare(right.label, "en", { sensitivity: "base" }))
	return [{ label: t("common.noCountry"), value: null }, ...fromApi]
})

const movieGenreItems = computed(() =>
	(movieGenreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
)
const tvGenreItems = computed(() =>
	(tvGenreList.value?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.id })),
)

const selectedRegion = ref<string | null>(null)
const selectedMovieGenres = ref<number[]>([])
const selectedTvGenres = ref<number[]>([])
const selectedProviderIds = ref<number[]>([])
const selectedKeywordIds = ref<number[]>([])
const keywordIdsForUi = computed(() => selectedKeywordIds.value ?? [])
const keywordLabels = ref<Record<number, string>>({})

const watchProviders = ref<WatchProvidersResponse | null>(null)
const providersLoading = ref(false)
const providersError = ref(false)

watch(
	catalogPrefs,
	(prefs) => {
		const normalized = normalizeCatalogPrefs(prefs)
		selectedRegion.value = normalized.region
		selectedMovieGenres.value = [...normalized.movieGenreIds]
		selectedTvGenres.value = [...normalized.tvGenreIds]
		selectedProviderIds.value = [...normalized.watchProviderIds]
		selectedKeywordIds.value = [...normalized.keywordIds]
		void resolveKeywordLabels(normalized.keywordIds)
	},
	{ immediate: true },
)

async function loadWatchProviders(region: string | null) {
	if (!region) {
		watchProviders.value = null
		providersError.value = false
		providersLoading.value = false
		return
	}
	providersLoading.value = true
	providersError.value = false
	try {
		watchProviders.value = await $fetch<WatchProvidersResponse>("/api/watch/providers", {
			query: { watch_region: region, rev: WATCH_PROVIDERS_CLIENT_REV },
		})
	} catch {
		watchProviders.value = null
		providersError.value = true
	} finally {
		providersLoading.value = false
	}
}

watch(
	selectedRegion,
	(region) => {
		void loadWatchProviders(region)
	},
	{ immediate: true },
)

const {
	searchTerm: keywordSearchTerm,
	suggestions: keywordSuggestions,
	inputKey: keywordInputKey,
	resetKeywordInput,
} = useKeywordSuggestionInput(keywordIdsForUi)

async function resolveKeywordLabels(ids: number[]) {
	if (!ids.length) {
		keywordLabels.value = {}
		return
	}
	const next: Record<number, string> = { ...keywordLabels.value }
	for (const id of ids) {
		if (next[id]) continue
		try {
			const response = await $fetch<{ id: number, name: string }>(`/api/keywords/${id}`)
			next[id] = response.name
		} catch {
			/* keep placeholder */
		}
	}
	keywordLabels.value = next
}

function keywordChipLabel(id: number) {
	return keywordLabels.value[id] ?? t("common.keywordId", { id })
}

async function onRegionChange(value: string | null) {
	if (!user.value) return
	selectedRegion.value = value
	selectedProviderIds.value = []
	await setCatalogPrefs({ region: value, watchProviderIds: [] })
}

async function onMovieGenresChange(value: number[] | undefined) {
	if (!user.value) return
	const next = (value ?? []).slice(0, MAX_CATALOG_GENRE_PREFS)
	selectedMovieGenres.value = next
	await setCatalogPrefs({ movieGenreIds: next })
}

async function onTvGenresChange(value: number[] | undefined) {
	if (!user.value) return
	const next = (value ?? []).slice(0, MAX_CATALOG_GENRE_PREFS)
	selectedTvGenres.value = next
	await setCatalogPrefs({ tvGenreIds: next })
}

async function onProviderToggle(providerId: number, checked: boolean) {
	if (!user.value) return
	const next = checked
		? [...selectedProviderIds.value, providerId]
		: selectedProviderIds.value.filter((id) => id !== providerId)
	selectedProviderIds.value = next
	await setCatalogPrefs({ watchProviderIds: next })
}

async function onKeywordPick(id: number | undefined) {
	if (!user.value || id === undefined) return
	if (selectedKeywordIds.value.includes(id)) return
	if (selectedKeywordIds.value.length >= MAX_CATALOG_KEYWORD_PREFS) return
	const picked = keywordSuggestions.value.find((entry) => entry.value === id)
	const nextIds = [...selectedKeywordIds.value, id]
	selectedKeywordIds.value = nextIds
	if (picked) keywordLabels.value = { ...keywordLabels.value, [id]: picked.label }
	resetKeywordInput()
	await setCatalogPrefs({ keywordIds: nextIds })
}

async function removeKeyword(id: number) {
	if (!user.value) return
	const nextIds = selectedKeywordIds.value.filter((entry) => entry !== id)
	selectedKeywordIds.value = nextIds
	const { [id]: _removed, ...rest } = keywordLabels.value
	keywordLabels.value = rest
	await setCatalogPrefs({ keywordIds: nextIds })
}
</script>

<template>
	<div class="space-y-8">
		<p class="text-base text-fg-muted">
			{{ $t('profile.catalogIntro') }}
		</p>

		<div class="grid w-full min-w-0 gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
			<UFormField :label="$t('profile.movieGenres')" name="catalogMovieGenres">
				<USelectMenu
					:model-value="selectedMovieGenres"
					:items="movieGenreItems"
					value-key="value"
					multiple
					:placeholder="$t('common.anyGenres')"
					searchable
					:content="discoverFilterContent"
					v-bind="filterMenuControl"
					class="w-full min-w-0"
					@update:model-value="onMovieGenresChange">
					<template #default>
						<span class="truncate text-fg-default">
							{{
								selectedMovieGenres.length
									? $t('common.selectedCount', { count: selectedMovieGenres.length })
									: $t('common.anyGenres')
							}}
						</span>
					</template>
				</USelectMenu>
			</UFormField>
			<UFormField :label="$t('profile.tvGenres')" name="catalogTvGenres">
				<USelectMenu
					:model-value="selectedTvGenres"
					:items="tvGenreItems"
					value-key="value"
					multiple
					:placeholder="$t('common.anyGenres')"
					searchable
					:content="discoverFilterContent"
					v-bind="filterMenuControl"
					class="w-full min-w-0"
					@update:model-value="onTvGenresChange">
					<template #default>
						<span class="truncate text-fg-default">
							{{
								selectedTvGenres.length
									? $t('common.selectedCount', { count: selectedTvGenres.length })
									: $t('common.anyGenres')
							}}
						</span>
					</template>
				</USelectMenu>
			</UFormField>
			<UFormField :label="$t('profile.keywords')" name="catalogKeywords">
				<UInputMenu
					:key="keywordInputKey"
					v-model:search-term="keywordSearchTerm"
					:model-value="undefined"
					:items="keywordSuggestions"
					value-key="value"
					ignore-filter
					:placeholder="$t('profile.searchKeywords')"
					:content="discoverFilterContent"
					v-bind="filterMenuControl"
					class="w-full min-w-0"
					:disabled="keywordIdsForUi.length >= MAX_CATALOG_KEYWORD_PREFS"
					@update:model-value="onKeywordPick" />
			</UFormField>
		</div>
		<div class="space-y-2">
			<div v-if="keywordIdsForUi.length" class="flex flex-wrap gap-2">
				<DiscoverFilterChip
					v-for="id in keywordIdsForUi"
					:key="id"
					:label="keywordChipLabel(id)"
					:remove-label="$t('common.removeKeyword', { name: keywordChipLabel(id) })"
					@remove="removeKeyword(id)" />
			</div>
			<p class="text-sm text-fg-muted">
				{{
					$t('profile.prefsFootnote', {
						genres: MAX_CATALOG_GENRE_PREFS,
						keywords: MAX_CATALOG_KEYWORD_PREFS,
					})
				}}
			</p>
		</div>

		<div class="space-y-4 border-t border-border-default pt-6">
			<div class="space-y-1">
				<p class="text-lg font-semibold text-fg-default">{{ $t('profile.myStreaming') }}</p>
				<p class="text-base text-fg-muted">
					{{ $t('profile.streamingIntro') }}
				</p>
			</div>
			<UFormField :label="$t('profile.countryForServices')" name="catalogRegion">
				<USelectMenu
					:model-value="selectedRegion"
					:items="countryItems"
					value-key="value"
					:placeholder="$t('profile.searchCountry')"
					searchable
					:content="discoverFilterContent"
					v-bind="filterMenuControl"
					class="w-full min-w-0 max-w-md"
					@update:model-value="onRegionChange" />
			</UFormField>
			<p v-if="!selectedRegion" class="text-base text-fg-muted">{{ $t('profile.chooseCountry') }}</p>
			<p v-else-if="providersLoading" class="text-base text-fg-muted">{{ $t('profile.loadingServices') }}</p>
			<p v-else-if="providersError" class="text-base text-fg-muted">
				{{ $t('profile.servicesError') }}
			</p>
			<div v-else-if="watchProviders?.providers?.length" class="flex flex-wrap gap-2">
				<button
					v-for="provider in watchProviders.providers"
					:key="provider.provider_id"
					type="button"
					class="cursor-pointer rounded-md border px-3 py-2 text-base transition-colors"
					:class="selectedProviderIds.includes(provider.provider_id)
						? 'border-primary bg-primary/10 text-fg-default'
						: 'border-border-default bg-surface-inset text-fg-muted hover:border-primary/50'"
					:aria-pressed="selectedProviderIds.includes(provider.provider_id)"
					@click="onProviderToggle(
						provider.provider_id,
						!selectedProviderIds.includes(provider.provider_id),
					)">
					{{ provider.provider_name }}
				</button>
			</div>
			<p v-else class="text-base text-fg-muted">{{ $t('profile.noServices') }}</p>
			<p class="text-sm text-fg-muted">
				{{ $t('profile.streamingFootnote', { limit: PROFILE_WATCH_PROVIDER_LIMIT }) }}
			</p>
		</div>
	</div>
</template>

import type { MediaType } from '~/types/catalog'
import type { TmdbMediaRow } from '~/server/utils/tmdbNormalize'
import { toCatalogCard } from '~/server/utils/tmdbNormalize'
import { buildTmdbDiscoverMovieParams } from '~/server/utils/tmdbDiscoverQuery'
import { buildTmdbDiscoverTvParams } from '~/server/utils/tmdbDiscoverTvQuery'
import { fetchTmdbKeywords } from '~/server/utils/tmdbKeywords'
import { formatKeywordIdsForDiscover } from '~/utils/tmdbDiscoverKeywords'

export type RelatedCard = {
	id: number
	mediaType: MediaType
	title: string
	poster: string | null
	rating: number
	genres: string[]
}

const RELATED_CAP = 20
const RECOMMENDATION_SEGMENT_MAX = 8

function discoverSegmentCaps(): { keyword: number, genre: number } {
	const discoverTotal = RELATED_CAP - RECOMMENDATION_SEGMENT_MAX
	const keyword = Math.ceil(discoverTotal / 2)
	const genre = Math.floor(discoverTotal / 2)
	return { keyword, genre }
}

type TmdbRecommendationRow = {
	id: number
	title?: string
	name?: string
	poster_path: string | null
	vote_average: number
	genre_ids: number[]
}

function toRelatedCard(
	item: TmdbRecommendationRow,
	mediaType: MediaType,
	genreNames: Map<number, string>,
): RelatedCard {
	const title = mediaType === 'tv'
		? (item.name ?? item.title ?? '')
		: (item.title ?? item.name ?? '')
	return {
		id: item.id,
		mediaType,
		title,
		poster: item.poster_path,
		rating: item.vote_average,
		genres: (item.genre_ids ?? []).flatMap((id) => {
			const name = genreNames.get(id)
			return name ? [name] : []
		}),
	}
}

function discoverRowToRelated(
	item: TmdbMediaRow,
	mediaType: MediaType,
	genreNames: Map<number, string>,
): RelatedCard {
	const card = toCatalogCard(item, mediaType, genreNames)
	return {
		id: card.id,
		mediaType: card.mediaType,
		title: card.title,
		poster: card.poster,
		rating: card.rating,
		genres: card.genres,
	}
}

type MergeSegment = {
	items: RelatedCard[]
	max: number
}

function mergeRelated(
	segments: MergeSegment[],
	sourceId: number,
	max: number,
): RelatedCard[] {
	const seen = new Set<string>()
	const out: RelatedCard[] = []

	for (const segment of segments) {
		let addedFromSegment = 0
		for (const item of segment.items) {
			if (out.length >= max) return out
			if (addedFromSegment >= segment.max) break
			if (item.id === sourceId || !item.poster) continue
			const key = `${item.mediaType}-${item.id}`
			if (seen.has(key)) continue
			seen.add(key)
			out.push(item)
			addedFromSegment += 1
		}
	}

	return out
}

type DiscoverFilters = {
	keywords: string
	genres: string
}

async function fetchDiscover(
	media: MediaType,
	filters: DiscoverFilters,
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	language: string,
): Promise<TmdbMediaRow[]> {
	if (!filters.keywords && !filters.genres) return []

	const params = (media === 'tv' ? buildTmdbDiscoverTvParams : buildTmdbDiscoverMovieParams)({
		page: 1,
		keywords: filters.keywords,
		genres: filters.keywords ? '' : filters.genres,
	}, language)

	const response = await $fetch<{ results: TmdbMediaRow[] }>(
		`${config.apiBaseUrl}/discover/${media}?${params.toString()}`,
		{ method: 'GET', headers },
	)

	return response.results ?? []
}

async function fetchTmdbRecommendations(
	media: MediaType,
	id: string,
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	language: string,
): Promise<TmdbRecommendationRow[]> {
	const response = await $fetch<{ results: TmdbRecommendationRow[] }>(
		`${config.apiBaseUrl}/${media}/${id}/recommendations?language=${encodeURIComponent(language)}&page=1`,
		{ method: 'GET', headers },
	)
	return response.results ?? []
}

function mapDiscoverRows(
	rows: TmdbMediaRow[],
	mediaType: MediaType,
	genreNames: Map<number, string>,
): RelatedCard[] {
	return rows
		.filter((item) => item.poster_path)
		.map((item) => discoverRowToRelated(item, mediaType, genreNames))
}

export async function buildPlainRelatedTitles(options: {
	media: MediaType
	id: string
	language?: string
}): Promise<RelatedCard[]> {
	const config = useRuntimeConfig()
	const language = options.language ?? "en-US"
	const headers = {
		accept: 'application/json',
		Authorization: `Bearer ${config.apiBearerToken}`,
	}
	const sourceId = Number(options.id)
	const [recommendationRows, genreMap] = await Promise.all([
		fetchTmdbRecommendations(options.media, options.id, config, headers, language),
		options.media === 'tv' ? getTvGenreNameMap(language) : getMovieGenreNameMap(language),
	])

	const recommendations = recommendationRows
		.filter((item) => item.poster_path)
		.map((item) => toRelatedCard(item, options.media, genreMap))

	return mergeRelated(
		[{ items: recommendations, max: RELATED_CAP }],
		sourceId,
		RELATED_CAP,
	)
}

export async function buildBlendedRelatedTitles(options: {
	media: MediaType
	id: string
	language?: string
}): Promise<RelatedCard[]> {
	const config = useRuntimeConfig()
	const language = options.language ?? "en-US"
	const headers = {
		accept: 'application/json',
		Authorization: `Bearer ${config.apiBearerToken}`,
	}
	const sourceId = Number(options.id)

	const [sourceGenres, sourceKeywords, recommendationRows, sameMediaGenreMap] = await Promise.all([
		options.media === 'tv'
			? (await fetchTmdbTv(options.id, language)).genres ?? []
			: (await fetchTmdbMovie(options.id, language)).genres ?? [],
		fetchTmdbKeywords(options.media, options.id),
		fetchTmdbRecommendations(options.media, options.id, config, headers, language),
		options.media === 'tv' ? getTvGenreNameMap(language) : getMovieGenreNameMap(language),
	])

	const keywordIds = formatKeywordIdsForDiscover(sourceKeywords)
	const sameGenreIds = sourceGenres.map((genre) => genre.id).join(',')

	const [keywordDiscoverSame, genreDiscoverSame] = await Promise.all([
		keywordIds
			? fetchDiscover(options.media, { keywords: keywordIds, genres: '' }, config, headers, language)
			: Promise.resolve([]),
		sameGenreIds
			? fetchDiscover(options.media, { keywords: '', genres: sameGenreIds }, config, headers, language)
			: Promise.resolve([]),
	])

	const recommendations = recommendationRows
		.filter((item) => item.poster_path)
		.map((item) => toRelatedCard(item, options.media, sameMediaGenreMap))

	const { keyword: keywordCap, genre: genreCap } = discoverSegmentCaps()

	return mergeRelated(
		[
			{ items: recommendations, max: RECOMMENDATION_SEGMENT_MAX },
			{
				items: mapDiscoverRows(keywordDiscoverSame, options.media, sameMediaGenreMap),
				max: keywordCap,
			},
			{
				items: mapDiscoverRows(genreDiscoverSame, options.media, sameMediaGenreMap),
				max: genreCap,
			},
		],
		sourceId,
		RELATED_CAP,
	)
}

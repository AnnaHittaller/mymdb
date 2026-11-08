import type { MediaType } from "~/types/catalog";
import type { CatalogCard, TrendingItem } from "~/types/catalog";

export type TmdbMediaRow = {
	id: number
	media_type?: string
	title?: string
	name?: string
	poster_path?: string | null
	backdrop_path?: string | null
	overview?: string | null
	vote_average?: number | null
	release_date?: string | null
	first_air_date?: string | null
	genre_ids?: number[] | null
	popularity?: number
}

export function parseMediaType(value: string | undefined): MediaType | null {
	if (value === "movie" || value === "tv") return value;
	return null;
}

export function titleFromTmdb(item: TmdbMediaRow, mediaType: MediaType): string {
	if (mediaType === "tv") {
		return item.name ?? item.title ?? "";
	}
	return item.title ?? item.name ?? "";
}

export function dateFromTmdb(item: TmdbMediaRow, mediaType: MediaType): string {
	if (mediaType === "tv") {
		return item.first_air_date ?? item.release_date ?? "";
	}
	return item.release_date ?? item.first_air_date ?? "";
}

export function releaseYearFrom(date: string): number | null {
	if (!date || date.length < 4) return null;
	const year = Number.parseInt(date.slice(0, 4), 10);
	return Number.isFinite(year) ? year : null;
}

export function genreNamesFromIds(
	genreIds: number[] | null | undefined,
	genreNames: Map<number, string>,
): string[] {
	return (genreIds ?? []).flatMap((id) => {
		const name = genreNames.get(id);
		return name ? [name] : [];
	});
}

export function toCatalogCard(
	item: TmdbMediaRow,
	mediaType: MediaType,
	genreNames: Map<number, string>,
): CatalogCard {
	const releaseDate = dateFromTmdb(item, mediaType);
	return {
		id: item.id,
		mediaType,
		title: titleFromTmdb(item, mediaType),
		popularity: item.popularity,
		poster: item.poster_path ?? null,
		backdrop: item.backdrop_path ?? null,
		genres: genreNamesFromIds(item.genre_ids, genreNames),
		rating: item.vote_average ?? 0,
		releaseYear: releaseYearFrom(releaseDate),
	};
}

export function toTrendingItem(
	item: TmdbMediaRow,
	mediaType: MediaType,
	genreNames: Map<number, string>,
): TrendingItem {
	const releaseDate = dateFromTmdb(item, mediaType);
	return {
		...toCatalogCard(item, mediaType, genreNames),
		overview: item.overview ?? "",
		releaseDate,
	};
}

export function normalizeTrendingAllResult(
	item: TmdbMediaRow,
	genreNamesByType: { movie: Map<number, string>, tv: Map<number, string> },
): TrendingItem | null {
	const mediaType = parseMediaType(item.media_type);
	if (!mediaType) return null;
	const genreNames = mediaType === "tv" ? genreNamesByType.tv : genreNamesByType.movie;
	return toTrendingItem(item, mediaType, genreNames);
}

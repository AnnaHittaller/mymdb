import { localizeTmdbGenreNames } from "../domain/locale/tmdbGenreLabels";
import type { TrendingItem } from "~/types/catalog";
import { formatMovieRating } from "./formatMovieRating";
import { formatReleaseDate } from "./formatReleaseDate";

export function trendingItemYearLabel(item: TrendingItem): string {
	return item.releaseDate?.slice(0, 4) ?? (item.releaseYear ? String(item.releaseYear) : "");
}

export function trendingItemRatingLabel(item: TrendingItem): string {
	return formatMovieRating(item.rating);
}

export function trendingItemFirstGenre(item: TrendingItem, languageOrLocale: string): string {
	const names = localizeTmdbGenreNames(item.genres, languageOrLocale);
	return names[0] ?? "";
}

export function trendingItemReleaseBadge(
	item: TrendingItem,
	languageOrLocale: string,
	showReleaseDate: boolean,
): string {
	return showReleaseDate ? formatReleaseDate(item.releaseDate, languageOrLocale) : "";
}

export function trendingItemHasMeta(
	item: TrendingItem,
	languageOrLocale: string,
	showReleaseDate: boolean,
): boolean {
	if (showReleaseDate) return true;
	return (
		trendingItemRatingLabel(item) !== "N/A"
		|| Boolean(trendingItemYearLabel(item))
		|| Boolean(trendingItemFirstGenre(item, languageOrLocale))
	);
}
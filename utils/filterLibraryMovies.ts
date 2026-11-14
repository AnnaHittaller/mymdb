import type { MediaType } from "../types/catalog";
import type { UserMovie } from "../types/movie";
import { defaultMediaType } from "./catalogKey";

export type LibraryMediaFilter = "all" | MediaType;

export type LibraryListFilterState = {
	titleQuery: string;
	media: LibraryMediaFilter;
	genreNames: string[];
	sortByBestRating: boolean;
};

export const defaultLibraryListFilterState = (): LibraryListFilterState => ({
	titleQuery: "",
	media: "all",
	genreNames: [],
	sortByBestRating: false,
});

function titleMatches(movie: UserMovie, term: string): boolean {
	if (!term) return true;
	return movie.title.toLowerCase().includes(term);
}

function mediaMatches(movie: UserMovie, media: LibraryMediaFilter): boolean {
	if (media === "all") return true;
	return defaultMediaType(movie.mediaType) === media;
}

function genresMatch(movie: UserMovie, selected: string[]): boolean {
	if (selected.length === 0) return true;
	const movieGenres = movie.genres ?? [];
	if (movieGenres.length === 0) return false;
	return selected.some((name) => movieGenres.includes(name));
}

function sortByRatingDesc(movies: UserMovie[]): UserMovie[] {
	return [...movies].sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
}

export function filterLibraryMovies(
	movies: UserMovie[],
	state: LibraryListFilterState,
): UserMovie[] {
	const term = state.titleQuery.trim().toLowerCase();
	const filtered = movies.filter(
		(movie) =>
			titleMatches(movie, term)
			&& mediaMatches(movie, state.media)
			&& genresMatch(movie, state.genreNames),
	);
	if (!state.sortByBestRating) {
		return filtered;
	}
	return sortByRatingDesc(filtered);
}

export function libraryListFiltersActive(state: LibraryListFilterState): boolean {
	return (
		state.titleQuery.trim().length > 0
		|| state.media !== "all"
		|| state.genreNames.length > 0
	);
}

/** Merged genre names from movie + TV TMDB lists (deduped, sorted). */
export function mergeGenreNames(
	movieGenres: { name: string }[],
	tvGenres: { name: string }[],
): string[] {
	const set = new Set<string>();
	for (const genre of movieGenres) {
		if (genre.name) set.add(genre.name);
	}
	for (const genre of tvGenres) {
		if (genre.name) set.add(genre.name);
	}
	return [...set].sort((a, b) => a.localeCompare(b));
}
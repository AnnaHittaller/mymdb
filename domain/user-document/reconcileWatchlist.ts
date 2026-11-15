import type { MediaType } from "../../types/catalog";
import type { UserMovie } from "../../types/movie";
import { catalogKey } from "../../utils/catalogKey";
import { movieActivityMillis } from "./listHelpers";

function timestampMillis(movie: UserMovie): number {
	return movieActivityMillis(movie);
}

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase();
}

function dedupeKey(movie: UserMovie): string {
	return movie.mediaType ? catalogKey(movie.id, movie.mediaType) : `unset:${movie.id}`;
}

function dedupeByCatalogKey(movies: UserMovie[]): UserMovie[] {
	const byKey = new Map<string, UserMovie>();
	for (const movie of movies) {
		const key = dedupeKey(movie);
		const existing = byKey.get(key);
		if (!existing || timestampMillis(movie) >= timestampMillis(existing)) {
			byKey.set(key, movie);
		}
	}
	return [...byKey.values()];
}

function pickNewest(entries: UserMovie[]): UserMovie {
	return entries.reduce((best, entry) =>
		timestampMillis(entry) >= timestampMillis(best) ? entry : best,
	);
}

/**
 * Same TMDB id in different namespaces is two works. Drop a row only when
 * another row has that id and the same title — a legacy double-save.
 * Prefer an explicit tv row, then any typed row, then the newest.
 */
function dropSameTitleCollisions(movies: UserMovie[]): UserMovie[] {
	const byId = new Map<string, UserMovie[]>();
	for (const movie of movies) {
		const group = byId.get(movie.id) ?? [];
		group.push(movie);
		byId.set(movie.id, group);
	}

	const kept: UserMovie[] = [];
	for (const group of byId.values()) {
		const byTitle = new Map<string, UserMovie[]>();
		for (const entry of group) {
			const title = normalizeTitle(entry.title);
			const rows = byTitle.get(title) ?? [];
			rows.push(entry);
			byTitle.set(title, rows);
		}
		for (const rows of byTitle.values()) {
			if (rows.length === 1) {
				kept.push(rows[0]!);
				continue;
			}
			const preferred =
				rows.find((entry) => entry.mediaType === "tv")
				?? rows.find((entry) => entry.mediaType)
				?? pickNewest(rows);
			kept.push(preferred);
		}
	}
	return kept;
}

export function reconcileWatchlistMovies(movies: UserMovie[]): UserMovie[] {
	return dropSameTitleCollisions(dedupeByCatalogKey(movies));
}

function membershipSignature(movie: UserMovie): string {
	if (!movie.memberships?.length) {
		return `${movie.next ?? false}:legacy`;
	}
	return movie.memberships
		.map((m) => `${m.listId}@${m.joinedAt instanceof Date ? m.joinedAt.getTime() : 0}`)
		.sort()
		.join(",");
}

function watchlistSignature(movies: UserMovie[]): string {
	return movies
		.map((movie) => {
			const mediaType = movie.mediaType ?? "unset";
			return `${mediaType}:${movie.id}:${movie.title}:${movie.seen}:${membershipSignature(movie)}`;
		})
		.sort()
		.join("|");
}

export function watchlistEquals(left: UserMovie[], right: UserMovie[]): boolean {
	return watchlistSignature(left) === watchlistSignature(right);
}

export type MediaTypeHint = { id: string; mediaType: MediaType };

type CatalogSummary = { id: string; title: string; mediaType?: MediaType };

/** Match untyped rows to TMDB movie vs tv by title. */
export function hintsFromSummaries(
	movies: Pick<UserMovie, "id" | "title" | "mediaType">[],
	summaries: CatalogSummary[],
): MediaTypeHint[] {
	const hints: MediaTypeHint[] = [];
	for (const movie of movies) {
		if (movie.mediaType) continue;
		const wanted = normalizeTitle(movie.title);
		const match = summaries.find(
			(row) =>
				row.id === movie.id
				&& row.mediaType
				&& normalizeTitle(row.title) === wanted,
		);
		if (match?.mediaType) {
			hints.push({ id: movie.id, mediaType: match.mediaType });
		}
	}
	return hints;
}

export function applyMediaTypeHints(movies: UserMovie[], hints: MediaTypeHint[]): UserMovie[] {
	const hintById = new Map(hints.map((hint) => [hint.id, hint.mediaType]));
	return reconcileWatchlistMovies(
		movies.map((movie) => {
			if (movie.mediaType) return movie;
			const hinted = hintById.get(movie.id);
			return hinted ? { ...movie, mediaType: hinted } : movie;
		}),
	);
}

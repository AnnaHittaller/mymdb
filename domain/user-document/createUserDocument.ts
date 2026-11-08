import type { MediaType } from "../../types/catalog";
import type { UserMovie } from "../../types/movie";
import { catalogKey, defaultMediaType } from "../../utils/catalogKey";
import { formatMovieRating } from "../../utils/formatMovieRating";
import type { UserDocumentData, UserDocumentStore } from "./types";

const NO_USER_DOCUMENT = "No user document";

export type CatalogUpdate = {
	id: string;
	mediaType?: MediaType;
	title: string;
	rating: number;
	poster: string;
	genres: string[];
};

function entryKey(movie: Pick<UserMovie, "id" | "mediaType">): string {
	return catalogKey(movie.id, defaultMediaType(movie.mediaType));
}

function matchesEntry(
	movie: UserMovie,
	id: string,
	mediaType?: MediaType,
): boolean {
	return entryKey(movie) === catalogKey(id, defaultMediaType(mediaType ?? movie.mediaType));
}

function displayedRating(rating: number): string {
	return formatMovieRating(rating);
}

function sameGenres(movie: UserMovie, update: CatalogUpdate): boolean {
	const left = movie.genres ?? [];
	const right = update.genres;
	return left.length === right.length && left.every((genre, index) => genre === right[index]);
}

function sameDisplay(movie: UserMovie, update: CatalogUpdate): boolean {
	return (
		movie.title === update.title &&
		movie.poster === update.poster &&
		displayedRating(movie.rating) === displayedRating(update.rating) &&
		sameGenres(movie, update)
	);
}

export function mergeCatalog(
	movies: UserMovie[],
	updates: CatalogUpdate[]
): { movies: UserMovie[]; changed: boolean } {
	const byKey = new Map(
		updates.map((update) => [catalogKey(update.id, defaultMediaType(update.mediaType)), update]),
	);
	let changed = false;
	const next = movies.map((movie) => {
		const update = byKey.get(entryKey(movie));
		if (!update || sameDisplay(movie, update)) {
			return movie;
		}
		changed = true;
		return {
			...movie,
			title: update.title,
			rating: update.rating,
			poster: update.poster,
			genres: update.genres,
		};
	});
	return { movies: changed ? next : movies, changed };
}

function cloneMovies(movies: UserMovie[]): UserMovie[] {
	return structuredClone(movies);
}

function timestampMillis(movie: UserMovie): number {
	const timestamp = movie.timestamp as Date | { toMillis?: () => number } | undefined;
	if (timestamp instanceof Date) {
		return timestamp.getTime();
	}
	if (timestamp && typeof timestamp.toMillis === "function") {
		return timestamp.toMillis();
	}
	return 0;
}

function watchNextOf(movies: UserMovie[]): UserMovie[] {
	return cloneMovies(movies.filter((movie) => movie.next)).sort(
		(a, b) => timestampMillis(b) - timestampMillis(a)
	);
}

function requireDocument(document: UserDocumentData | null): UserDocumentData {
	if (!document) {
		throw new Error(NO_USER_DOCUMENT);
	}
	return document;
}

export function createUserDocument(store: UserDocumentStore) {
	let snapshot = store.current();
	const listeners = new Set<() => void>();
	const unsubscribe = store.subscribe((document) => {
		snapshot = document;
		for (const listener of listeners) {
			listener();
		}
	});

	return {
		movies: () => cloneMovies(snapshot?.movies ?? []),
		watchNext: () => watchNextOf(snapshot?.movies ?? []),
		theme: () => snapshot?.theme ?? "",
		isInList: (id: string, mediaType?: MediaType) =>
			(snapshot?.movies ?? []).some((movie) => matchesEntry(movie, id, mediaType)),
		add: (movie: UserMovie) =>
			store.transact((document) => {
				const current = requireDocument(document);
				const normalized: UserMovie = {
					...movie,
					mediaType: defaultMediaType(movie.mediaType),
				};
				if (current.movies.some((entry) => entryKey(entry) === entryKey(normalized))) {
					return current;
				}
				return { ...current, movies: [...current.movies, normalized] };
			}),
		remove: (id: string, mediaType?: MediaType) =>
			store.transact((document) => {
				const current = requireDocument(document);
				return {
					...current,
					movies: current.movies.filter((movie) => !matchesEntry(movie, id, mediaType)),
				};
			}),
		setNext: (id: string, next: boolean, mediaType?: MediaType) =>
			store.transact((document) => {
				const current = requireDocument(document);
				if (!current.movies.some((movie) => matchesEntry(movie, id, mediaType))) {
					return current;
				}
				return {
					...current,
					movies: current.movies.map((movie) =>
						matchesEntry(movie, id, mediaType)
							? { ...movie, next, timestamp: new Date() }
							: movie,
					),
				};
			}),
		setTheme: (theme: string) =>
			store.transact((document) => {
				const current = requireDocument(document);
				return { ...current, theme };
			}),
		setUsername: (username: string) =>
			store.transact((document) => {
				const current = requireDocument(document);
				return { ...current, username };
			}),
		refreshCatalog: async (updates: CatalogUpdate[]) => {
			const current = store.current();
			if (!current) {
				throw new Error(NO_USER_DOCUMENT);
			}
			if (!mergeCatalog(current.movies, updates).changed) {
				return;
			}
			await store.transact((document) => {
				const latest = requireDocument(document);
				const merged = mergeCatalog(latest.movies, updates);
				return merged.changed ? { ...latest, movies: merged.movies } : latest;
			});
		},
		onChange: (listener: () => void) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		stop: unsubscribe,
	};
}

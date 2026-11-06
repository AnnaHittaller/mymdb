import type { UserMovie } from "../../types/movie";
import type { UserDocumentData, UserDocumentStore } from "./types";

const NO_USER_DOCUMENT = "No user document";

export type CatalogUpdate = {
	id: string;
	title: string;
	rating: number;
	poster: string;
};

function displayedRating(rating: number): string {
	return rating.toFixed(1);
}

function sameDisplay(movie: UserMovie, update: CatalogUpdate): boolean {
	return (
		movie.title === update.title &&
		movie.poster === update.poster &&
		displayedRating(movie.rating) === displayedRating(update.rating)
	);
}

export function mergeCatalog(
	movies: UserMovie[],
	updates: CatalogUpdate[]
): { movies: UserMovie[]; changed: boolean } {
	const byId = new Map(updates.map((update) => [update.id, update]));
	let changed = false;
	const next = movies.map((movie) => {
		const update = byId.get(movie.id);
		if (!update || sameDisplay(movie, update)) {
			return movie;
		}
		changed = true;
		return {
			...movie,
			title: update.title,
			rating: update.rating,
			poster: update.poster,
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
		isInList: (id: string) => (snapshot?.movies ?? []).some((movie) => movie.id === id),
		add: (movie: UserMovie) =>
			store.transact((document) => {
				const current = requireDocument(document);
				if (current.movies.some((entry) => entry.id === movie.id)) {
					return current;
				}
				return { ...current, movies: [...current.movies, movie] };
			}),
		remove: (id: string) =>
			store.transact((document) => {
				const current = requireDocument(document);
				return {
					...current,
					movies: current.movies.filter((movie) => movie.id !== id),
				};
			}),
		setNext: (id: string, next: boolean) =>
			store.transact((document) => {
				const current = requireDocument(document);
				if (!current.movies.some((movie) => movie.id === id)) {
					return current;
				}
				return {
					...current,
					movies: current.movies.map((movie) =>
						movie.id === id ? { ...movie, next, timestamp: new Date() } : movie
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

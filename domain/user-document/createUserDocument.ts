import type { MediaType } from "../../types/catalog";
import type { UserList } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import { catalogKey, defaultMediaType } from "../../utils/catalogKey";
import { formatMovieRating } from "../../utils/formatMovieRating";
import {
	FAVORITES_LIST_ID,
	ListCapError,
	ListCountCapError,
	MAX_CUSTOM_LISTS,
	MAX_LIST_NAME_LENGTH,
	MIN_LIST_NAME_LENGTH,
	WATCH_NEXT_LIST_ID,
} from "./listConstants";
import {
	entryKey,
	hasListMembership,
	joinedAtMillis,
	listsInDisplayOrder,
	matchesEntry,
	membershipJoinedAt,
} from "./listHelpers";
import { migrateUserDocumentV2 } from "./migrateV2";
import {
	applyMediaTypeHints,
	watchlistEquals,
	type MediaTypeHint,
} from "./reconcileWatchlist";
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

export type ToggleMoviePayload = {
	id: string;
	mediaType?: MediaType;
	title: string;
	rating: number;
	poster: string;
	genres?: string[];
	seen?: boolean;
};

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
	updates: CatalogUpdate[],
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

function cloneDocument(document: UserDocumentData): UserDocumentData {
	return migrateUserDocumentV2(structuredClone(document));
}

function cloneMovies(movies: UserMovie[]): UserMovie[] {
	return structuredClone(movies);
}

function requireDocument(document: UserDocumentData | null): UserDocumentData {
	if (!document) {
		throw new Error(NO_USER_DOCUMENT);
	}
	return cloneDocument(document);
}

function countInList(movies: UserMovie[], listId: string): number {
	return movies.filter((movie) => hasListMembership(movie, listId)).length;
}

function moviesInListOf(movies: UserMovie[], listId: string): UserMovie[] {
	return cloneMovies(
		movies
			.filter((movie) => hasListMembership(movie, listId))
			.sort(
				(a, b) =>
					joinedAtMillis({
						listId,
						joinedAt: membershipJoinedAt(b, listId) ?? new Date(0),
					})
					- joinedAtMillis({
						listId,
						joinedAt: membershipJoinedAt(a, listId) ?? new Date(0),
					}),
			),
	);
}

function normalizeName(name: string): string {
	return name.trim();
}

function newCustomListId(): string {
	return crypto.randomUUID();
}

function upsertCatalogRow(
	movies: UserMovie[],
	payload: ToggleMoviePayload,
): { movies: UserMovie[]; index: number } {
	const normalized = {
		...payload,
		mediaType: payload.mediaType ? defaultMediaType(payload.mediaType) : undefined,
		seen: payload.seen ?? false,
	};
	const key = entryKey({
		id: normalized.id,
		mediaType: normalized.mediaType,
	});
	const index = movies.findIndex((entry) => entryKey(entry) === key);
	if (index >= 0) {
		const existing = movies[index]!;
		const updated: UserMovie = {
			...existing,
			title: normalized.title,
			rating: normalized.rating,
			poster: normalized.poster,
			...(normalized.genres?.length ? { genres: normalized.genres } : {}),
			...(normalized.mediaType ? { mediaType: normalized.mediaType } : {}),
		};
		const next = [...movies];
		next[index] = updated;
		return { movies: next, index };
	}
	const row: UserMovie = {
		id: String(normalized.id),
		title: normalized.title,
		rating: normalized.rating,
		poster: normalized.poster,
		seen: normalized.seen,
		memberships: [],
		...(normalized.genres?.length ? { genres: normalized.genres } : {}),
		...(normalized.mediaType ? { mediaType: normalized.mediaType } : {}),
	};
	return { movies: [...movies, row], index: movies.length };
}

function addMembership(movie: UserMovie, listId: string, joinedAt = new Date()): UserMovie {
	if (hasListMembership(movie, listId)) {
		return movie;
	}
	return {
		...movie,
		memberships: [...movie.memberships, { listId, joinedAt }],
	};
}

function removeMembership(movie: UserMovie, listId: string): UserMovie {
	return {
		...movie,
		memberships: movie.memberships.filter((m) => m.listId !== listId),
	};
}

export function createUserDocument(store: UserDocumentStore) {
	let snapshot = store.current() ? migrateUserDocumentV2(store.current()!) : null;
	const listeners = new Set<() => void>();
	const unsubscribe = store.subscribe((document) => {
		snapshot = document ? migrateUserDocumentV2(document) : null;
		for (const listener of listeners) {
			listener();
		}
	});

	function current(): UserDocumentData | null {
		return snapshot ? cloneDocument(snapshot) : null;
	}

	return {
		movies: () => cloneMovies(snapshot?.movies ?? []),
		watchNext: () => moviesInListOf(snapshot?.movies ?? [], WATCH_NEXT_LIST_ID),
		lists: () => listsInDisplayOrder(snapshot?.lists ?? []),
		moviesInList: (listId: string) => moviesInListOf(snapshot?.movies ?? [], listId),
		theme: () => snapshot?.theme ?? "",
		listById: (listId: string): UserList | undefined =>
			snapshot?.lists.find((list) => list.id === listId),
		isInList: (listId: string, id: string, mediaType?: MediaType) =>
			(snapshot?.movies ?? []).some(
				(movie) => matchesEntry(movie, id, mediaType) && hasListMembership(movie, listId),
			),
		isOnAnyList: (id: string, mediaType?: MediaType) =>
			(snapshot?.movies ?? []).some(
				(movie) => matchesEntry(movie, id, mediaType) && movie.memberships.length > 0,
			),
		isInFavorites: (id: string, mediaType?: MediaType) =>
			(snapshot?.movies ?? []).some(
				(movie) =>
					matchesEntry(movie, id, mediaType) && hasListMembership(movie, FAVORITES_LIST_ID),
			),
		toggleListMembership: (listId: string, payload: ToggleMoviePayload) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				if (!currentDoc.lists.some((list) => list.id === listId)) {
					return currentDoc;
				}
				const { movies, index } = upsertCatalogRow(currentDoc.movies, payload);
				const movie = movies[index]!;
				const already = hasListMembership(movie, listId);
				if (already) {
					const stripped = removeMembership(movie, listId);
					const nextMovies =
						stripped.memberships.length === 0
							? movies.filter((_, i) => i !== index)
							: movies.map((row, i) => (i === index ? stripped : row));
					return { ...currentDoc, movies: nextMovies };
				}
				if (countInList(movies, listId) >= 200) {
					throw new ListCapError(listId);
				}
				const withMembership = addMembership(movie, listId);
				const nextMovies = movies.map((row, i) => (i === index ? withMembership : row));
				return { ...currentDoc, movies: nextMovies };
			}),
		removeFromList: (listId: string, id: string, mediaType?: MediaType) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				const nextMovies: UserMovie[] = [];
				for (const movie of currentDoc.movies) {
					if (!matchesEntry(movie, id, mediaType) || !hasListMembership(movie, listId)) {
						nextMovies.push(movie);
						continue;
					}
					const stripped = removeMembership(movie, listId);
					if (stripped.memberships.length > 0) {
						nextMovies.push(stripped);
					}
				}
				return { ...currentDoc, movies: nextMovies };
			}),
		setFavorites: (payload: ToggleMoviePayload, add: boolean) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				const inFavorites = currentDoc.movies.some(
					(movie) =>
						matchesEntry(movie, payload.id, payload.mediaType)
						&& hasListMembership(movie, FAVORITES_LIST_ID),
				);
				if (add === inFavorites) {
					return currentDoc;
				}
				if (!add) {
					const id = payload.id;
					const mediaType = payload.mediaType;
					const nextMovies: UserMovie[] = [];
					for (const movie of currentDoc.movies) {
						if (!matchesEntry(movie, id, mediaType) || !hasListMembership(movie, FAVORITES_LIST_ID)) {
							nextMovies.push(movie);
							continue;
						}
						const stripped = removeMembership(movie, FAVORITES_LIST_ID);
						if (stripped.memberships.length > 0) {
							nextMovies.push(stripped);
						}
					}
					return { ...currentDoc, movies: nextMovies };
				}
				if (countInList(currentDoc.movies, FAVORITES_LIST_ID) >= 200) {
					throw new ListCapError(FAVORITES_LIST_ID);
				}
				const { movies, index } = upsertCatalogRow(currentDoc.movies, payload);
				const movie = addMembership(movies[index]!, FAVORITES_LIST_ID);
				const nextMovies = movies.map((row, i) => (i === index ? movie : row));
				return { ...currentDoc, movies: nextMovies };
			}),
		createList: (name: string) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				const trimmed = normalizeName(name);
				if (trimmed.length < MIN_LIST_NAME_LENGTH || trimmed.length > MAX_LIST_NAME_LENGTH) {
					throw new Error("Invalid list name");
				}
				const customCount = currentDoc.lists.filter((list) => list.kind === "custom").length;
				if (customCount >= MAX_CUSTOM_LISTS) {
					throw new ListCountCapError();
				}
				const list: UserList = {
					id: newCustomListId(),
					kind: "custom",
					name: trimmed,
					renamable: true,
					createdAt: new Date(),
				};
				return { ...currentDoc, lists: [...currentDoc.lists, list] };
			}),
		renameList: (listId: string, name: string) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				const list = currentDoc.lists.find((entry) => entry.id === listId);
				if (!list?.renamable) {
					return currentDoc;
				}
				const trimmed = normalizeName(name);
				if (trimmed.length < MIN_LIST_NAME_LENGTH || trimmed.length > MAX_LIST_NAME_LENGTH) {
					throw new Error("Invalid list name");
				}
				return {
					...currentDoc,
					lists: currentDoc.lists.map((entry) =>
						entry.id === listId ? { ...entry, name: trimmed } : entry,
					),
				};
			}),
		deleteList: (listId: string) =>
			store.transact((document) => {
				const currentDoc = requireDocument(document);
				const list = currentDoc.lists.find((entry) => entry.id === listId);
				if (!list || list.kind === "system") {
					return currentDoc;
				}
				const nextMovies: UserMovie[] = [];
				for (const movie of currentDoc.movies) {
					const stripped = removeMembership(movie, listId);
					if (stripped.memberships.length > 0) {
						nextMovies.push(stripped);
					}
				}
				return {
					...currentDoc,
					lists: currentDoc.lists.filter((entry) => entry.id !== listId),
					movies: nextMovies,
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
		repairWatchlist: (hints: MediaTypeHint[]) =>
			store.transact((document) => {
				const current = requireDocument(document);
				const next = applyMediaTypeHints(current.movies, hints);
				if (watchlistEquals(current.movies, next)) {
					return current;
				}
				return { ...current, movies: next };
			}),
		refreshCatalog: async (updates: CatalogUpdate[]) => {
			const snap = current();
			if (!snap) {
				throw new Error(NO_USER_DOCUMENT);
			}
			if (!mergeCatalog(snap.movies, updates).changed) {
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

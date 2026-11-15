import { doc, runTransaction, type Firestore } from "firebase/firestore";
import { watch, type Ref } from "vue";
import type { UserList } from "../../types/list";
import type { ListMembership } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import type { MediaType } from "../../types/catalog";
import { migrateUserDocumentV2, parseMembershipsFromFirestore } from "./migrateV2";
import { reconcileWatchlistMovies } from "./reconcileWatchlist";
import { SCHEMA_VERSION_V2 } from "./listConstants";
import { DEFAULT_CATALOG_PREFS, normalizeCatalogPrefs } from "./catalogPrefs";
import { DEFAULT_APP_LOCALE, normalizeAppLocale } from "../locale/appLocale";
import type { UserDocumentData, UserDocumentStore } from "./types";

function storedMediaType(value: unknown): MediaType | undefined {
	return value === "tv" || value === "movie" ? value : undefined;
}

function toDate(value: unknown): Date {
	if (value instanceof Date) {
		return value;
	}
	if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
		return value.toDate();
	}
	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	return new Date(0);
}

function toUserList(value: unknown): UserList | null {
	if (!value || typeof value !== "object") return null;
	const row = value as Record<string, unknown>;
	if (typeof row.id !== "string" || typeof row.name !== "string") return null;
	const kind = row.kind === "custom" ? "custom" : "system";
	return {
		id: row.id,
		kind,
		name: row.name,
		renamable: row.renamable !== false,
		createdAt: toDate(row.createdAt),
	};
}

function toUserMovie(value: unknown): UserMovie | null {
	if (!value || typeof value !== "object") {
		return null;
	}
	const movie = value as Record<string, unknown>;
	if (typeof movie.id !== "string" && typeof movie.id !== "number") {
		return null;
	}
	if (typeof movie.title !== "string") {
		return null;
	}
	const genres = Array.isArray(movie.genres)
		? movie.genres.filter((genre): genre is string => typeof genre === "string")
		: undefined;
	const mediaType = storedMediaType(movie.mediaType) ?? storedMediaType(movie.media_type);
	const memberships = parseMembershipsFromFirestore(movie.memberships);
	return {
		id: String(movie.id),
		...(mediaType ? { mediaType } : {}),
		title: movie.title,
		rating: typeof movie.rating === "number" ? movie.rating : 0,
		poster: typeof movie.poster === "string" ? movie.poster : "",
		...(genres?.length ? { genres } : {}),
		seen: Boolean(movie.seen),
		memberships,
		...(movie.next !== undefined ? { next: Boolean(movie.next) } : {}),
		...(movie.timestamp !== undefined ? { timestamp: toDate(movie.timestamp) } : {}),
	};
}

export function toUserDocument(data: unknown, uid: string): UserDocumentData | null {
	if (!data || typeof data !== "object") {
		return null;
	}
	const record = data as Record<string, unknown>;
	if (typeof record.uid === "string" && record.uid !== uid) {
		return null;
	}
	const movies = reconcileWatchlistMovies(
		Array.isArray(record.movies)
			? record.movies.flatMap((movie) => {
					const normalized = toUserMovie(movie);
					return normalized ? [normalized] : [];
				})
			: [],
	);
	const lists = Array.isArray(record.lists)
		? record.lists.flatMap((list) => {
				const normalized = toUserList(list);
				return normalized ? [normalized] : [];
			})
		: undefined;
	const base: UserDocumentData = {
		schemaVersion: typeof record.schemaVersion === "number" ? record.schemaVersion : undefined,
		uid,
		username: typeof record.username === "string" ? record.username : "",
		email: typeof record.email === "string" ? record.email : "",
		theme: typeof record.theme === "string" ? record.theme : "",
		locale: normalizeAppLocale(record.locale),
		catalogPrefs: record.catalogPrefs
			? normalizeCatalogPrefs(record.catalogPrefs)
			: { ...DEFAULT_CATALOG_PREFS },
		lists: lists ?? [],
		movies,
	};
	return migrateUserDocumentV2(base);
}

function serializeMembership(membership: ListMembership) {
	return {
		listId: membership.listId,
		joinedAt: toDate(membership.joinedAt),
	};
}

function serialize(document: UserDocumentData) {
	const migrated = migrateUserDocumentV2(document);
	return {
		schemaVersion: SCHEMA_VERSION_V2,
		uid: migrated.uid,
		username: migrated.username,
		email: migrated.email,
		theme: migrated.theme,
		locale: migrated.locale ?? DEFAULT_APP_LOCALE,
		catalogPrefs: migrated.catalogPrefs,
		lists: migrated.lists.map((list) => ({
			id: list.id,
			kind: list.kind,
			name: list.name,
			renamable: list.renamable,
			createdAt: toDate(list.createdAt),
		})),
		movies: reconcileWatchlistMovies(migrated.movies).map((movie) => {
			const { mediaType, next, timestamp, ...rest } = movie;
			return {
				...rest,
				memberships: movie.memberships.map(serializeMembership),
				...(mediaType ? { mediaType } : {}),
				seen: movie.seen,
			};
		}),
	};
}

export function createVueFireUserDocumentStore(
	db: Firestore,
	getUid: () => string | null,
	source: Ref<unknown>,
): UserDocumentStore & { dispose: () => void } {
	let current: UserDocumentData | null = null;
	const listeners = new Set<(document: UserDocumentData | null) => void>();

	function publish(data: unknown) {
		const uid = getUid();
		current = uid ? toUserDocument(data, uid) : null;
		const snapshot = current ? structuredClone(current) : null;
		for (const listener of listeners) {
			listener(snapshot);
		}
	}

	const stop = watch(source, (value) => publish(value), { immediate: true });

	return {
		current: () => (current ? structuredClone(current) : null),
		subscribe(listener) {
			listeners.add(listener);
			listener(current ? structuredClone(current) : null);
			return () => {
				listeners.delete(listener);
			};
		},
		async transact(update) {
			const uid = getUid();
			if (!uid) {
				throw new Error("No user document");
			}
			const ref = doc(db, "users", uid);
			await runTransaction(db, async (transaction) => {
				const snap = await transaction.get(ref);
				const latest = snap.exists() ? toUserDocument(snap.data(), uid) : null;
				const next = migrateUserDocumentV2(update(latest));
				transaction.set(ref, serialize(next), { merge: true });
			});
		},
		dispose: stop,
	};
}

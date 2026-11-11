import type { UserList } from "../../types/list";
import type { ListMembership } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import {
	FAVORITES_LIST_ID,
	SCHEMA_VERSION_V2,
	SYSTEM_LIST_EPOCH,
	WATCH_NEXT_LIST_ID,
} from "./listConstants";
import type { UserDocumentData } from "./types";

function toDate(value: unknown): Date {
	if (value instanceof Date) return value;
	if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
		return value.toDate();
	}
	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}
	return new Date(0);
}

export function defaultSystemLists(): UserList[] {
	return [
		{
			id: FAVORITES_LIST_ID,
			kind: "system",
			name: "Favorites",
			renamable: false,
			createdAt: SYSTEM_LIST_EPOCH,
		},
		{
			id: WATCH_NEXT_LIST_ID,
			kind: "system",
			name: "Watch next",
			renamable: true,
			createdAt: SYSTEM_LIST_EPOCH,
		},
	];
}

function parseMemberships(value: unknown): ListMembership[] | null {
	if (!Array.isArray(value)) return null;
	const parsed: ListMembership[] = [];
	for (const item of value) {
		if (!item || typeof item !== "object") continue;
		const row = item as Record<string, unknown>;
		if (typeof row.listId !== "string") continue;
		parsed.push({ listId: row.listId, joinedAt: toDate(row.joinedAt) });
	}
	return parsed;
}

function legacyMovieToV2(movie: UserMovie): UserMovie {
	if (movie.memberships?.length) {
		return { ...movie, memberships: [...movie.memberships] };
	}
	const joinedAt = movie.timestamp ? toDate(movie.timestamp) : new Date();
	const memberships: ListMembership[] = [{ listId: FAVORITES_LIST_ID, joinedAt }];
	if (movie.next) {
		memberships.push({ listId: WATCH_NEXT_LIST_ID, joinedAt });
	}
	const { next, timestamp, ...rest } = movie;
	return { ...rest, memberships };
}

function normalizeLists(lists: UserList[] | undefined): UserList[] {
	const system = defaultSystemLists();
	if (!lists?.length) return system;
	const byId = new Map(lists.map((list) => [list.id, list]));
	const merged = system.map((sys) => {
		const stored = byId.get(sys.id);
		if (!stored) return sys;
		if (sys.id === FAVORITES_LIST_ID) {
			return { ...sys, name: "Favorites" };
		}
		return {
			...sys,
			name: stored.name?.trim() ? stored.name : sys.name,
		};
	});
	const custom = lists
		.filter((list) => list.kind === "custom" && list.id !== FAVORITES_LIST_ID && list.id !== WATCH_NEXT_LIST_ID)
		.map((list) => ({
			...list,
			createdAt: toDate(list.createdAt),
			renamable: true,
		}));
	return [...merged, ...custom];
}

export function isV2Document(doc: UserDocumentData): boolean {
	return (doc.schemaVersion ?? 0) >= SCHEMA_VERSION_V2 && Array.isArray(doc.lists) && doc.lists.length > 0;
}

export function migrateUserDocumentV2(doc: UserDocumentData): UserDocumentData {
	const lists = normalizeLists(doc.lists);
	const movies = (doc.movies ?? []).map((movie) =>
		movie.memberships?.length ? { ...movie, memberships: [...movie.memberships] } : legacyMovieToV2(movie),
	);

	if (isV2Document({ ...doc, lists, movies })) {
		return {
			...doc,
			schemaVersion: SCHEMA_VERSION_V2,
			lists,
			movies,
		};
	}

	return {
		...doc,
		schemaVersion: SCHEMA_VERSION_V2,
		lists,
		movies,
	};
}

export function parseMembershipsFromFirestore(value: unknown): ListMembership[] {
	return parseMemberships(value) ?? [];
}

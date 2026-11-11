import type { UserList } from "../../types/list";
import type { ListMembership } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import type { MediaType } from "../../types/catalog";
import { catalogKey, defaultMediaType } from "../../utils/catalogKey";
import {
	FAVORITES_LIST_ID,
	WATCH_NEXT_LIST_ID,
} from "./listConstants";

export function joinedAtMillis(membership: ListMembership): number {
	const value = membership.joinedAt;
	if (value instanceof Date) return value.getTime();
	return 0;
}

export function movieActivityMillis(movie: UserMovie): number {
	if (movie.memberships?.length) {
		return Math.max(...movie.memberships.map(joinedAtMillis));
	}
	const timestamp = movie.timestamp;
	if (timestamp instanceof Date) return timestamp.getTime();
	return 0;
}

export function entryKey(movie: Pick<UserMovie, "id" | "mediaType">): string {
	return catalogKey(movie.id, defaultMediaType(movie.mediaType));
}

export function matchesEntry(
	movie: UserMovie,
	id: string,
	queryMediaType?: MediaType,
): boolean {
	if (String(movie.id) !== String(id)) return false;
	const wantedType = queryMediaType ?? defaultMediaType(movie.mediaType);
	return entryKey(movie) === catalogKey(id, wantedType);
}

export function hasListMembership(movie: UserMovie, listId: string): boolean {
	return movie.memberships.some((m) => m.listId === listId);
}

export function membershipJoinedAt(movie: UserMovie, listId: string): Date | undefined {
	return movie.memberships.find((m) => m.listId === listId)?.joinedAt;
}

export function listsInDisplayOrder(lists: UserList[]): UserList[] {
	const favorites = lists.find((l) => l.id === FAVORITES_LIST_ID);
	const watchNext = lists.find((l) => l.id === WATCH_NEXT_LIST_ID);
	const custom = lists
		.filter((l) => l.kind === "custom")
		.sort((a, b) => joinedAtMillis({ listId: "", joinedAt: a.createdAt }) - joinedAtMillis({ listId: "", joinedAt: b.createdAt }));
	const result: UserList[] = [];
	if (favorites) result.push(favorites);
	if (watchNext) result.push(watchNext);
	return [...result, ...custom];
}

export function pickerLists(lists: UserList[]): UserList[] {
	return listsInDisplayOrder(lists);
}

export function slugifyListTitle(name: string): string {
	return name
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function createdAtMillis(list: UserList): number {
	return list.createdAt instanceof Date ? list.createdAt.getTime() : 0;
}

/** Path segment for each list. System lists keep their id. Custom lists use the title. */
export function listPathSegments(lists: UserList[]): Map<string, string> {
	const segments = new Map<string, string>();
	const used = new Set<string>();

	for (const list of lists) {
		if (list.kind !== "system") continue;
		segments.set(list.id, list.id);
		used.add(list.id);
	}

	const custom = lists
		.filter((list) => list.kind === "custom")
		.slice()
		.sort((a, b) => {
			const delta = createdAtMillis(a) - createdAtMillis(b);
			if (delta !== 0) return delta;
			return a.id.localeCompare(b.id);
		});

	for (const list of custom) {
		const base = slugifyListTitle(list.name) || list.id;
		let candidate = base;
		let suffix = 2;
		while (used.has(candidate)) {
			candidate = `${base}-${suffix}`;
			suffix += 1;
		}
		used.add(candidate);
		segments.set(list.id, candidate);
	}

	return segments;
}

export function listPathSegment(list: UserList, lists: UserList[]): string {
	return listPathSegments(lists).get(list.id) ?? list.id;
}

export function listPath(list: UserList, lists: UserList[]): string {
	return `/lists/${listPathSegment(list, lists)}`;
}

export function findListByPathSegment(lists: UserList[], segment: string): UserList | undefined {
	const segments = listPathSegments(lists);
	return (
		lists.find((list) => segments.get(list.id) === segment)
		?? lists.find((list) => list.id === segment)
	);
}

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

export function listPathSegment(list: UserList): string {
	return list.id;
}

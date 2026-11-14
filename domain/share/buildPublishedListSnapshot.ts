import { defaultMediaType } from "../../utils/catalogKey";
import type { UserList } from "../../types/list";
import {
	FAVORITES_LIST_ID,
	MAX_LIST_TITLES,
	WATCH_NEXT_LIST_ID,
} from "../user-document/listConstants";
import {
	hasListMembership,
	joinedAtMillis,
	membershipJoinedAt,
} from "../user-document/listHelpers";
import { migrateUserDocumentV2 } from "../user-document/migrateV2";
import type { UserDocumentData } from "../user-document/types";
import type { UserMovie } from "../../types/movie";
import type { PublishedListItem, PublishedListSnapshot } from "../../types/share";
import { PUBLISHED_LIST_SCHEMA_VERSION } from "../../types/share";
import { ShareListCapError, ShareListNotFoundError } from "./errors";

function moviesInListSorted(movies: UserMovie[], listId: string): UserMovie[] {
	return movies
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
		);
}

function toPublishedItem(movie: UserMovie): PublishedListItem {
	return {
		id: movie.id,
		mediaType: defaultMediaType(movie.mediaType),
		title: movie.title,
		poster: movie.poster || null,
		rating: movie.rating ?? null,
	};
}

function sourceSystemListId(list: UserList): PublishedListSnapshot["sourceSystemListId"] {
	if (list.id === FAVORITES_LIST_ID) return FAVORITES_LIST_ID;
	if (list.id === WATCH_NEXT_LIST_ID) return WATCH_NEXT_LIST_ID;
	return undefined;
}

export function buildPublishedListSnapshot(
	document: UserDocumentData,
	listId: string,
	shareId: string,
	createdAt: string,
): PublishedListSnapshot {
	const migrated = migrateUserDocumentV2(structuredClone(document));
	const list = migrated.lists.find((row) => row.id === listId);
	if (!list) {
		throw new ShareListNotFoundError();
	}
	const items = moviesInListSorted(migrated.movies, listId).map(toPublishedItem);
	if (items.length > MAX_LIST_TITLES) {
		throw new ShareListCapError();
	}
	const ownerDisplayName = migrated.username.trim() || "MyMDb user";
	return {
		schemaVersion: PUBLISHED_LIST_SCHEMA_VERSION,
		shareId,
		createdAt,
		ownerUid: migrated.uid,
		ownerDisplayName,
		sourceListId: list.id,
		sourceListName: list.name,
		sourceListKind: list.kind,
		...(list.kind === "system" ? { sourceSystemListId: sourceSystemListId(list) } : {}),
		items,
	};
}
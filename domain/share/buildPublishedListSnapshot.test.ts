import { describe, expect, it } from "vitest";
import { buildPublishedListSnapshot } from "./buildPublishedListSnapshot";
import { ShareListNotFoundError } from "./errors";
import { DEFAULT_CATALOG_PREFS } from "../user-document/catalogPrefs";
import { defaultSystemLists, migrateUserDocumentV2 } from "../user-document/migrateV2";
import { FAVORITES_LIST_ID } from "../user-document/listConstants";
import type { UserDocumentData } from "../user-document/types";
import type { UserMovie } from "../../types/movie";

function user(movies: UserMovie[], lists = defaultSystemLists()): UserDocumentData {
	return migrateUserDocumentV2({
		uid: "user-1",
		username: "anna",
		email: "anna@example.com",
		theme: "emerald",
		catalogPrefs: { ...DEFAULT_CATALOG_PREFS },
		lists,
		movies,
	});
}

describe("buildPublishedListSnapshot", () => {
	it("maps list items and attribution", () => {
		const joinedAt = new Date("2025-06-01T12:00:00.000Z");
		const movies: UserMovie[] = [
			{
				id: "99",
				mediaType: "movie",
				title: "Ninety Nine",
				rating: 8.2,
				poster: "/99.jpg",
				seen: false,
				memberships: [{ listId: FAVORITES_LIST_ID, joinedAt }],
			},
		];
		const snapshot = buildPublishedListSnapshot(
			user(movies),
			FAVORITES_LIST_ID,
			"share-abc",
			"2025-06-02T00:00:00.000Z",
		);
		expect(snapshot.shareId).toBe("share-abc");
		expect(snapshot.ownerDisplayName).toBe("anna");
		expect(snapshot.sourceListName).toBe("Favorites");
		expect(snapshot.sourceListKind).toBe("system");
		expect(snapshot.sourceSystemListId).toBe(FAVORITES_LIST_ID);
		expect(snapshot.items).toEqual([
			{
				id: "99",
				mediaType: "movie",
				title: "Ninety Nine",
				poster: "/99.jpg",
				rating: 8.2,
			},
		]);
	});

	it("throws when the list id is missing", () => {
		expect(() =>
			buildPublishedListSnapshot(
				user([]),
				"no-such-list",
				"share-abc",
				"2025-06-02T00:00:00.000Z",
			),
		).toThrow(ShareListNotFoundError);
	});
});
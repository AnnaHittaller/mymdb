import { describe, expect, it } from "vitest";
import type { UserDocumentData } from "./types";
import type { UserMovie } from "../../types/movie";
import { FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID } from "./listConstants";
import { migrateUserDocumentV2, defaultSystemLists } from "./migrateV2";

function legacyMovie(id: string, overrides: Partial<UserMovie> = {}): UserMovie {
	return {
		id,
		mediaType: "movie",
		title: `Movie ${id}`,
		rating: 7,
		poster: `/poster-${id}.jpg`,
		seen: false,
		memberships: [],
		next: false,
		timestamp: new Date("2024-01-01T00:00:00.000Z"),
		...overrides,
	};
}

function baseDoc(movies: UserMovie[] = []): UserDocumentData {
	return {
		uid: "user-1",
		username: "anna",
		email: "anna@example.com",
		theme: "emerald",
		catalogPrefs: {
			region: null,
			movieGenreIds: [],
			tvGenreIds: [],
			watchProviderIds: [],
			keywordIds: [],
		},
		lists: [],
		movies,
	};
}

describe("migrateUserDocumentV2", () => {
	it("maps legacy watchlist to favorites and next to watch-next", () => {
		const migrated = migrateUserDocumentV2(
			baseDoc([
				legacyMovie("a"),
				legacyMovie("b", { next: true, timestamp: new Date("2024-06-01T00:00:00.000Z") }),
			]),
		);

		expect(migrated.lists.map((list) => list.id)).toEqual([FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID]);
		const a = migrated.movies.find((m) => m.id === "a")!;
		expect(a.memberships.map((m) => m.listId)).toEqual([FAVORITES_LIST_ID]);
		const b = migrated.movies.find((m) => m.id === "b")!;
		expect(b.memberships.map((m) => m.listId).sort()).toEqual(
			[FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID].sort(),
		);
		expect(migrated.schemaVersion).toBe(2);
	});

	it("seeds default lists for empty library", () => {
		const migrated = migrateUserDocumentV2(baseDoc());
		expect(migrated.movies).toEqual([]);
		expect(migrated.lists).toEqual(defaultSystemLists());
	});

	it("is idempotent for v2 documents", () => {
		const once = migrateUserDocumentV2(baseDoc([legacyMovie("a")]));
		const twice = migrateUserDocumentV2(once);
		expect(twice).toEqual(once);
	});
});

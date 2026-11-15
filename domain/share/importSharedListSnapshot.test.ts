import { describe, expect, it } from "vitest";
import { createUserDocument } from "../user-document/createUserDocument";
import { FAVORITES_LIST_ID } from "../user-document/listConstants";
import { createMemoryUserDocumentStore } from "../user-document/memoryStore";
import { DEFAULT_CATALOG_PREFS } from "../user-document/catalogPrefs";
import { defaultSystemLists, migrateUserDocumentV2 } from "../user-document/migrateV2";
import type { UserMovie } from "../../types/movie";
import {
	IMPORT_AS_NEW_LIST,
	importSharedListSnapshot,
	resolveImportTargetListId,
} from "./importSharedListSnapshot";
import type { PublishedListItem } from "../../types/share";

function baseUser() {
	return migrateUserDocumentV2({
		uid: "u1",
		username: "anna",
		email: "a@b.com",
		theme: "emerald",
		catalogPrefs: { ...DEFAULT_CATALOG_PREFS },
		lists: [
			...defaultSystemLists(),
			{
				id: "custom-1",
				kind: "custom",
				name: "Horror",
				renamable: true,
				createdAt: new Date(),
			},
		],
		movies: [
			{
				id: "1",
				mediaType: "movie",
				title: "Existing",
				rating: 7,
				poster: "",
				seen: false,
				memberships: [{ listId: FAVORITES_LIST_ID, joinedAt: new Date() }],
			} satisfies UserMovie,
		],
	});
}

const items: PublishedListItem[] = [
	{ id: "1", mediaType: "movie", title: "Existing", rating: 7, poster: "" },
	{ id: "2", mediaType: "movie", title: "New One", rating: 8, poster: "" },
	{ id: "3", mediaType: "tv", title: "Show", rating: 6, poster: "" },
];

describe("importSharedListSnapshot", () => {
	it("skips duplicates and adds the rest", async () => {
		const store = createMemoryUserDocumentStore(baseUser());
		const doc = createUserDocument(store);
		const result = await importSharedListSnapshot("custom-1", {
			items,
			isOnAnyList: (id, mediaType) => doc.isOnAnyList(id, mediaType),
			moviesInList: (listId) => doc.moviesInList(listId),
			toggleListMembership: (listId, payload) => doc.toggleListMembership(listId, payload),
			createList: (name) => doc.createList(name),
			lists: () => doc.lists(),
		});
		expect(result.added).toBe(2);
		expect(result.skippedDuplicates).toBe(1);
		expect(doc.moviesInList("custom-1").map((row) => row.id).sort()).toEqual(["2", "3"]);
	});

	it("creates a new list when importing as new", async () => {
		const store = createMemoryUserDocumentStore(baseUser());
		const doc = createUserDocument(store);
		const targetId = await resolveImportTargetListId(IMPORT_AS_NEW_LIST, "Shared picks", {
			createList: (name) => doc.createList(name),
			lists: () => doc.lists(),
		});
		expect(doc.listById(targetId)?.name).toBe("Shared picks");
	});
});
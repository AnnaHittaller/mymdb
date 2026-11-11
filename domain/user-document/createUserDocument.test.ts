import { describe, expect, it } from "vitest";
import { createUserDocument, type CatalogUpdate } from "./createUserDocument";
import { createMemoryUserDocumentStore } from "./memoryStore";
import type { UserDocumentData } from "./types";
import type { UserMovie } from "../../types/movie";
import { FAVORITES_LIST_ID, ListCapError, WATCH_NEXT_LIST_ID } from "./listConstants";
import { defaultSystemLists, migrateUserDocumentV2 } from "./migrateV2";

function movie(id: string, overrides: Partial<UserMovie> = {}): UserMovie {
	const joinedAt = new Date("2024-01-01T00:00:00.000Z");
	return {
		id,
		mediaType: "movie" as const,
		title: `Movie ${id}`,
		rating: 7,
		poster: `/poster-${id}.jpg`,
		seen: false,
		memberships: [{ listId: FAVORITES_LIST_ID, joinedAt }],
		...overrides,
	};
}

function user(movies: UserMovie[] = []): UserDocumentData {
	return migrateUserDocumentV2({
		uid: "user-1",
		username: "anna",
		email: "anna@example.com",
		theme: "emerald",
		lists: defaultSystemLists(),
		movies,
	});
}

const payload = (id: string, overrides: Partial<UserMovie> = {}) => ({
	id,
	mediaType: "movie" as const,
	title: `Movie ${id}`,
	rating: 7,
	poster: `/poster-${id}.jpg`,
	seen: false,
	...overrides,
});

describe("user document", () => {
	it("exposes lists, movies in list, and membership", () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(
				user([
					movie("older", {
						memberships: [
							{ listId: FAVORITES_LIST_ID, joinedAt: new Date("2024-01-01T00:00:00.000Z") },
							{ listId: WATCH_NEXT_LIST_ID, joinedAt: new Date("2024-01-01T00:00:00.000Z") },
						],
					}),
					movie("newer", {
						memberships: [
							{ listId: FAVORITES_LIST_ID, joinedAt: new Date("2024-06-01T00:00:00.000Z") },
							{ listId: WATCH_NEXT_LIST_ID, joinedAt: new Date("2024-06-01T00:00:00.000Z") },
						],
					}),
					movie("saved"),
				]),
			),
		);

		expect(document.moviesInList(FAVORITES_LIST_ID).map((entry) => entry.id)).toEqual([
			"newer",
			"older",
			"saved",
		]);
		expect(document.watchNext().map((entry) => entry.id)).toEqual(["newer", "older"]);
		expect(document.isInList(FAVORITES_LIST_ID, "saved")).toBe(true);
		expect(document.isInList(FAVORITES_LIST_ID, "missing")).toBe(false);
	});

	it("toggles favorites via setFavorites", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user()));

		await document.setFavorites(payload("a"), true);

		expect(document.isInFavorites("a")).toBe(true);
		await document.setFavorites(payload("a"), false);
		expect(document.isInFavorites("a")).toBe(false);
		expect(document.movies()).toEqual([]);
	});

	it("toggles watch next without adding favorites", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user()));

		await document.toggleListMembership(WATCH_NEXT_LIST_ID, payload("a"));

		expect(document.isInList(WATCH_NEXT_LIST_ID, "a")).toBe(true);
		expect(document.isInFavorites("a")).toBe(false);
	});

	it("treats the same numeric id as different entries for movie vs tv", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user()));
		await document.setFavorites(payload("42", { title: "Film 42" }), true);
		await document.setFavorites(
			{ ...payload("42", { title: "Show 42" }), mediaType: "tv" },
			true,
		);

		expect(document.movies()).toHaveLength(2);
		expect(document.isInFavorites("42", "movie")).toBe(true);
		expect(document.isInFavorites("42", "tv")).toBe(true);
		await document.removeFromList(FAVORITES_LIST_ID, "42", "movie");
		expect(document.isInFavorites("42", "movie")).toBe(false);
		expect(document.isInFavorites("42", "tv")).toBe(true);
	});

	it("rejects add when list is at cap", async () => {
		const movies: UserMovie[] = [];
		for (let i = 0; i < 200; i++) {
			movies.push(movie(String(i)));
		}
		const document = createUserDocument(createMemoryUserDocumentStore(user(movies)));

		await expect(document.setFavorites(payload("new"), true)).rejects.toBeInstanceOf(ListCapError);
	});

	it("creates and deletes a custom list", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user()));

		await document.createList("Horror");
		const custom = document.lists().find((list) => list.kind === "custom");
		expect(custom?.name).toBe("Horror");

		await document.toggleListMembership(custom!.id, payload("a"));
		expect(document.isInList(custom!.id, "a")).toBe(true);

		await document.deleteList(custom!.id);
		expect(document.lists().filter((l) => l.kind === "custom")).toHaveLength(0);
		expect(document.isInList(custom!.id, "a")).toBe(false);
	});

	it("refreshes poster and keeps memberships", async () => {
		const saved = movie("a", {
			memberships: [
				{ listId: FAVORITES_LIST_ID, joinedAt: new Date("2024-01-01T00:00:00.000Z") },
				{ listId: WATCH_NEXT_LIST_ID, joinedAt: new Date("2024-01-01T00:00:00.000Z") },
			],
			seen: true,
		});
		const document = createUserDocument(createMemoryUserDocumentStore(user([saved, movie("b")])));

		await document.refreshCatalog([
			{ id: "a", title: "Updated title", rating: 8.24, poster: "/updated.jpg", genres: [] },
		]);

		const updated = document.movies().find((entry) => entry.id === "a");
		expect(updated).toMatchObject({
			title: "Updated title",
			rating: 8.24,
			poster: "/updated.jpg",
			seen: true,
		});
		expect(updated?.memberships).toHaveLength(2);
	});

	it("applies a media type hint without changing memberships", async () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(
				user([
					{
						...movie("1396", { title: "Breaking Bad" }),
						mediaType: undefined,
						memberships: [{ listId: FAVORITES_LIST_ID, joinedAt: new Date() }],
					},
					movie("550", { title: "Fight Club" }),
				]),
			),
		);

		await document.repairWatchlist([{ id: "1396", mediaType: "tv" }]);

		expect(document.movies().find((entry) => entry.id === "1396")?.mediaType).toBe("tv");
	});

	it("rejects commands when there is no user document", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(null));

		await expect(document.setFavorites(payload("a"), true)).rejects.toThrow("No user document");
		await expect(document.toggleListMembership(FAVORITES_LIST_ID, payload("a"))).rejects.toThrow(
			"No user document",
		);
		expect(document.movies()).toEqual([]);
		expect(document.watchNext()).toEqual([]);
	});
});

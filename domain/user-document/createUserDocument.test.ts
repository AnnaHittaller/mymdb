import { describe, expect, it } from "vitest";
import { createUserDocument, type CatalogUpdate } from "./createUserDocument";
import { createMemoryUserDocumentStore } from "./memoryStore";
import type { UserDocumentData } from "./types";
import type { UserMovie } from "../../types/movie";

function movie(id: string, overrides: Partial<UserMovie> = {}): UserMovie {
	return {
		id,
		title: `Movie ${id}`,
		rating: 7,
		poster: `/poster-${id}.jpg`,
		seen: false,
		next: false,
		timestamp: new Date("2024-01-01T00:00:00.000Z"),
		...overrides,
	};
}

function user(movies: UserMovie[] = []): UserDocumentData {
	return {
		uid: "user-1",
		username: "anna",
		email: "anna@example.com",
		theme: "emerald",
		movies,
	};
}

describe("user document", () => {
	it("exposes movies, watch next, theme, and list membership from the document", () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(
				user([
					movie("older", { next: true, timestamp: new Date("2024-01-01T00:00:00.000Z") }),
					movie("newer", { next: true, timestamp: new Date("2024-06-01T00:00:00.000Z") }),
					movie("saved"),
				])
			)
		);

		expect(document.movies().map((entry) => entry.id)).toEqual(["older", "newer", "saved"]);
		expect(document.watchNext().map((entry) => entry.id)).toEqual(["newer", "older"]);
		expect(document.theme()).toBe("emerald");
		expect(document.isInList("saved")).toBe(true);
		expect(document.isInList("missing")).toBe(false);
	});

	it("adds a movie and reports the change to listeners", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user()));
		const seen: string[][] = [];
		document.onChange(() => {
			seen.push(document.movies().map((entry) => entry.id));
		});

		await document.add(movie("a"));

		expect(document.isInList("a")).toBe(true);
		expect(document.movies()).toEqual([movie("a")]);
		expect(seen).toEqual([["a"]]);
	});

	it("does not duplicate a movie that is already in the list", async () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(user([movie("a", { title: "Original" })]))
		);

		await document.add(movie("a", { title: "Duplicate" }));

		expect(document.movies()).toEqual([movie("a", { title: "Original" })]);
	});

	it("removes a movie and leaves an unknown id untouched", async () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(user([movie("a"), movie("b")]))
		);

		await document.remove("missing");
		await document.remove("a");

		expect(document.movies().map((entry) => entry.id)).toEqual(["b"]);
		expect(document.isInList("a")).toBe(false);
	});

	it("marks watch next and refreshes that movie's timestamp", async () => {
		const original = movie("a");
		const document = createUserDocument(createMemoryUserDocumentStore(user([original, movie("b")])));

		await document.setNext("a", true);

		const updated = document.movies().find((entry) => entry.id === "a");
		expect(updated?.next).toBe(true);
		expect(updated?.timestamp.getTime()).toBeGreaterThan(original.timestamp.getTime());
		expect(document.watchNext().map((entry) => entry.id)).toEqual(["a"]);
		expect(document.movies().find((entry) => entry.id === "b")?.timestamp).toEqual(original.timestamp);

		await document.setNext("a", false);

		expect(document.watchNext()).toEqual([]);
		expect(document.isInList("a")).toBe(true);
	});

	it("leaves the document unchanged when watch next is set for an unknown movie", async () => {
		const starting = user([movie("a")]);
		const document = createUserDocument(createMemoryUserDocumentStore(starting));

		await document.setNext("missing", true);

		expect(document.movies()).toEqual(starting.movies);
	});

	it("updates the theme without rewriting the movie list", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(user([movie("a")])));

		await document.setTheme("dusk");

		expect(document.theme()).toBe("dusk");
		expect(document.movies()).toEqual([movie("a")]);
	});

	it("updates the username without rewriting the movie list", async () => {
		const store = createMemoryUserDocumentStore(user([movie("a")]));
		const document = createUserDocument(store);

		await document.setUsername("new-name");

		expect(store.current()?.username).toBe("new-name");
		expect(document.movies()).toEqual([movie("a")]);
	});

	it("keeps both writes when a remove overlaps an add", async () => {
		const document = createUserDocument(
			createMemoryUserDocumentStore(user([movie("a"), movie("b")]))
		);

		await Promise.all([document.remove("a"), document.add(movie("c"))]);

		expect(document.movies().map((entry) => entry.id).sort()).toEqual(["b", "c"]);
	});

	it("refreshes poster and rating and keeps list flags and timestamp", async () => {
		const saved = movie("a", { next: true, seen: true, rating: 6.2 });
		const document = createUserDocument(createMemoryUserDocumentStore(user([saved, movie("b")])));

		await document.refreshCatalog([
			{ id: "a", title: "Updated title", rating: 8.24, poster: "/updated.jpg" },
			{ id: "missing", title: "Nope", rating: 1, poster: "/missing.jpg" },
		]);

		const updated = document.movies().find((entry) => entry.id === "a");
		expect(updated).toMatchObject({
			title: "Updated title",
			rating: 8.24,
			poster: "/updated.jpg",
			next: true,
			seen: true,
		});
		expect(updated?.timestamp).toEqual(saved.timestamp);
		expect(document.movies().find((entry) => entry.id === "b")).toEqual(movie("b"));
		expect(document.movies()).toHaveLength(2);
	});

	it("does not write when the visible rating is unchanged", async () => {
		const starting = user([movie("a", { rating: 7.14, next: true })]);
		const store = createMemoryUserDocumentStore(starting);
		let transactions = 0;
		const transact = store.transact.bind(store);
		store.transact = (update) => {
			transactions += 1;
			return transact(update);
		};
		const document = createUserDocument(store);
		const update: CatalogUpdate = {
			id: "a",
			title: "Movie a",
			rating: 7.141,
			poster: "/poster-a.jpg",
		};

		await document.refreshCatalog([update, { id: "missing", title: "Nope", rating: 1, poster: "/x.jpg" }]);

		expect(transactions).toBe(0);
		expect(document.movies()).toEqual(starting.movies);
	});

	it("rejects commands when there is no user document", async () => {
		const document = createUserDocument(createMemoryUserDocumentStore(null));

		await expect(document.add(movie("a"))).rejects.toThrow("No user document");
		await expect(document.remove("a")).rejects.toThrow("No user document");
		await expect(document.setNext("a", true)).rejects.toThrow("No user document");
		await expect(document.setTheme("dusk")).rejects.toThrow("No user document");
		await expect(document.setUsername("new-name")).rejects.toThrow("No user document");
		await expect(document.refreshCatalog([])).rejects.toThrow("No user document");
		expect(document.movies()).toEqual([]);
		expect(document.watchNext()).toEqual([]);
		expect(document.theme()).toBe("");
		expect(document.isInList("a")).toBe(false);
	});
});

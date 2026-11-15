import { describe, expect, it } from "vitest";
import type { UserList } from "../../types/list";
import { FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID } from "./listConstants";
import { findListByPathSegment, listPath, slugifyListTitle } from "./listHelpers";

function list(overrides: Partial<UserList> & Pick<UserList, "id" | "name">): UserList {
	return {
		kind: "custom",
		renamable: true,
		createdAt: new Date("2024-06-01T00:00:00.000Z"),
		...overrides,
	};
}

const system: UserList[] = [
	list({
		id: FAVORITES_LIST_ID,
		kind: "system",
		name: "Favorites",
		renamable: false,
		createdAt: new Date(0),
	}),
	list({
		id: WATCH_NEXT_LIST_ID,
		kind: "system",
		name: "Later",
		createdAt: new Date(0),
	}),
];

describe("slugifyListTitle", () => {
	it("lowercases and hyphenates the title", () => {
		expect(slugifyListTitle("Weekend Horror")).toBe("weekend-horror");
		expect(slugifyListTitle("  Ångest & Co. ")).toBe("angest-co");
	});
});

describe("list paths", () => {
	it("uses the title slug for custom lists and the id for system lists", () => {
		const horror = list({ id: "uuid-horror", name: "Weekend Horror" });
		const lists = [...system, horror];
		expect(listPath(horror, lists)).toBe("/lists/weekend-horror");
		expect(listPath(system[1]!, lists)).toBe("/lists/watch-next");
	});

	it("gives the older list the bare slug when titles collide", () => {
		const older = list({
			id: "uuid-a",
			name: "Sci-Fi",
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
		});
		const newer = list({
			id: "uuid-b",
			name: "Sci Fi",
			createdAt: new Date("2024-02-01T00:00:00.000Z"),
		});
		const lists = [...system, newer, older];
		expect(listPath(older, lists)).toBe("/lists/sci-fi");
		expect(listPath(newer, lists)).toBe("/lists/sci-fi-2");
	});

	it("avoids system list paths", () => {
		const custom = list({ id: "uuid-fav", name: "Favorites" });
		expect(listPath(custom, [...system, custom])).toBe("/lists/favorites-2");
	});

	it("resolves a slug and a legacy id", () => {
		const horror = list({ id: "884de2b4-8cb5-4f1d-a043-fe98f5ac1e05", name: "Weekend Horror" });
		const lists = [...system, horror];
		expect(findListByPathSegment(lists, "weekend-horror")?.id).toBe(horror.id);
		expect(findListByPathSegment(lists, horror.id)?.id).toBe(horror.id);
		expect(findListByPathSegment(lists, "missing")).toBeUndefined();
	});

	it("falls back to the id when the title has no slug characters", () => {
		const custom = list({ id: "uuid-emoji", name: "🎬" });
		expect(listPath(custom, [...system, custom])).toBe("/lists/uuid-emoji");
	});
});

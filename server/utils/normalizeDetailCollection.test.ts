import { describe, expect, it } from "vitest";
import { normalizeDetailCollection } from "./normalizeDetailCollection";

describe("normalizeDetailCollection", () => {
	it("sorts parts by release_date ascending", () => {
		const result = normalizeDetailCollection({
			id: 1,
			name: "Test Saga",
			parts: [
				{
					id: 3,
					title: "Part Three",
					poster_path: null,
					release_date: "2003-01-01",
					vote_average: 7,
				},
				{
					id: 1,
					title: "Part One",
					poster_path: "/a.jpg",
					release_date: "1999-01-01",
					vote_average: 8,
				},
				{
					id: 2,
					title: "Part Two",
					poster_path: null,
					release_date: "2001-06-01",
					vote_average: 6,
				},
			],
		});

		expect(result.name).toBe("Test Saga");
		expect(result.parts.map((part) => part.id)).toEqual([1, 2, 3]);
	});
});

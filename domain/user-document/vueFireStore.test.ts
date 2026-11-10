import { describe, expect, it } from "vitest";
import { toUserDocument } from "./vueFireStore";

describe("toUserDocument", () => {
	it("keeps an explicit tv type and leaves an untyped row untyped", () => {
		const doc = toUserDocument(
			{
				uid: "user-1",
				username: "anna",
				email: "a@example.com",
				theme: "emerald",
				movies: [
					{
						id: "1396",
						mediaType: "tv",
						title: "Breaking Bad",
						rating: 8.9,
						poster: "/bb.jpg",
						seen: false,
						next: false,
						timestamp: "2026-01-01T00:00:00.000Z",
					},
					{
						id: "550",
						title: "Fight Club",
						rating: 8.4,
						poster: "/fc.jpg",
						seen: false,
						next: true,
						timestamp: "2026-02-01T00:00:00.000Z",
					},
				],
			},
			"user-1",
		);

		expect(doc?.movies.find((movie) => movie.id === "1396")?.mediaType).toBe("tv");
		expect(doc?.movies.find((movie) => movie.id === "550")?.mediaType).toBeUndefined();
		expect(doc?.movies.find((movie) => movie.id === "550")?.next).toBe(true);
	});
});

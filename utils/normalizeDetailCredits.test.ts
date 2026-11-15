import { describe, expect, it } from "vitest";
import {
	formatCreditNames,
	normalizeMovieKeyCredits,
	normalizeTvKeyCredits,
	withDetailCredits,
} from "./normalizeDetailCredits";

describe("normalizeMovieKeyCredits", () => {
	it("picks directors and prefers original music composer", () => {
		const credits = normalizeMovieKeyCredits({
			crew: [
				{ id: 1, credit_id: "d1", name: "Lana Wachowski", job: "Director", profile_path: "/a.jpg" },
				{ id: 2, credit_id: "d2", name: "Lilly Wachowski", job: "Director", profile_path: null },
				{ id: 3, credit_id: "m-weak", name: "Don Davis", job: "Music", profile_path: null },
				{ id: 3, credit_id: "m-best", name: "Don Davis", job: "Original Music Composer", profile_path: "/m.jpg" },
				{ id: 4, credit_id: "w1", name: "Someone", job: "Writer", profile_path: null },
			],
		});

		expect(credits.directors.map((person) => person.name)).toEqual([
			"Lana Wachowski",
			"Lilly Wachowski",
		]);
		expect(credits.music).toEqual([
			{
				id: 3,
				creditId: "m-best",
				name: "Don Davis",
				profilePath: "/m.jpg",
			},
		]);
		expect(credits.createdBy).toEqual([]);
	});
});

describe("normalizeTvKeyCredits", () => {
	it("uses created_by and aggregate music jobs", () => {
		const credits = normalizeTvKeyCredits({
			created_by: [
				{ id: 10, credit_id: "c1", name: "Vince Gilligan", profile_path: "/v.jpg" },
			],
			aggregate_credits: {
				crew: [
					{
						id: 20,
						name: "Dave Porter",
						profile_path: "/d.jpg",
						jobs: [
							{ credit_id: "j1", job: "Original Music Composer", episode_count: 62 },
							{ credit_id: "j2", job: "Music", episode_count: 2 },
						],
					},
					{
						id: 21,
						name: "A Director",
						jobs: [{ credit_id: "j3", job: "Director", episode_count: 3 }],
					},
				],
			},
		});

		expect(credits.createdBy[0]?.name).toBe("Vince Gilligan");
		expect(credits.directors).toEqual([]);
		expect(credits.music[0]).toMatchObject({
			id: 20,
			name: "Dave Porter",
			creditId: "j1",
		});
	});

	it("falls back to episode credits crew when aggregate crew is missing", () => {
		const credits = normalizeTvKeyCredits({
			created_by: [],
			credits: {
				crew: [
					{ id: 9, credit_id: "m1", name: "Theme Person", job: "Music" },
				],
			},
		});

		expect(credits.music.map((person) => person.name)).toEqual(["Theme Person"]);
	});
});

describe("withDetailCredits", () => {
	it("attaches movie credits without createdBy", () => {
		const result = withDetailCredits(
			{
				id: 1,
				credits: {
					crew: [{ id: 1, credit_id: "d", name: "A Director", job: "Director" }],
				},
			},
			"movie",
		);

		expect(result.detailCredits.directors).toHaveLength(1);
		expect(result.detailCredits.createdBy).toHaveLength(0);
	});
});

describe("formatCreditNames", () => {
	it("joins up to the max names", () => {
		expect(
			formatCreditNames(
				[
					{ id: 1, creditId: "a", name: "Ada", profilePath: null },
					{ id: 2, creditId: "b", name: "Bea", profilePath: null },
					{ id: 3, creditId: "c", name: "Cyd", profilePath: null },
				],
				2,
			),
		).toBe("Ada, Bea");
	});
});

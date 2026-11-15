import { describe, expect, it } from "vitest";
import { buildTvSeasonSummaries } from "./buildTvSeasonSummaries";

describe("buildTvSeasonSummaries", () => {
	it("uses API seasons when present", () => {
		const result = buildTvSeasonSummaries({
			number_of_seasons: 3,
			seasons: [
				{
					season_number: 0,
					name: "Specials",
					id: 1,
					episode_count: 0,
					overview: "",
					poster_path: null,
					air_date: "",
					vote_average: 0,
				},
				{
					season_number: 1,
					name: "Season 1",
					id: 2,
					episode_count: 8,
					overview: "",
					poster_path: null,
					air_date: "",
					vote_average: 7,
				},
			],
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.season_number).toBe(1);
	});

	it("falls back to number_of_seasons when seasons array is empty", () => {
		const result = buildTvSeasonSummaries({
			number_of_seasons: 2,
			seasons: [],
		});
		expect(result.map((season) => season.season_number)).toEqual([1, 2]);
	});
});

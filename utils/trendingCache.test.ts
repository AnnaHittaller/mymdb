import { describe, expect, it } from "vitest";
import { parseTrendingList } from "./trendingCache";

describe("parseTrendingList", () => {
	it("rejects cached rows missing mediaType", () => {
		expect(
			parseTrendingList([
				{ id: 273866, title: "The Other Bennet Sister", mediaType: "tv" },
			]),
		).toHaveLength(1);
		expect(
			parseTrendingList([{ id: 273866, title: "The Other Bennet Sister" }]),
		).toBeUndefined();
		expect(parseTrendingList([])).toEqual([]);
	});
});

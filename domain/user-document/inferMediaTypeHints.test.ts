import { describe, expect, it } from "vitest";
import { inferMediaTypeHints } from "./inferMediaTypeHints";

describe("inferMediaTypeHints", () => {
	it("requests movie and tv summaries and keeps the title match", async () => {
		const requested: string[] = [];
		const hints = await inferMediaTypeHints(
			[{ id: "273866", title: "The Other Bennet Sister" }],
			async (entries) => {
				requested.push(entries);
				return [
					{ id: "273866", title: "Some Movie", mediaType: "movie" },
					{ id: "273866", title: "the other bennet sister", mediaType: "tv" },
				];
			},
		);

		expect(requested).toEqual(["movie:273866,tv:273866"]);
		expect(hints).toEqual([{ id: "273866", mediaType: "tv" }]);
	});
});

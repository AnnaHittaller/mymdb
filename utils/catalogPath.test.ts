import { describe, expect, it } from "vitest";
import { catalogDetailPath } from "./catalogPath";

describe("catalogDetailPath", () => {
	it("routes tv and movie ids to different pages", () => {
		expect(catalogDetailPath(273866, "tv")).toBe("/show/273866");
		expect(catalogDetailPath(273866, "movie")).toBe("/movie/273866");
	});
});

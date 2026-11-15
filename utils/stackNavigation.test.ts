import { describe, expect, it } from "vitest";
import { stackBackConfigForName } from "../constants/stackNavigation";

describe("stackBackConfigForName", () => {
	it("returns browse fallback for movie and show detail", () => {
		expect(stackBackConfigForName("movie-id")?.fallback).toBe("/browse");
		expect(stackBackConfigForName("show-id")?.fallback).toBe("/browse");
	});

	it("returns null for non-stack routes", () => {
		expect(stackBackConfigForName("browse")).toBeNull();
		expect(stackBackConfigForName("index")).toBeNull();
	});
});
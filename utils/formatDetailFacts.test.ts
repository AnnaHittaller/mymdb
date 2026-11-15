import { describe, expect, it } from "vitest";
import { formatDetailYear, formatRatingOutOfTen, formatRuntimeMinutes } from "./formatDetailFacts";

describe("formatRuntimeMinutes", () => {
	it("formats hours and minutes", () => {
		expect(formatRuntimeMinutes(112)).toBe("1h 52m");
		expect(formatRuntimeMinutes(120)).toBe("2h");
		expect(formatRuntimeMinutes(45)).toBe("45m");
	});

	it("drops missing or zero runtimes", () => {
		expect(formatRuntimeMinutes(0)).toBeNull();
		expect(formatRuntimeMinutes(null)).toBeNull();
	});
});

describe("formatDetailYear", () => {
	it("reads a year from a release date", () => {
		expect(formatDetailYear("2024-06-01")).toBe("2024");
		expect(formatDetailYear(null)).toBeNull();
	});
});

describe("formatRatingOutOfTen", () => {
	it("shows one decimal out of ten and skips empty ratings", () => {
		expect(formatRatingOutOfTen(7.64)).toBe("7.6/10");
		expect(formatRatingOutOfTen(0)).toBeNull();
	});
});

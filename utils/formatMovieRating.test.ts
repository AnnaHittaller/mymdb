import { describe, expect, it } from "vitest";
import { formatMovieRating } from "./formatMovieRating";

describe("formatMovieRating", () => {
	it("formats a positive average", () => {
		expect(formatMovieRating(7.256)).toBe("7.3");
	});

	it("shows N/A when TMDB has no votes", () => {
		expect(formatMovieRating(0)).toBe("N/A");
	});

	it("shows N/A for missing or invalid values", () => {
		expect(formatMovieRating(null)).toBe("N/A");
		expect(formatMovieRating(undefined)).toBe("N/A");
		expect(formatMovieRating(Number.NaN)).toBe("N/A");
	});

	it("honors a custom missing label", () => {
		expect(formatMovieRating(0, "—")).toBe("—");
	});
});

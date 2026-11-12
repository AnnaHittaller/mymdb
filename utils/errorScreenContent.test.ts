import { afterEach, describe, expect, it, vi } from "vitest";
import { pickRandomErrorScreenContent } from "../constants/errorScreenContent";

describe("pickRandomErrorScreenContent", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns fixed auth and rate-limit screens", () => {
		expect(pickRandomErrorScreenContent(401).title).toBe(
			"You need a ticket for this",
		);
		expect(pickRandomErrorScreenContent(403).title).toBe("Access denied");
		expect(pickRandomErrorScreenContent(429).title).toBe(
			"Slow down, superstar",
		);
	});

	it("picks from the 404 pool", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		expect(pickRandomErrorScreenContent(404).icons.length).toBeGreaterThan(0);
	});

	it("includes cat duo as a 404 variant", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const first = pickRandomErrorScreenContent(404);
		expect(first.title).toBe("That’s not the page you think it is");
		expect(first.icons).toHaveLength(2);
	});
});

import { describe, expect, it } from "vitest";
import { pathFromRedirect } from "./pathFromRedirect";

describe("pathFromRedirect", () => {
	it("keeps an in-app path", () => {
		expect(pathFromRedirect("/movie/550")).toBe("/movie/550");
		expect(pathFromRedirect(["/"])).toBe("/");
	});

	it("falls back when the redirect could leave the app", () => {
		expect(pathFromRedirect("https://example.com")).toBe("/");
		expect(pathFromRedirect("//example.com")).toBe("/");
		expect(pathFromRedirect(undefined)).toBe("/");
		expect(pathFromRedirect("movie/550")).toBe("/");
	});
});

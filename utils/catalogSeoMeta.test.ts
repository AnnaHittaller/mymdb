import { describe, expect, it } from "vitest";
import {
	catalogMetaDescription,
	catalogPosterOgImage,
	sharedListOgImage,
} from "./catalogSeoMeta";
import type { PublishedListItem } from "../types/share";

describe("catalogSeoMeta", () => {
	it("builds TMDB poster OG URLs", () => {
		expect(catalogPosterOgImage("/abc.jpg")).toContain("/abc.jpg");
		expect(catalogPosterOgImage("")).toBeUndefined();
	});

	it("uses first list poster or site fallback for shared lists", () => {
		const items: PublishedListItem[] = [
			{ id: "1", mediaType: "movie", title: "A", poster: null },
			{ id: "2", mediaType: "movie", title: "B", poster: "/b.jpg" },
		];
		expect(sharedListOgImage(items, "https://mymdb.example")).toContain("/b.jpg");
		expect(sharedListOgImage([], "https://mymdb.example")).toBe(
			"https://mymdb.example/og-mymdb.svg",
		);
	});

	it("truncates long overviews", () => {
		const long = "a".repeat(200);
		const result = catalogMetaDescription(long, "fallback", 160);
		expect(result.length).toBeLessThanOrEqual(160);
		expect(result.endsWith("…")).toBe(true);
	});
});
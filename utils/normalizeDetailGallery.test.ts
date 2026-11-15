import { describe, expect, it } from "vitest";
import { buildDetailGallery } from "./normalizeDetailGallery";
import type { TmdbVideoResult } from "~/types/trailer";

const trailer: TmdbVideoResult = {
	iso_639_1: "en",
	iso_3166_1: "US",
	name: "Official Trailer",
	key: "abc",
	site: "YouTube",
	size: 1080,
	type: "Trailer",
	official: true,
	published_at: "2024-01-01T00:00:00.000Z",
	id: "video-1",
};

describe("buildDetailGallery", () => {
	it("orders backdrops then posters and skips the primary poster", () => {
		const items = buildDetailGallery({
			title: "The Midnight Library",
			primaryPosterPath: "/main.jpg",
			primaryBackdropPath: "/wide.jpg",
			backdrops: [
				{ file_path: "/wide.jpg", aspect_ratio: 1.78 },
				{ file_path: "/wide-2.jpg", aspect_ratio: 1.85, iso_639_1: null, vote_average: 4 },
			],
			posters: [
				{ file_path: "/main.jpg", aspect_ratio: 0.67 },
				{ file_path: "/alt.jpg", aspect_ratio: 0.67, iso_639_1: "en" },
			],
			videos: [trailer],
		});

		expect(items.map((item) => item.id)).toEqual([
			"backdrop:/wide.jpg",
			"backdrop:/wide-2.jpg",
			"poster:/alt.jpg",
		]);
		expect(items[2]).toMatchObject({ aspectRatio: 0.67 });
	});

	it("prefers an english poster over another language", () => {
		const items = buildDetailGallery({
			title: "Example",
			posters: [
				{ file_path: "/fr.jpg", iso_639_1: "fr", vote_average: 10 },
				{ file_path: "/en.jpg", iso_639_1: "en", vote_average: 1 },
			],
		});
		expect(items.map((item) => item.id)).toEqual(["poster:/en.jpg", "poster:/fr.jpg"]);
	});
});

import { describe, expect, it } from "vitest";
import { embedUrl, pickBestTrailer, watchUrl } from "./tmdbVideo";
import type { TmdbVideoResult } from "~/types/trailer";

const fightClubFixture: TmdbVideoResult[] = [
	{
		iso_639_1: "en",
		iso_3166_1: "US",
		name: "Fight Club (1999) Trailer",
		key: "O-b2VfmmbyA",
		site: "YouTube",
		size: 720,
		type: "Trailer",
		official: false,
		published_at: "2016-03-05T02:03:14.000Z",
		id: "639d5326be6d88007f170f44",
	},
	{
		iso_639_1: "en",
		iso_3166_1: "US",
		name: "#TBT Trailer",
		key: "BdJKm16Co6M",
		site: "YouTube",
		size: 1080,
		type: "Trailer",
		official: true,
		published_at: "2014-10-02T19:20:22.000Z",
		id: "5c9294240e0a267cd516835f",
	},
];

describe("pickBestTrailer", () => {
	it("prefers official Trailer over unofficial", () => {
		const trailer = pickBestTrailer(fightClubFixture);
		expect(trailer?.key).toBe("BdJKm16Co6M");
		expect(trailer?.site).toBe("YouTube");
	});

	it("prefers Trailer over Teaser when both exist", () => {
		const results: TmdbVideoResult[] = [
			{ ...fightClubFixture[1]!, type: "Teaser", key: "teaser-key", official: true },
			{ ...fightClubFixture[1]!, type: "Trailer", key: "trailer-key", official: true },
		];
		expect(pickBestTrailer(results)?.key).toBe("trailer-key");
	});

	it("returns null when no embeddable trailer or teaser", () => {
		expect(pickBestTrailer([{ ...fightClubFixture[0]!, type: "Clip" }])).toBeNull();
		expect(pickBestTrailer([{ ...fightClubFixture[0]!, site: "Other" }])).toBeNull();
	});
});

describe("embedUrl and watchUrl", () => {
	it("builds YouTube nocookie embed", () => {
		expect(embedUrl("YouTube", "abc123")).toBe(
			"https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0",
		);
	});

	it("builds Vimeo embed and watch links", () => {
		expect(embedUrl("Vimeo", "282875052")).toBe(
			"https://player.vimeo.com/video/282875052?autoplay=1&dnt=1",
		);
		expect(watchUrl("Vimeo", "282875052")).toBe("https://vimeo.com/282875052");
	});

	it("returns null for unsupported sites", () => {
		expect(embedUrl("Dailymotion", "x")).toBeNull();
		expect(watchUrl("Dailymotion", "x")).toBeNull();
	});
});

import { describe, expect, it } from "vitest";
import {
	castIdsFromWithCastParam,
	decodeWithCastParam,
	decodeKeywordsParam,
	encodeKeywordsParam,
	encodeWithCastParam,
	keywordIdsForDiscover,
} from "./browseQuery";

describe("browse cast query", () => {
	it("round-trips names that contain commas or colons", () => {
		const people = [
			{ id: 31, name: "Hanks, Tom" },
			{ id: 62, name: "Jr: Name" },
		]
		const encoded = encodeWithCastParam(people)
		expect(encoded.includes(",")).toBe(true)
		expect(decodeWithCastParam(encoded)).toEqual(people)
	})

	it("reads plain id lists and drops names before TMDB", () => {
		expect(castIdsFromWithCastParam("123,456")).toBe("123,456")
		const encoded = encodeWithCastParam([{ id: 123, name: "Tom Hanks" }])
		expect(castIdsFromWithCastParam(encoded)).toBe("123")
	})
})

describe("browse keyword query", () => {
	it("round-trips names that contain commas or colons", () => {
		const keywords = [
			{ id: 10, name: "spy, thriller" },
			{ id: 20, name: "Bond: agent" },
		]
		const encoded = encodeKeywordsParam(keywords)
		expect(decodeKeywordsParam(encoded)).toEqual(keywords)
	})

	it("formats discover ids with pipe OR", () => {
		const encoded = encodeKeywordsParam([
			{ id: 1, name: "a" },
			{ id: 2, name: "b" },
		])
		expect(keywordIdsForDiscover(encoded)).toBe("1|2")
	})
})

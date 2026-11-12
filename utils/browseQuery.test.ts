import { describe, expect, it } from "vitest";
import {
	castIdsFromWithCastParam,
	decodeWithCastParam,
	encodeWithCastParam,
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

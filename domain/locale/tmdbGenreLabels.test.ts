import { describe, expect, it } from "vitest"
import { localizeTmdbGenreName, localizeTmdbGenreNames, overlayTmdbGenreNameMap } from "./tmdbGenreLabels"

describe("tmdbGenreLabels", () => {
	it("translates Action & Adventure by id", () => {
		expect(localizeTmdbGenreName("Action & Adventure", "hu-HU", 10759)).toBe("Akció és kaland")
		expect(localizeTmdbGenreName("Action & Adventure", "de", 10759)).toBe("Action und Abenteuer")
	})

	it("translates Soap by id", () => {
		expect(localizeTmdbGenreName("Soap", "hu-HU", 10766)).toBe("Szappanopera")
		expect(localizeTmdbGenreName("Soap", "de", 10766)).toBe("Seifenoper")
	})

	it("translates leftover English names without ids", () => {
		expect(
			localizeTmdbGenreNames(["Animációs", "Action & Adventure", "Sci-Fi & Fantasy"], "hu"),
		).toEqual(["Animációs", "Akció és kaland", "Sci-fi és fantasy"])
	})

	it("overlays a genre id map", () => {
		const map = overlayTmdbGenreNameMap(
			new Map([
				[16, "Animációs"],
				[10759, "Action & Adventure"],
			]),
			"hu-HU",
		)
		expect(map.get(10759)).toBe("Akció és kaland")
		expect(map.get(16)).toBe("Animációs")
	})
})
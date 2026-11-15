import { describe, expect, it } from "vitest"
import { profileWatchProviders, watchProviderPriority } from "./tmdbWatchProviders"

describe("profileWatchProviders", () => {
	it("sorts by TMDB display priority for the region, not name", () => {
		const movie = [
			{ provider_id: 1, provider_name: "Zeta Stream", logo_path: null, display_priorities: { DE: 50 } },
			{ provider_id: 8, provider_name: "Netflix", logo_path: null, display_priorities: { DE: 1 } },
		]
		const tv = [
			{ provider_id: 9, provider_name: "Amazon Prime Video", logo_path: null, display_priorities: { DE: 3 } },
		]
		const list = profileWatchProviders(movie, tv, "DE", 2)
		expect(list.map((entry) => entry.provider_id)).toEqual([8, 9])
	})

	it("caps at the requested limit", () => {
		const rows = Array.from({ length: 30 }, (_, index) => ({
			provider_id: index + 1,
			provider_name: `Provider ${index}`,
			logo_path: null,
			display_priorities: { US: index },
		}))
		expect(profileWatchProviders(rows, [], "US", 24)).toHaveLength(24)
	})
})

describe("watchProviderPriority", () => {
	it("prefers per-region priority", () => {
		expect(
			watchProviderPriority(
				{ provider_id: 1, provider_name: "X", logo_path: null, display_priority: 9, display_priorities: { DE: 2 } },
				"DE",
			),
		).toBe(2)
	})
})

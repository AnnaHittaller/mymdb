import { describe, expect, it } from "vitest"
import { FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID } from "../domain/user-document/listConstants"
import type { UserList } from "../types/list"
import { systemListDisplayName } from "./systemListDisplayName"

const t = (key: string) => key

function list(partial: Partial<UserList> & Pick<UserList, "id" | "name">): UserList {
	return {
		kind: partial.kind ?? "system",
		renamable: partial.renamable ?? false,
		createdAt: new Date(0),
		...partial,
	}
}

describe("systemListDisplayName", () => {
	it("localizes favorites", () => {
		expect(
			systemListDisplayName(list({ id: FAVORITES_LIST_ID, name: "Favorites" }), t),
		).toBe("lists.systemFavorites")
	})

	it("localizes default watch next seed name", () => {
		expect(
			systemListDisplayName(list({ id: WATCH_NEXT_LIST_ID, name: "Watch next", renamable: true }), t),
		).toBe("lists.watchNext")
	})

	it("keeps custom watch next title", () => {
		expect(
			systemListDisplayName(list({ id: WATCH_NEXT_LIST_ID, name: "My queue", renamable: true }), t),
		).toBe("My queue")
	})
})
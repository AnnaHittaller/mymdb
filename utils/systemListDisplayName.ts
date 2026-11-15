import type { UserList } from "../types/list";
import { FAVORITES_LIST_ID, WATCH_NEXT_LIST_ID } from "../domain/user-document/listConstants";

const WATCH_NEXT_SEED_NAME = "Watch next";

export function systemListDisplayName(
	list: UserList,
	t: (key: string) => string,
): string {
	if (list.id === FAVORITES_LIST_ID) {
		return t("lists.systemFavorites");
	}
	if (list.id === WATCH_NEXT_LIST_ID && list.name === WATCH_NEXT_SEED_NAME) {
		return t("lists.watchNext");
	}
	return list.name;
}
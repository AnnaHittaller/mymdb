export const FAVORITES_LIST_ID = "favorites";
export const WATCH_NEXT_LIST_ID = "watch-next";

export const MAX_LIST_TITLES = 200;
export const MAX_CUSTOM_LISTS = 50;
export const MIN_LIST_NAME_LENGTH = 1;
export const MAX_LIST_NAME_LENGTH = 60;

export const SCHEMA_VERSION_V2 = 2;

export const SYSTEM_LIST_EPOCH = new Date(0);

export class ListCapError extends Error {
	constructor(
		readonly listId: string,
		message = "This list is full (200 titles). Remove a title to add more.",
	) {
		super(message);
		this.name = "ListCapError";
	}
}

export class ListCountCapError extends Error {
	constructor(message = "You can create at most 50 custom lists.") {
		super(message);
		this.name = "ListCountCapError";
	}
}

export class ShareListNotFoundError extends Error {
	constructor(message = "List not found.") {
		super(message);
		this.name = "ShareListNotFoundError";
	}
}

export class ShareListCapError extends Error {
	constructor(message = "This list has too many titles to share.") {
		super(message);
		this.name = "ShareListCapError";
	}
}
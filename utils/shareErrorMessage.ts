export function shareErrorMessage(error: unknown, fallback: string): string {
	if (
		error
		&& typeof error === "object"
		&& "data" in error
		&& error.data
		&& typeof error.data === "object"
		&& "message" in error.data
		&& typeof error.data.message === "string"
	) {
		return error.data.message;
	}
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}
	return fallback;
}
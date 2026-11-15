export function pathFromRedirect(value: unknown, fallback = "/"): string {
	const raw = Array.isArray(value) ? value[0] : value;
	if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
		return fallback;
	}
	return raw;
}

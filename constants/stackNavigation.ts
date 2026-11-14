export type StackBackConfig = {
	fallback: string;
};

/** Stack pages: show back UI; not primary nav destinations. */
const STACK_BY_ROUTE_NAME: Record<string, StackBackConfig> = {
	"movie-id": { fallback: "/browse" },
	"show-id": { fallback: "/browse" },
	"trending-movies": { fallback: "/" },
	"trending-shows": { fallback: "/" },
	"coming-soon": { fallback: "/" },
	"lists-slug": { fallback: "/lists" },
};

export function stackBackConfigForName(name: string | symbol | null | undefined): StackBackConfig | null {
	if (typeof name !== "string") return null;
	return STACK_BY_ROUTE_NAME[name] ?? null;
}
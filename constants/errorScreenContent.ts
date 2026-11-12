/** Icon ids in the `@iconify-json/streamline-memes` set. */
export type ErrorScreenContent = {
	icons: readonly string[];
	title: string;
	description: string;
};

const meme = (name: string) => name;

const NOT_FOUND_VARIANTS: readonly ErrorScreenContent[] = [
	{
		icons: [
			meme("pointing-at-cat-meme-hand-drawn"),
			meme("cat-getting-pointed-at-hand-drawn"),
		],
		title: "That’s not the page you think it is",
		description:
			"This URL isn’t in the catalog. The internet argued; the cat won.",
	},
	{
		icons: [meme("confused-nick-young")],
		title: "Deleted scene energy",
		description: "There’s nothing at this URL in the watchlist universe.",
	},
	{
		icons: [meme("nyan-cat")],
		title: "Buffering… forever",
		description: "Whatever was here, it’s not in our catalog anymore.",
	},
	{
		icons: [meme("awkward-look-monkey")],
		title: "This scene didn’t make the final cut",
		description:
			"That URL isn’t in our catalog. Maybe a typo, maybe it wandered off set.",
	},
	{
		icons: [meme("not-simply")],
		title: "One does not simply walk into this URL",
		description: "This page isn’t in the watchlist universe.",
	},
] as const;

const SERVER_ERROR_VARIANTS: readonly ErrorScreenContent[] = [
	{
		icons: [meme("this-is-fine")],
		title: "Everything is… technically fine",
		description: "Our servers hiccuped. Try again in a moment or go home.",
	},
	{
		icons: [meme("this-is-fine")],
		title: "Backstage is on fire",
		description: "Not your fault. We’re putting out the flames.",
	},
	{
		icons: [meme("computer-guy-meme")],
		title: "Have you tried turning the cinema off and on?",
		description: "Something went wrong on our servers. Sorry about that.",
	},
	{
		icons: [meme("picard-facepalm")],
		title: "Make it so… didn’t work",
		description: "Our servers need a minute. Refresh or head home.",
	},
	{
		icons: [meme("disappointed-fan")],
		title: "We wanted to show you this",
		description:
			"The request didn’t survive the third act. Try again in a bit.",
	},
	{
		icons: [meme("crying-jordan")],
		title: "Rough watch",
		description:
			"This page hit an error. Come back when we’ve stopped the bleeding.",
	},
	{
		icons: [meme("nervous-pepe-frog")],
		title: "Something went wrong behind the curtain",
		description: "We’re looking into it. Sorry for the interruption.",
	},
] as const;

const AUTH_401: ErrorScreenContent = {
	icons: [meme("side-eyeing-cloe")],
	title: "You need a ticket for this",
	description: "Sign in to view this page.",
};

const AUTH_403: ErrorScreenContent = {
	icons: [meme("side-eyeing-cloe")],
	title: "Access denied",
	description: "You don’t have permission to view this page.",
};

const RATE_LIMIT: ErrorScreenContent = {
	icons: [meme("grumpy-cat")],
	title: "Slow down, superstar",
	description: "Too many requests. Chill a moment, then retry.",
};

function pickRandomFromPool<T>(pool: readonly T[]): T {
	return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Picks a random variant per call (pair with `useState` on the error page for SSR-safe hydration). */
export function pickRandomErrorScreenContent(
	statusCode: number,
): ErrorScreenContent {
	if (statusCode === 404) {
		return pickRandomFromPool(NOT_FOUND_VARIANTS);
	}
	if (statusCode === 401) {
		return AUTH_401;
	}
	if (statusCode === 403) {
		return AUTH_403;
	}
	if (statusCode === 429) {
		return RATE_LIMIT;
	}
	return pickRandomFromPool(SERVER_ERROR_VARIANTS);
}

/** Icon ids in the `@iconify-json/streamline-memes` set. */
export type ErrorScreenContent = {
	icons: readonly string[]
	title: string
	description: string
}

const meme = (name: string) => name

/** Icons + i18n key under `errors.notFound.*` (one object per variant). */
export type ErrorMemeVariant = {
	readonly icons: readonly string[]
	readonly messageKey: string
}

export const NOT_FOUND_ERROR_VARIANTS: readonly ErrorMemeVariant[] = [
	{
		messageKey: "pointingAtCat",
		icons: [
			meme("pointing-at-cat-meme-hand-drawn"),
			meme("cat-getting-pointed-at-hand-drawn"),
		],
	},
	{
		messageKey: "deletedScene",
		icons: [meme("confused-nick-young")],
	},
	{
		messageKey: "bufferingForever",
		icons: [meme("nyan-cat")],
	},
	{
		messageKey: "finalCut",
		icons: [meme("awkward-look-monkey")],
	},
	{
		messageKey: "notSimplyWalk",
		icons: [meme("not-simply")],
	},
] as const

export const SERVER_ERROR_VARIANTS: readonly ErrorMemeVariant[] = [
	{ messageKey: "technicallyFine", icons: [meme("this-is-fine")] },
	{ messageKey: "backstageOnFire", icons: [meme("this-is-fine")] },
	{ messageKey: "turnCinemaOffOn", icons: [meme("computer-guy-meme")] },
	{ messageKey: "makeItSo", icons: [meme("picard-facepalm")] },
	{ messageKey: "thirdAct", icons: [meme("disappointed-fan")] },
	{ messageKey: "roughWatch", icons: [meme("crying-jordan")] },
	{ messageKey: "behindCurtain", icons: [meme("nervous-pepe-frog")] },
] as const

const AUTH_401_ICONS = [meme("side-eyeing-cloe")] as const
const AUTH_403_ICONS = [meme("side-eyeing-cloe")] as const
const RATE_LIMIT_ICONS = [meme("grumpy-cat")] as const

type Translate = (key: string) => string

function pickRandomFromPool<T>(pool: readonly T[]): T {
	return pool[Math.floor(Math.random() * pool.length)]!
}

function copyForMemeVariant(
	t: Translate,
	group: "notFound" | "server",
	variant: ErrorMemeVariant,
): Pick<ErrorScreenContent, "title" | "description"> {
	const base = `errors.${group}.${variant.messageKey}`
	return {
		title: t(`${base}.title`),
		description: t(`${base}.description`),
	}
}

function materializeMemeVariant(
	t: Translate,
	group: "notFound" | "server",
	variant: ErrorMemeVariant,
): ErrorScreenContent {
	return {
		icons: variant.icons,
		...copyForMemeVariant(t, group, variant),
	}
}

/** Picks a random variant per call (pair with `useState` on the error page for SSR-safe hydration). */
export function pickRandomErrorScreenContent(
	statusCode: number,
	t: Translate,
): ErrorScreenContent {
	if (statusCode === 404) {
		return materializeMemeVariant(t, "notFound", pickRandomFromPool(NOT_FOUND_ERROR_VARIANTS))
	}
	if (statusCode === 401) {
		return {
			icons: AUTH_401_ICONS,
			title: t("errors.auth401.title"),
			description: t("errors.auth401.description"),
		}
	}
	if (statusCode === 403) {
		return {
			icons: AUTH_403_ICONS,
			title: t("errors.auth403.title"),
			description: t("errors.auth403.description"),
		}
	}
	if (statusCode === 429) {
		return {
			icons: RATE_LIMIT_ICONS,
			title: t("errors.rateLimit.title"),
			description: t("errors.rateLimit.description"),
		}
	}
	return materializeMemeVariant(t, "server", pickRandomFromPool(SERVER_ERROR_VARIANTS))
}
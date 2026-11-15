import { normalizeAppLocale } from "../domain/locale/appLocale"

/** Locale-aware short display for `YYYY-MM-DD`. */
export function formatReleaseDate(
	isoDate: string | undefined | null,
	locale = "en",
): string {
	if (!isoDate || isoDate.length < 10) return ""
	const year = isoDate.slice(0, 4)
	const month = Number.parseInt(isoDate.slice(5, 7), 10)
	const day = Number.parseInt(isoDate.slice(8, 10), 10)
	if (!Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(day) || day < 1) {
		return year
	}

	const appLocale = normalizeAppLocale(locale)

	if (appLocale === "hu") {
		const monthPart = String(month).padStart(2, "0")
		const dayPart = String(day).padStart(2, "0")
		return `${year}. ${monthPart}. ${dayPart}.`
	}

	const date = new Date(Number(year), month - 1, day)
	if (Number.isNaN(date.getTime())) return year

	if (appLocale === "de") {
		const monthName = new Intl.DateTimeFormat("de-DE", { month: "short" }).format(date).replace(/\.$/, "")
		return `${day}. ${monthName}. ${year}`
	}

	const monthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
	return `${year}, ${monthName}. ${day}`
}
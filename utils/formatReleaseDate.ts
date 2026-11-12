const RELEASE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

/** Short display for `YYYY-MM-DD` (e.g. 12 Mar 2026). */
export function formatReleaseDate(isoDate: string | undefined | null): string {
	if (!isoDate || isoDate.length < 10) return ""
	const monthIndex = Number.parseInt(isoDate.slice(5, 7), 10) - 1
	const day = Number.parseInt(isoDate.slice(8, 10), 10)
	const year = isoDate.slice(0, 4)
	if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11 || !Number.isFinite(day)) {
		return year
	}
	const month = RELEASE_MONTHS[monthIndex]
	if (!month) return year
	return day === 1 ? `${month} ${year}` : `${day} ${month} ${year}`
}

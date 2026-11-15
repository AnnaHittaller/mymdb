/** TMDB uses 0 when there are no votes; treat that like missing in the UI. */
export function formatMovieRating(
	value: number | null | undefined,
	na = "N/A",
): string {
	if (value == null || Number.isNaN(value) || value === 0) return na;
	return value.toFixed(1);
}

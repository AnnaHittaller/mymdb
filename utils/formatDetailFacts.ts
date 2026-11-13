import { formatMovieRating } from "./formatMovieRating";

export function formatRuntimeMinutes(minutes: number | null | undefined): string | null {
	if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
	const rounded = Math.round(minutes);
	const hours = Math.floor(rounded / 60);
	const mins = rounded % 60;
	if (hours && mins) return `${hours}h ${mins}m`;
	if (hours) return `${hours}h`;
	return `${mins}m`;
}

export function formatDetailYear(value: unknown): string | null {
	if (value == null || value === "") return null;
	const raw = value instanceof Date ? String(value.getUTCFullYear()) : String(value);
	const match = raw.match(/\d{4}/);
	return match?.[0] ?? null;
}

export function formatRatingOutOfTen(value: number | null | undefined): string | null {
	const label = formatMovieRating(value, "");
	if (!label) return null;
	return `${label}/10`;
}

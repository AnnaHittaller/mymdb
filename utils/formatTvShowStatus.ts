/** TMDB returns these status strings in English even for localized detail requests. */
const TV_STATUS_I18N_KEYS: Record<string, string> = {
	Ended: "detail.tvStatus.ended",
	"Returning Series": "detail.tvStatus.returningSeries",
	"In Production": "detail.tvStatus.inProduction",
	Planned: "detail.tvStatus.planned",
	Canceled: "detail.tvStatus.canceled",
	Cancelled: "detail.tvStatus.canceled",
	Pilot: "detail.tvStatus.pilot",
};

export function formatTvShowStatus(
	status: string | undefined | null,
	t: (key: string) => string,
): string | undefined {
	if (!status) return undefined;
	const key = TV_STATUS_I18N_KEYS[status];
	if (key) return t(key);
	return status;
}
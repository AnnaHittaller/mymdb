import {
	fetchTmdbTvSeason,
	normalizeDetailSeason,
} from "~/server/utils/tmdbTvSeason";

export default defineEventHandler(async (event) => {
	const params = event.context.params;
	const showId = params?.id ? String(params.id) : "";
	const seasonNumber = params?.seasonNumber
		? String(params.seasonNumber)
		: "";
	if (!showId || !seasonNumber || !/^\d+$/.test(seasonNumber)) {
		throw createError({
			statusCode: 400,
			message: "Invalid show or season",
		});
	}
	try {
		const raw = await fetchTmdbTvSeason(showId, seasonNumber);
		return normalizeDetailSeason(raw);
	} catch {
		throw createError({
			statusCode: 404,
			message: "Season can't be found",
		});
	}
});

import { parseMediaType } from "~/server/utils/tmdbNormalize";

export default defineCachedEventHandler(
	async (event) => {
		const query = getQuery(event);
		const id = String(query.id ?? "");
		const mediaType = parseMediaType(String(query.mediaType ?? "")) ?? "movie";

		if (!/^\d+$/.test(id)) {
			throw createError({ statusCode: 400, message: "Invalid catalog id." });
		}

		try {
			const trailer = await fetchTmdbVideos(id, mediaType);
			return { trailer };
		} catch {
			throw createError({
				statusCode: 404,
				message: "Couldn't fetch videos for this title.",
			});
		}
	},
	{
		maxAge: 60 * 60,
		name: "catalog-videos",
		getKey: (event) => {
			const query = getQuery(event);
			const mediaType = parseMediaType(String(query.mediaType ?? "")) ?? "movie";
			return `videos:${mediaType}:${String(query.id ?? "")}`;
		},
	},
);

import { CATALOG_SUMMARY_CHUNK } from "../../constants/movie";
import type { UserMovie } from "../../types/movie";
import { catalogKey } from "../../utils/catalogKey";
import { hintsFromSummaries, type MediaTypeHint } from "./reconcileWatchlist";

type CatalogSummary = { id: string; title: string; mediaType?: MediaTypeHint["mediaType"] };

export async function inferMediaTypeHints(
	movies: Pick<UserMovie, "id" | "title" | "mediaType">[],
	fetchSummaries: (entries: string) => Promise<CatalogSummary[]>,
): Promise<MediaTypeHint[]> {
	const untyped = movies.filter((movie) => !movie.mediaType);
	if (untyped.length === 0) return [];

	const entries = untyped.flatMap((movie) => [
		catalogKey(movie.id, "movie"),
		catalogKey(movie.id, "tv"),
	]);
	const summaries: CatalogSummary[] = [];
	for (let index = 0; index < entries.length; index += CATALOG_SUMMARY_CHUNK) {
		const chunk = entries.slice(index, index + CATALOG_SUMMARY_CHUNK);
		try {
			summaries.push(...(await fetchSummaries(chunk.join(","))));
		} catch {
			// skip chunk failures; remaining rows stay untyped
		}
	}
	return hintsFromSummaries(untyped, summaries);
}

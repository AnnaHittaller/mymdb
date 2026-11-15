import type { DetailCollection } from "~/types/detailCollection";
import type {
	TmdbCollectionPart,
	TmdbCollectionResponse,
} from "~/server/utils/tmdbCollection";

function partReleaseMillis(part: TmdbCollectionPart): number {
	const raw = part.release_date?.trim();
	if (!raw) return 0;
	const millis = Date.parse(raw);
	return Number.isFinite(millis) ? millis : 0;
}

export function normalizeDetailCollection(
	raw: TmdbCollectionResponse,
): DetailCollection {
	const parts = [...(raw.parts ?? [])]
		.sort((a, b) => partReleaseMillis(a) - partReleaseMillis(b))
		.map((part) => ({
			id: part.id,
			title: part.title,
			poster_path: part.poster_path ?? null,
			vote_average: part.vote_average ?? 0,
			release_date: part.release_date ?? "",
		}));

	return {
		id: raw.id,
		name: raw.name,
		parts,
	};
}

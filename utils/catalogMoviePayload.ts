import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";
import type { MediaType } from "~/types/catalog";
import { defaultMediaType } from "~/utils/catalogKey";
import { formatMovieRating } from "~/utils/formatMovieRating";

type CatalogLike = {
	id: number | string;
	mediaType?: MediaType;
	title: string;
	poster?: string | null;
	poster_path?: string | null;
	rating?: number;
	vote_average?: number;
	genres?: string[];
};

export function togglePayloadFromCatalog(
	movie: CatalogLike,
	mediaType?: MediaType,
	genres?: string[],
): ToggleMoviePayload {
	const resolvedType = defaultMediaType(mediaType ?? movie.mediaType);
	const poster = movie.poster ?? movie.poster_path ?? "";
	return {
		id: String(movie.id),
		mediaType: resolvedType,
		title: movie.title,
		rating: movie.rating ?? movie.vote_average ?? 0,
		poster,
		...(genres?.length ? { genres } : {}),
		seen: false,
	};
}

export function formatPayloadRating(movie: CatalogLike): string {
	return formatMovieRating(movie.rating ?? movie.vote_average);
}

import type { TmdbVideoResult, TrailerRef } from "~/types/trailer";
import { pickBestTrailer } from "~/utils/tmdbVideo";

type TmdbVideosBlock = {
	results?: TmdbVideoResult[];
};

export function withTrailer<T extends Record<string, unknown>>(
	details: T & { videos?: TmdbVideosBlock },
): Omit<T, "videos"> & { trailer: TrailerRef | null } {
	const { videos, ...rest } = details;
	const trailer = pickBestTrailer(videos?.results ?? []);
	return { ...rest, trailer };
}

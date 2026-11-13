import type { DetailGalleryImage, DetailGalleryItem, DetailGalleryTrailer } from "~/types/detailGallery";
import type { TmdbVideoResult } from "~/types/trailer";
import { listPlayableTrailers } from "./tmdbVideo";

export interface TmdbGalleryImage {
	file_path?: string | null;
	aspect_ratio?: number;
	iso_639_1?: string | null;
	vote_average?: number;
	width?: number;
	height?: number;
}

const POSTER_ASPECT = 2 / 3;
const BACKDROP_ASPECT = 16 / 9;
const BACKDROP_LIMIT = 8;
const POSTER_LIMIT = 6;
const TRAILER_LIMIT = 6;

function languageRank(iso: string | null | undefined): number {
	if (iso === "en") return 0;
	if (!iso) return 1;
	return 2;
}

function aspectOf(image: TmdbGalleryImage, fallback: number): number {
	if (image.aspect_ratio && image.aspect_ratio > 0) return image.aspect_ratio;
	if (image.width && image.height && image.height > 0) return image.width / image.height;
	return fallback;
}

function rankImages(
	images: TmdbGalleryImage[],
	exclude: Set<string>,
	fallbackAspect: number,
	limit: number,
	variant: DetailGalleryImage["variant"],
	title: string,
): DetailGalleryImage[] {
	const ranked = [...images].sort(
		(a, b) =>
			languageRank(a.iso_639_1) - languageRank(b.iso_639_1) ||
			(b.vote_average ?? 0) - (a.vote_average ?? 0),
	);
	const picked: DetailGalleryImage[] = [];
	const seen = new Set(exclude);
	for (const image of ranked) {
		const filePath = image.file_path;
		if (!filePath || seen.has(filePath)) continue;
		seen.add(filePath);
		picked.push({
			kind: "image",
			id: `${variant}:${filePath}`,
			filePath,
			aspectRatio: aspectOf(image, fallbackAspect),
			variant,
			alt: `${title} ${variant}`,
		});
		if (picked.length >= limit) break;
	}
	return picked;
}

export function readDetailMediaSources(details: object): {
	title: string;
	primaryPosterPath: string | null;
	primaryBackdropPath: string | null;
	videos: TmdbVideoResult[];
} {
	const record = details as Record<string, unknown>;
	const title =
		typeof record.title === "string"
			? record.title
			: typeof record.name === "string"
				? record.name
				: "Title";
	const poster = record.poster_path;
	const backdrop = record.backdrop_path;
	const videos = (record.videos as { results?: TmdbVideoResult[] } | undefined)?.results ?? [];
	return {
		title,
		primaryPosterPath: typeof poster === "string" ? poster : null,
		primaryBackdropPath: typeof backdrop === "string" ? backdrop : null,
		videos,
	};
}

export function buildDetailGallery(input: {
	title: string;
	primaryPosterPath?: string | null;
	primaryBackdropPath?: string | null;
	posters?: TmdbGalleryImage[];
	backdrops?: TmdbGalleryImage[];
	videos?: TmdbVideoResult[];
}): DetailGalleryItem[] {
	const posterExclude = new Set<string>();
	if (input.primaryPosterPath) posterExclude.add(input.primaryPosterPath);

	const backdropExclude = new Set<string>();
	const backdrops: DetailGalleryImage[] = [];
	if (input.primaryBackdropPath) {
		backdropExclude.add(input.primaryBackdropPath);
		backdrops.push({
			kind: "image",
			id: `backdrop:${input.primaryBackdropPath}`,
			filePath: input.primaryBackdropPath,
			aspectRatio: BACKDROP_ASPECT,
			variant: "backdrop",
			alt: `${input.title} backdrop`,
		});
	}

	backdrops.push(
		...rankImages(
			input.backdrops ?? [],
			backdropExclude,
			BACKDROP_ASPECT,
			BACKDROP_LIMIT - backdrops.length,
			"backdrop",
			input.title,
		),
	);

	const posters = rankImages(
		input.posters ?? [],
		posterExclude,
		POSTER_ASPECT,
		POSTER_LIMIT,
		"poster",
		input.title,
	);

	const stillPath = backdrops[0]?.filePath ?? null;
	const trailers: DetailGalleryTrailer[] = listPlayableTrailers(input.videos ?? [])
		.slice(0, TRAILER_LIMIT)
		.map((trailer) => ({
			kind: "trailer",
			id: `${trailer.site}:${trailer.key}`,
			aspectRatio: BACKDROP_ASPECT,
			name: trailer.name,
			trailer,
			stillPath,
		}));

	if (!backdrops.length) return [...trailers, ...posters];
	return [backdrops[0]!, ...trailers, ...backdrops.slice(1), ...posters];
}

import type { TmdbVideoResult, TrailerRef } from "~/types/trailer";

const EMBEDDABLE_SITES = new Set(["YouTube", "Vimeo"]);
const PREFERRED_TYPES = ["Trailer", "Teaser"] as const;

function typeRank(type: string): number {
	const index = PREFERRED_TYPES.indexOf(type as (typeof PREFERRED_TYPES)[number]);
	return index === -1 ? PREFERRED_TYPES.length : index;
}

function trailerScore(video: TmdbVideoResult): number {
	let score = 0;
	if (video.official) score += 1_000;
	if (video.iso_639_1 === "en") score += 100;
	score += video.size;
	const published = Date.parse(video.published_at);
	if (!Number.isNaN(published)) score += published / 1e12;
	score -= typeRank(video.type) * 10;
	return score;
}

export function isEmbeddableSite(site: string): boolean {
	return EMBEDDABLE_SITES.has(site);
}

export function pickBestTrailer(results: TmdbVideoResult[]): TrailerRef | null {
	const candidates = results.filter(
		(v) => isEmbeddableSite(v.site) && PREFERRED_TYPES.includes(v.type as (typeof PREFERRED_TYPES)[number]),
	);
	if (!candidates.length) return null;

	const best = [...candidates].sort((a, b) => trailerScore(b) - trailerScore(a))[0]!;
	return { site: best.site, key: best.key, name: best.name };
}

export function embedUrl(site: string, key: string, autoplay = true): string | null {
	const autoplayParam = autoplay ? "1" : "0";
	if (site === "YouTube") {
		return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=${autoplayParam}&rel=0`;
	}
	if (site === "Vimeo") {
		return `https://player.vimeo.com/video/${encodeURIComponent(key)}?autoplay=${autoplayParam}&dnt=1`;
	}
	return null;
}

export function watchUrl(site: string, key: string): string | null {
	if (site === "YouTube") {
		return `https://www.youtube.com/watch?v=${encodeURIComponent(key)}`;
	}
	if (site === "Vimeo") {
		return `https://vimeo.com/${encodeURIComponent(key)}`;
	}
	return null;
}

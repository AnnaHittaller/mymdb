import type { TrendingItem } from "~/types/catalog";

/** Rank-weighted leading genre across a trending chart page (order = rank). */
export function trendingLeadingGenre(items: TrendingItem[]): string | null {
	if (items.length === 0) return null;

	const scores = new Map<string, number>();
	const bestRank = new Map<string, number>();

	for (let index = 0; index < items.length; index++) {
		const item = items[index]!;
		const weight = items.length - index;
		for (const genre of item.genres) {
			scores.set(genre, (scores.get(genre) ?? 0) + weight);
			const current = bestRank.get(genre);
			if (current === undefined || index < current) {
				bestRank.set(genre, index);
			}
		}
	}

	if (scores.size === 0) return null;

	let winner: string | null = null;
	let maxScore = -1;
	let winnerRank = Number.POSITIVE_INFINITY;

	for (const [genre, score] of scores) {
		const rank = bestRank.get(genre) ?? Number.POSITIVE_INFINITY;
		if (score > maxScore || (score === maxScore && rank < winnerRank)) {
			maxScore = score;
			winner = genre;
			winnerRank = rank;
		}
	}

	return winner;
}

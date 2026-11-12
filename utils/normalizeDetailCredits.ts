import type { DetailCreditPerson, DetailKeyCredits } from "~/types/detailCredits";

const MUSIC_JOBS = [
	"Original Music Composer",
	"Main Title Theme Composer",
	"Composer",
	"Music",
] as const;

type MovieCrewMember = {
	id?: number;
	credit_id?: string;
	name?: string;
	profile_path?: string | null;
	job?: string;
};

type TvAggregateCrewMember = {
	id?: number;
	name?: string;
	profile_path?: string | null;
	jobs?: { credit_id?: string; job?: string; episode_count?: number }[];
};

type CreatedByMember = {
	id?: number;
	credit_id?: string;
	name?: string;
	profile_path?: string | null;
};

export type DetailsWithKeyCredits = Record<string, unknown> & {
	credits?: { crew?: MovieCrewMember[] };
	aggregate_credits?: { crew?: TvAggregateCrewMember[] };
	created_by?: CreatedByMember[];
};

function musicJobRank(job: string): number {
	const index = (MUSIC_JOBS as readonly string[]).indexOf(job);
	return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function uniquePeople(people: DetailCreditPerson[]): DetailCreditPerson[] {
	const seen = new Set<number>();
	const unique: DetailCreditPerson[] = [];
	for (const person of people) {
		if (seen.has(person.id)) continue;
		seen.add(person.id);
		unique.push(person);
	}
	return unique;
}

function toPerson(
	member: {
		id?: number;
		credit_id?: string;
		name?: string;
		profile_path?: string | null;
	},
	fallbackCreditId: string,
): DetailCreditPerson | null {
	if (member.id == null || !member.name) return null;
	return {
		id: member.id,
		creditId: member.credit_id ?? fallbackCreditId,
		name: member.name,
		profilePath: member.profile_path ?? null,
	};
}

export function normalizeMovieKeyCredits(
	credits: { crew?: MovieCrewMember[] } | undefined,
): DetailKeyCredits {
	const crew = credits?.crew ?? [];
	const directors: DetailCreditPerson[] = [];
	const musicCandidates: { person: DetailCreditPerson; rank: number }[] = [];

	for (const [index, member] of crew.entries()) {
		const job = member.job ?? "";
		const person = toPerson(member, `${member.id ?? "crew"}-${index}`);
		if (!person) continue;

		if (job === "Director") {
			directors.push(person);
			continue;
		}

		const rank = musicJobRank(job);
		if (Number.isFinite(rank)) {
			musicCandidates.push({ person, rank });
		}
	}

	const musicById = new Map<number, { person: DetailCreditPerson; rank: number }>();
	for (const candidate of musicCandidates) {
		const existing = musicById.get(candidate.person.id);
		if (!existing || candidate.rank < existing.rank) {
			musicById.set(candidate.person.id, candidate);
		}
	}

	const music = [...musicById.values()]
		.sort((a, b) => a.rank - b.rank)
		.map((entry) => entry.person);

	return {
		directors: uniquePeople(directors),
		createdBy: [],
		music,
	};
}

export function normalizeTvKeyCredits(
	details: {
		created_by?: CreatedByMember[];
		aggregate_credits?: { crew?: TvAggregateCrewMember[] };
		credits?: { crew?: MovieCrewMember[] };
	},
): DetailKeyCredits {
	const createdBy = uniquePeople(
		(details.created_by ?? []).flatMap((member, index) => {
			const person = toPerson(member, member.credit_id ?? `created-${index}`);
			return person ? [person] : [];
		}),
	);

	const aggregateCrew = details.aggregate_credits?.crew ?? [];
	if (aggregateCrew.length > 0) {
		const musicCandidates: { person: DetailCreditPerson; rank: number; episodes: number }[] = [];

		for (const [index, member] of aggregateCrew.entries()) {
			let bestRank = Number.POSITIVE_INFINITY;
			let creditId = `${member.id ?? "crew"}-${index}`;
			let episodes = 0;

			for (const job of member.jobs ?? []) {
				const rank = musicJobRank(job.job ?? "");
				if (rank < bestRank) {
					bestRank = rank;
					creditId = job.credit_id ?? creditId;
				}
				if (Number.isFinite(rank)) {
					episodes += job.episode_count ?? 0;
				}
			}

			if (!Number.isFinite(bestRank)) continue;
			const person = toPerson(
				{ ...member, credit_id: creditId },
				creditId,
			);
			if (!person) continue;
			musicCandidates.push({ person, rank: bestRank, episodes });
		}

		musicCandidates.sort((a, b) => a.rank - b.rank || b.episodes - a.episodes);

		const music = uniquePeople(musicCandidates.map((entry) => entry.person));
		return { directors: [], createdBy, music };
	}

	const fromEpisodeCredits = normalizeMovieKeyCredits(details.credits);
	return {
		directors: [],
		createdBy,
		music: fromEpisodeCredits.music,
	};
}

export function withDetailCredits<T extends DetailsWithKeyCredits>(
	details: T,
	media: "movie" | "tv",
): T & { detailCredits: DetailKeyCredits } {
	const detailCredits =
		media === "tv"
			? normalizeTvKeyCredits(details)
			: normalizeMovieKeyCredits(details.credits);

	return {
		...details,
		detailCredits,
	};
}

export function formatCreditNames(
	people: DetailCreditPerson[],
	max = 4,
): string {
	return people
		.slice(0, max)
		.map((person) => person.name)
		.join(", ");
}

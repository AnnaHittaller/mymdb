import type { DetailCastMember } from "~/types/detailCast";

type TmdbAggregateCastMember = {
	id: number;
	name: string;
	profile_path: string | null;
	order?: number;
	roles?: { credit_id: string; character: string }[];
};

type TmdbMovieCastMember = {
	id: number;
	name: string;
	profile_path: string | null;
	character?: string;
	order?: number;
	credit_id: string;
};

function sortByBillingOrder(members: DetailCastMember[]): DetailCastMember[] {
	return [...members].sort((a, b) => a.order - b.order);
}

export function normalizeTvAggregateCast(
	aggregate: { cast?: TmdbAggregateCastMember[] } | undefined,
): DetailCastMember[] {
	const cast = aggregate?.cast ?? [];
	const members = cast.map((member) => ({
		id: member.id,
		creditId: member.roles?.[0]?.credit_id ?? `${member.id}-${member.order ?? 0}`,
		name: member.name,
		character: member.roles?.[0]?.character ?? "",
		profilePath: member.profile_path,
		order: member.order ?? 9999,
	}));
	return sortByBillingOrder(members);
}

export function normalizeMovieCreditsCast(
	credits: { cast?: TmdbMovieCastMember[] } | undefined,
): DetailCastMember[] {
	const cast = credits?.cast ?? [];
	const members = cast.map((member) => ({
		id: member.id,
		creditId: member.credit_id,
		name: member.name,
		character: member.character ?? "",
		profilePath: member.profile_path,
		order: member.order ?? 9999,
	}));
	return sortByBillingOrder(members);
}

type DetailsWithCredits = Record<string, unknown> & {
	credits?: { cast?: unknown[]; crew?: unknown[] };
	aggregate_credits?: { cast?: TmdbAggregateCastMember[] };
};

export function withDetailCast(
	details: DetailsWithCredits,
	media: "movie" | "tv",
): DetailsWithCredits & { detailCast: DetailCastMember[] } {
	const detailCast =
		media === "tv"
			? normalizeTvAggregateCast(details.aggregate_credits)
			: normalizeMovieCreditsCast(
					details.credits as { cast?: TmdbMovieCastMember[] },
				);

	const { aggregate_credits: _aggregate, ...rest } = details;

	return {
		...rest,
		detailCast,
	};
}

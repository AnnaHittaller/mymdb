import type { Credits, Genre } from "./movie";
import type { DetailCastMember } from "./detailCast";
import type { DetailKeyCredits } from "./detailCredits";
import type { TrailerRef } from "./trailer";

export interface TvSeries {
	adult?: boolean;
	backdrop_path: string;
	genres: Genre[];
	homepage: string;
	id: number;
	name: string;
	original_language: string;
	original_name: string;
	overview: string;
	popularity: number;
	poster_path: string;
	first_air_date: string;
	vote_average: number;
	vote_count: number;
	tagline?: string;
	number_of_seasons?: number;
	number_of_episodes?: number;
	episode_run_time?: number[];
	status?: string;
	credits: Credits;
	detailCast: DetailCastMember[];
	detailCredits: DetailKeyCredits;
	trailer?: TrailerRef | null;
}

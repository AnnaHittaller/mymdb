import type { Credits, Genre } from "./movie";
import type { DetailCastMember } from "./detailCast";
import type { DetailKeyCredits } from "./detailCredits";
import type { DetailGalleryItem, DetailKeyword } from "./detailGallery";
import type { TrailerRef } from "./trailer";

export interface TvSeasonSummary {
	air_date: string;
	episode_count: number;
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	season_number: number;
	vote_average: number;
}

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
	keywords: DetailKeyword[];
	gallery: DetailGalleryItem[];
	seasons?: TvSeasonSummary[];
	trailer?: TrailerRef | null;
}

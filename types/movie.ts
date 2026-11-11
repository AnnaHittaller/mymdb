import type { MediaType } from "./catalog";
import type { ListMembership } from "./list";
import type { TrailerRef } from "./trailer";

export interface TrendingMovie {
	id: number;
	title: string;
	poster: string | null;
	backdrop: string | null;
	overview: string;
	vote_average: number;
	release_date: string;
	genres: string[];
}

export interface UserMovie {
	id: string;
	mediaType?: MediaType;
	title: string;
	rating: number;
	poster: string;
	genres?: string[];
	seen: boolean;
	memberships: ListMembership[];
	/** Legacy v1 — stripped on v2 write; migration reads only */
	next?: boolean;
	/** Legacy v1 — stripped on v2 write; migration / reconcile reads only */
	timestamp?: Date;
}

export interface Movie {
	adult: boolean;
	backdrop_path: string;
	belongs_to_collection: null;
	budget: number;
	genres: Genre[];
	homepage: string;
	id: number;
	imdb_id: string;
	origin_country: string[];
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	production_companies: ProductionCompany[];
	production_countries: ProductionCountry[];
	release_date: Date;
	revenue: number;
	runtime: number;
	spoken_languages: SpokenLanguage[];
	status: string;
	tagline: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
	credits: Credits;
	trailer?: TrailerRef | null;
}

export interface Credits {
	cast: Cast[];
	crew: Cast[];
}

export interface Cast {
	adult: boolean;
	gender: number;
	id: number;
	known_for_department: string;
	name: string;
	original_name: string;
	popularity: number;
	profile_path: null | string;
	cast_id?: number;
	character?: string;
	credit_id: string;
	order?: number;
	department?: string;
	job?: string;
}

export interface Genre {
	id: number;
	name: string;
}

export interface ProductionCompany {
	id: number;
	logo_path: null | string;
	name: string;
	origin_country: string;
}

export interface ProductionCountry {
	iso_3166_1: string;
	name: string;
}

export interface SpokenLanguage {
	english_name: string;
	iso_639_1: string;
	name: string;
}

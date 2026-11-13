export interface DetailEpisode {
	episode_number: number;
	name: string;
	overview: string;
	runtime: number | null;
	air_date: string;
	still_path: string | null;
	vote_average: number;
}

export interface DetailSeasonResponse {
	season_number: number;
	season_backdrop_path: string | null;
	episodes: DetailEpisode[];
}

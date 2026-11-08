export interface TmdbVideoResult {
	iso_639_1: string;
	iso_3166_1: string;
	name: string;
	key: string;
	site: string;
	size: number;
	type: string;
	official: boolean;
	published_at: string;
	id: string;
}

export interface TrailerRef {
	site: string;
	key: string;
	name: string;
}

export interface TrailerVideoResponse {
	trailer: TrailerRef | null;
}

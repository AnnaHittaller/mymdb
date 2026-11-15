export interface DetailCollectionPart {
	id: number;
	title: string;
	poster_path: string | null;
	vote_average: number;
	release_date: string;
}

export interface DetailCollection {
	id: number;
	name: string;
	parts: DetailCollectionPart[];
}

export interface TmdbCollectionRef {
	id: number;
	name: string;
	poster_path: string | null;
	backdrop_path: string | null;
}

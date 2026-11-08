export type MediaType = "movie" | "tv";

export interface CatalogCard {
	id: number;
	mediaType: MediaType;
	title: string;
	popularity?: number;
	poster: string | null;
	backdrop: string | null;
	genres: string[];
	rating: number;
	releaseYear: number | null;
}

export interface TrendingItem extends CatalogCard {
	overview: string;
	releaseDate: string;
}

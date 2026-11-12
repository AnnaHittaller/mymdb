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

export type BrowseMode = "search" | "discover";

export interface BrowseListing {
	mode: BrowseMode;
	results: CatalogCard[];
	total_pages?: number;
	has_more: boolean;
}

export interface TrendingItem extends CatalogCard {
	overview: string;
	releaseDate: string;
}

import type { TrailerRef } from "./trailer";

export interface DetailGalleryImage {
	kind: "image";
	id: string;
	filePath: string;
	aspectRatio: number;
	variant: "poster" | "backdrop";
	alt: string;
}

export interface DetailGalleryTrailer {
	kind: "trailer";
	id: string;
	aspectRatio: number;
	name: string;
	trailer: TrailerRef;
	stillPath: string | null;
}

export type DetailGalleryItem = DetailGalleryImage | DetailGalleryTrailer;

export interface DetailKeyword {
	id: number;
	name: string;
}

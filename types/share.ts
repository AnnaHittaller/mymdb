import type { MediaType } from "./catalog";
import type { SystemListId } from "./list";

export const PUBLISHED_LISTS_COLLECTION = "publishedLists";

export const PUBLISHED_LIST_SCHEMA_VERSION = 1 as const;

export type PublishedListItem = {
	id: string;
	mediaType: MediaType;
	title: string;
	poster?: string | null;
	rating?: number | null;
};

export type PublishedListSnapshot = {
	schemaVersion: typeof PUBLISHED_LIST_SCHEMA_VERSION;
	shareId: string;
	createdAt: string;

	ownerUid: string;
	ownerDisplayName: string;

	sourceListId: string;
	sourceListName: string;
	sourceListKind: "custom" | "system";
	sourceSystemListId?: SystemListId;

	items: PublishedListItem[];
};

export type PublicPublishedListSnapshot = Omit<PublishedListSnapshot, "ownerUid">;

export type PublishListResponse = {
	shareId: string;
	url: string;
};
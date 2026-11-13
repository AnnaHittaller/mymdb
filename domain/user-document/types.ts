import type { UserList } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import type { CatalogPrefs } from "./catalogPrefs";

export type UserDocumentData = {
	schemaVersion?: number;
	uid: string;
	username: string;
	email: string;
	theme: string;
	catalogPrefs: CatalogPrefs;
	lists: UserList[];
	movies: UserMovie[];
};

export type UserDocumentStore = {
	current: () => UserDocumentData | null;
	subscribe: (listener: (document: UserDocumentData | null) => void) => () => void;
	transact: (update: (document: UserDocumentData | null) => UserDocumentData) => Promise<void>;
};

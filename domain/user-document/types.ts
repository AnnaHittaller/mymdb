import type { UserMovie } from "../../types/movie";

export type UserDocumentData = {
	uid: string;
	username: string;
	email: string;
	theme: string;
	movies: UserMovie[];
};

export type UserDocumentStore = {
	current: () => UserDocumentData | null;
	subscribe: (listener: (document: UserDocumentData | null) => void) => () => void;
	transact: (update: (document: UserDocumentData | null) => UserDocumentData) => Promise<void>;
};

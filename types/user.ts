import type { UserList } from "./list";
import type { UserMovie } from "./movie";

export interface User {
	uid: string;
	username: string;
	email: string;
	theme: string;
	schemaVersion?: number;
	lists?: UserList[];
	movies?: UserMovie[] | [];
}

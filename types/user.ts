import type { UserMovie } from "./movie";

export interface User {
	uid: string;
	username: string;
	email: string;
	theme: string;
	movies?: UserMovie[] | [];
}

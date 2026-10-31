import {
	collection,
	getDoc,
	setDoc,
	updateDoc,
	arrayUnion,
	deleteDoc,
	doc,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { useDocument } from "vuefire";
import type { UserMovie } from "~/types/movie";
import type { User } from "~/types/user";

export const getUserData = async (db: Firestore, uid: string) => {
	try {
		const user = useDocument(doc(collection(db, "users"), uid));
		console.log("Document data:", user.value);
		return user.value;
	} catch (error) {
		console.warn(error);
	}
};

export const useUserData = (db: Firestore, uid: string) => {
	const userDocRef = doc(db, "users", uid);
	const user = useDocument(userDocRef);
	return user;
};

export const setUserInFirestore = async (
	db: Firestore,
	uid: string,
	userData: User
) => {
	try {
		await setDoc(doc(db, "users", uid), { ...userData });
	} catch (error) {
		console.warn(error);
		throw error;
	}
};

export const addMovie = async (
	db: Firestore,
	uid: string,
	movie: UserMovie
) => {
	try {
		const userDocRef = doc(db, "users", uid);
		await updateDoc(userDocRef, {
			movies: arrayUnion(movie),
		});
		console.log("Movie added:", movie);
	} catch (error) {
		console.warn(error);
	}
};

export const removeMovie = async (
	db: Firestore,
	uid: string,
	movieId: string
) => {
	try {
		const userDocRef = doc(db, "users", uid);

		const userSnapshot = await getDoc(userDocRef);
		if (!userSnapshot.exists()) {
			throw new Error("User not found");
		}

		const updatedMovies = (userSnapshot.data().movies || []).filter(
			(movie: UserMovie) => movie.id !== movieId
		);

		await updateDoc(userDocRef, { movies: updatedMovies });
		console.log("Movie removed:", movieId);
	} catch (error) {
		console.warn(error);
	}
};

export const updateMovie = async (
	db: Firestore,
	uid: string,
	movieId: string,
	update: { seen?: boolean; next?: boolean }
) => {
	try {
		const userDocRef = doc(db, "users", uid);
		const userSnapshot = await getDoc(userDocRef);
		if (!userSnapshot.exists()) {
			throw new Error("User not found");
		}

		const movies = userSnapshot.data().movies || [];

		const updatedMovies = movies.map((movie: UserMovie) =>
			movie.id === movieId
				? { ...movie, ...update, timestamp: new Date() }
				: movie
		);

		await updateDoc(userDocRef, { movies: updatedMovies });

		console.log(`Movie with ID ${movieId} updated:`, update);
	} catch (error) {
		console.warn(error);
	}
};

export const updateTheme = async (
	db: Firestore,
	uid: string,
	theme: string
) => {
	try {
		const userDocRef = doc(db, "users", uid);
		await updateDoc(userDocRef, {
			theme: theme,
		});
	} catch (error) {
		console.log(error);
	}
};

export const deleteUserDoc = async (db: Firestore, uid: string) => {
	try {
		await deleteDoc(doc(db, "users", uid));
	} catch (error) {
		console.warn(error);
	}
};

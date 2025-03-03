// import { setDoc, doc, getDoc, deleteDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot} from "firebase/firestore"

import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	setDoc,
	updateDoc,
	arrayUnion,
	arrayRemove,
	deleteDoc,
	doc,
	Firestore,
} from "firebase/firestore";
import {
	useCurrentUser,
	useFirestore,
	useCollection,
	useDocument,
} from "vuefire";
import type { UserMovie } from "~/types/movie";
import type { User } from "~/types/user";

//maybe not needed
export const getUserData = async (db: Firestore, uid: string) => {
	try {
		// const userDocRef = doc(db, "users", uid);
		// const currentUser = await getDoc(userDocRef);
		const user = useDocument(doc(collection(db, "users"), uid));
		console.log("Document data:", user.value);
		return user.value;
		// if (currentUser.exists()) {
		// 	//console.log("Document data:", currentUser.data());
		// 	return currentUser.data();
		// } else {
		// 	console.log("No such document!");
		// }
	} catch (error) {
		console.warn(error);
	}
};

//real time reactive user data
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
		//console.log("setuser",newUser)
	} catch (error) {
		console.log(error);
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

		// Fetch the latest user data (avoids stale data issues)
		const userSnapshot = await getDoc(userDocRef);
		if (!userSnapshot.exists()) {
			throw new Error("User not found");
		}

		// Filter out the movie to be removed
		const updatedMovies = (userSnapshot.data().movies || []).filter(
			(movie: UserMovie) => movie.id !== movieId
		);

		// Update Firestore with the modified movies array
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

		// Get current movies array
		const movies = userSnapshot.data().movies || [];

		// Update only the specific movie inside the array
		const updatedMovies = movies.map((movie: any) =>
			movie.id === movieId
				? { ...movie, ...update, timestamp: new Date() }
				: movie
		);

		// Save the updated movies array
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
		// console.log("user theme updated:", theme);
	} catch (error) {
		console.log(error);
	}
};

// export const useFirestore = () => {

//     const { $db } = useNuxtApp()

//     const getUser = async (uid: string) => {
//         try {
//             const docRef = doc($db, "users", uid);
//             const currentUser = await getDoc(docRef);

//             if (currentUser.exists()) {
//             //console.log("Document data:", currentUser.data());
//                 return currentUser.data()
//             } else {
//                 console.log("No such document!");
//             }
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const setUser = async (uid: string, username: string, email: string, theme: string, movies?: [Movie] | []) => {
//         try {
//             const newUser = await setDoc(doc($db, "users", uid), {username, email, theme, movies})
//             //console.log("setuser",newUser)
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const updateUserName = async (uid: string, username: string) => {
//         try {
//             const updatedUser = doc($db, "users", uid)
//             await updateDoc(updatedUser, {
//                 username: username,
//             })
//             //console.log("username updated:",updatedUser)
//         } catch (error) {
//             console.log(error)
//         }
//     }

export const deleteUserDoc = async (db: Firestore, uid: string) => {
	try {
		await deleteDoc(doc(db, "users", uid));
	} catch (error) {
		console.warn(error);
	}
};

//     const updateTheme = async (uid: string, theme: string) => {
//         try {
//             const updatedUser = doc($db, "users", uid)
//             await updateDoc(updatedUser, {
//                 theme: theme,
//             })
//             //console.log("user updated:",updatedUser)
//         } catch (error){
//             console.log(error)
//         }
//     }

//     const addMovie = async (uid: string, movie: Movie) => {
//         try {
//             const userRef = doc($db, "users", uid);
//             const userSnapshot = await getDoc(userRef);

//             if (userSnapshot.exists()) {
//                 await updateDoc(userRef, {
//                     movies: arrayUnion(movie)
//                 });
//                 //console.log("Movie added:", movie);
//             } else {
//                 console.log("User not found.");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const removeMovie = async (uid: string, movieId: string) => {
//         try {
//             const userRef = doc($db, "users", uid);
//             const userSnapshot = await getDoc(userRef);

//             if (userSnapshot.exists()) {
//                 const userData = userSnapshot.data() as { movies: Movie[] };
//                 const updatedMovies = userData.movies.filter(movie => movie.id !== movieId);

//                 await updateDoc(userRef, {
//                     movies: updatedMovies
//                 });

//                 //console.log("Movie removed with ID:", movieId);
//             } else {
//                 console.log("User not found.");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const updateMovie = async (uid: string, movieId: string, update: { seen?: boolean; next?: boolean }) => {
//         try {
//             const userRef = doc($db, "users", uid);
//             const userSnapshot = await getDoc(userRef);

//             if (userSnapshot.exists()) {
//                 await updateDoc(userRef, {
//                     movies: userSnapshot.data()?.movies.map((movie: any) =>
//                         movie.id === movieId ? { ...movie, ...update, timestamp: new Date() } : movie
//                     ),
//                 });
//                 //console.log(`Movie with ID ${movieId} updated:`, update);
//             } else {
//                 console.log("User not found.");
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     return {
//         setUser,
//         getUser,
//         updateUserName,
//         deleteUserDoc,
//         updateTheme,
//         addMovie,
//         removeMovie,
//         updateMovie
//     }

// }

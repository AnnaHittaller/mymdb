import { setDoc, doc, getDoc, deleteDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot} from "firebase/firestore"

interface Movie {
  id: string;
  title: string,
  rating: number,
  poster: string,
  seen: boolean;
  next: boolean;
}

export const useFirestore = () => {

    const { $db } = useNuxtApp()

    const getUser = async (uid: string) => {
        try {
            const docRef = doc($db, "users", uid);
            const currentUser = await getDoc(docRef);

            if (currentUser.exists()) {
            //console.log("Document data:", currentUser.data());
                return currentUser.data()
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const setUser = async (uid: string, username: string, email: string, theme: string, movies?: [Movie] | []) => {
        try {
            const newUser = await setDoc(doc($db, "users", uid), {username, email, theme, movies})
            //console.log("setuser",newUser)
        } catch (error) {
            console.log(error)
        }
    }

    const updateUserName = async (uid: string, username: string) => {
        try {
            const updatedUser = doc($db, "users", uid)
            await updateDoc(updatedUser, {
                username: username,
            })
            //console.log("username updated:",updatedUser)
        } catch (error) {
            console.log(error)
        }
    }

    const deleteUserDoc = async (uid: string) => {
        try {
            await deleteDoc(doc($db, "users", uid))
        } catch (error){
            console.log(error)
        }
    }

    const updateTheme = async (uid: string, theme: string) => {
        try {
            const updatedUser = doc($db, "users", uid)
            await updateDoc(updatedUser, {
                theme: theme,
            })
            //console.log("user updated:",updatedUser)
        } catch (error){
            console.log(error)
        }
    }

    const addMovie = async (uid: string, movie: Movie) => {
        try {
            const userRef = doc($db, "users", uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                await updateDoc(userRef, {
                    movies: arrayUnion(movie)
                });
                //console.log("Movie added:", movie);
            } else {
                console.log("User not found.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const removeMovie = async (uid: string, movieId: string) => {
        try {
            const userRef = doc($db, "users", uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data() as { movies: Movie[] };
                const updatedMovies = userData.movies.filter(movie => movie.id !== movieId);

                await updateDoc(userRef, {
                    movies: updatedMovies
                });

                //console.log("Movie removed with ID:", movieId);
            } else {
                console.log("User not found.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const updateMovie = async (uid: string, movieId: string, update: { seen?: boolean; next?: boolean }) => {
        try {
            const userRef = doc($db, "users", uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                await updateDoc(userRef, {
                    movies: userSnapshot.data()?.movies.map((movie: any) =>
                        movie.id === movieId ? { ...movie, ...update } : movie
                    ),
                });
                //console.log(`Movie with ID ${movieId} updated:`, update);
            } else {
                console.log("User not found.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return {
        setUser,
        getUser,
        updateUserName,
        deleteUserDoc,
        updateTheme,
        addMovie,
        removeMovie,
        updateMovie
    }
   
}
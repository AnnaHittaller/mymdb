import { defineStore } from "pinia";
import { useFirestore } from "@/composables/useFirestore";
import { useFirebaseAuth } from "@/composables/useFirebaseAuth";
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';


interface Movie {
  id: string;
  title: string,
  rating: number,
  poster: string,
  seen: boolean;
  next: boolean;
}

interface UpdateFields {
  seen?: boolean;
  next?: boolean;
}

export const useUserMoviesStore = defineStore('userMoviesStore', () => {
    const { currentUserPromise } = useFirebaseAuth();
    const { getUser } = useFirestore();
    const { $db } = useNuxtApp()

    const movies = ref([] as Movie[] || []);

        // Set up real-time listener for user movies
    const setupRealTimeListener = async () => {
        try {
            const userData: any = await currentUserPromise();
            const user = await getUser(userData.uid);
            
            if (user && user.movies) {
                onSnapshot(doc($db, `users/${userData.uid}`), (snapshot) => {
                    const userMovies = snapshot.data()?.movies || [];
                    movies.value = userMovies;
                    console.log("Real-time updates received:", userMovies);
                });
            }
        } catch (error) {
            console.error("Error setting up real-time listener:", error);
        }
    };

    setupRealTimeListener(); // Call setupRealTimeListener when the store is initialized


    const fetchUserMovies = async () => {
        try {
            const userData: any = await currentUserPromise();
            const user = await getUser(userData.uid);
            
            if ( user && user.movies) {
                // If the user has movies, set the initial movies array
                movies.value = user.movies;
                console.log("store fetching movies",toRaw(movies.value))
                return movies
            }
            
        } catch (error) {
        console.log(error);
        }
    };

    const addMovie = async (movie: Movie) => {
        try {
        // Update the movies array by adding the new movie
        console.log("store adding movies before",toRaw(movies.value))
        movies.value = [...movies.value, movie];
        console.log("store adding movies after",toRaw(movies.value))

        return movies

        } catch (error) {
        console.log(error);
        }
    };

  const removeMovie = async (movieId: string) => {
    try {
      // Update the movies array by removing the movie with the specified ID
      console.log("store deleting movies before",toRaw(movies.value))
      movies.value = movies.value.filter((movie) => movie.id !== movieId);
      console.log("store deleting movies after",toRaw(movies.value))

      return movies
    } catch (error) {
      console.log(error);
    }
  };

   const updateMovie = async (movieId:string, updateFields: UpdateFields) => {
        try {
            // Find the index of the movie in the movies array
            const index = movies.value.findIndex(movie => movie.id === movieId);
            if (index === -1) {
                throw new Error(`Movie with ID ${movieId} not found.`);
            }

            // Update the movie with the specified ID
            movies.value[index] = { ...movies.value[index], ...updateFields }; // Merge updateFields into the movie object

            // Update the movie in Firestore here if needed

            return movies.value; // Return the updated movies array
        } catch (error) {
            console.error(error);
            throw error; // Re-throw the error to handle it in the component
        }
    };

  return { movies, fetchUserMovies, addMovie, removeMovie, updateMovie };
})
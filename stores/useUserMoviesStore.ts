import { defineStore } from "pinia";
import { useFirestore } from "@/composables/useFirestore";
import { useFirebaseAuth } from "@/composables/useFirebaseAuth";
import { onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';


interface Movie {
  id: string;
  seen: boolean; 
  next: boolean;
}

export const useUserMoviesStore = defineStore('userMoviesStore', () => {
    const { currentUserPromise } = useFirebaseAuth();
    const { getUser } = useFirestore();

    const movies = ref([] as Movie[] || []);

    const fetchUserMovies = async () => {
        try {
            const userData: any = await currentUserPromise();
            const user = await getUser(userData.uid);
            
            if ( user && user.movies) {
                // If the user has movies, set the initial movies array
                movies.value = user.movies;
                console.log("fkjhfg",toRaw(movies.value))
                return movies
            }
            
        } catch (error) {
        console.log(error);
        }
    };

    const addMovie = async (movie: Movie) => {
        try {
        // Update the movies array by adding the new movie
        movies.value = [...movies.value, movie];
        return movies

        } catch (error) {
        console.log(error);
        }
    };

  const removeMovie = async (movieId: string) => {
    try {
      // Update the movies array by removing the movie with the specified ID
      movies.value = movies.value.filter((movie) => movie.id !== movieId);
    return movies
    } catch (error) {
      console.log(error);
    }
  };

  return { movies, fetchUserMovies, addMovie, removeMovie };
})
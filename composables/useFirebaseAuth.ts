import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, updateEmail } from 'firebase/auth';

export const useFirebaseAuth = () => {

    const {$auth} = useNuxtApp()

    function extractErrorMessage(errorCode: string) {
        // Split the error code by '/'
        const parts = errorCode.split('/');

        // Get the last part of the split array
        const lastPart = parts[parts.length - 1];

        // Replace hyphens with spaces and capitalize the first letter of each word
        const formattedMessage = lastPart.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

        return formattedMessage;
    }

    const register = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword($auth, email, password)
            const user = userCredential.user
            //console.log(user)
            return user

        } catch (error: any) {
            console.log("REGISTER ERR", error.code, error.message);   
            const errorMessage = extractErrorMessage(error.code);
            throw new Error(errorMessage)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword($auth, email, password)
            const user = userCredential.user
            //console.log(user)
            
        } catch (error: any) {
            console.log("LOGIN ERROR", error.code, error.message);   
            const errorMessage = extractErrorMessage(error.code);
            throw new Error(errorMessage)
        }
    }

    const logout = async () => {
       await signOut($auth)
       await navigateTo('/login')
       //console.log("logged out")
    }

     const currentUserPromise = () => new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged($auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user); 
            } else {
                reject(new Error("No user found")); 
            }
        });
    }).catch(error => {
        //console.error("CURRENT USER PROMISE ERROR", error.message);
        throw error;
    });

    const currentUserInfo = $auth.currentUser

    const deleteUserAccount =  async () => {
        try {
            const user = $auth.currentUser
             if (user === null || user === undefined) {
                throw new Error("User cannot be null or undefined.");
            }
            deleteUser(user)
            console.log("User deleted successfully")
            navigateTo('/login')
        } catch (error: any) {
            console.log("USER DELETE ERR", error);   
        }
    }

    // const updateUserEmail = async (email: string ) => {
    //     try {
    //         if($auth.currentUser) {
    //             await updateEmail($auth.currentUser, email )
    //         }
            
    //     } catch (error: any) {
    //         console.log("Error when updating the email", error.code, error.message);   
    //         const errorMessage = extractErrorMessage(error.code);
    //         throw new Error(errorMessage)

    //     }
    // }

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail($auth, email, 
            //Have to set the final url here to redurect users after resetting their passwords
            //{
               // url: "https://mymdb-my-movie-watchlist.netlify.app"
            // }
            )
        } catch (error: any) {
            console.log("LOGIN ERR", error.code, error.message);   
            const errorMessage = extractErrorMessage(error.code);
            throw new Error(errorMessage)

        }
    }

    return {
        register,
        login,
        logout,
        currentUserInfo,
        currentUserPromise,
        deleteUserAccount,
        resetPassword,
        //updateUserEmail
    }
}
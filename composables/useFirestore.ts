import { collection, getDocs, setDoc, doc, getDoc, deleteDoc} from "firebase/firestore"

export const useFirestore = () => {

    const { $db } = useNuxtApp()

    const getUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection($db, "users"));

            // querySnapshot.forEach((doc) => {
            // console.log(`${doc.id} => ${doc.data().email}`);
            // return {id: doc.id, ...doc.data()}
            // });

            // OR:

            const users = querySnapshot.docs.map((doc) => {
               return {id: doc.id, ...doc.data()}
            })

            console.log(users)

        } catch (error) {
            console.log(error);
        }
    }

    const getUser = async (uid: string) => {
        try {
            const docRef = doc($db, "users", uid);
            const currentUser = await getDoc(docRef);

            if (currentUser.exists()) {
            console.log("Document data:", currentUser.data());
            return currentUser.data()
            } else {
            // currentUser.data() will be undefined in this case
            console.log("No such document!");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const setUser = async (uid: string, username: string, email: string) => {
        try {
            const newUser = await setDoc(doc($db, "users", uid), {username, email})
            console.log("setuser",newUser)
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

    return {
        getUsers,
        setUser,
        getUser,
        deleteUserDoc
    }
   
}
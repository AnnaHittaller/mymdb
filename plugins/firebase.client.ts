import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin((nuxtApp) => {
	const {
		apiKey,
		authDomain,
		projectId,
		storageBucket,
		messagingSenderId,
		appId
	} = useRuntimeConfig().public

	const firebaseConfig = {
		apiKey,
		authDomain,
		projectId,
		storageBucket,
		messagingSenderId,
		appId,
	};

	// Initialize Firebase
	const app = initializeApp(firebaseConfig);
    const auth = getAuth(app)
	const db = getFirestore(app)

	onAuthStateChanged(auth, (user) => {
		if (user) {
			// User is signed in
			const uid = user.uid;
			//console.log("there is a user");
			//console.log(user);
			
		} else {
			// User is signed out
			console.log("user signed out");
			
		}
	});

	return {
		provide: {
			auth,
			db
		}
	}
});

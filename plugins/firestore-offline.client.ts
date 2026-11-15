import {
	initializeFirestore,
	persistentLocalCache,
	persistentMultipleTabManager,
} from "firebase/firestore";
import { useFirebaseApp } from "vuefire";

export default defineNuxtPlugin({
	name: "firestore-offline-persistence",
	enforce: "post",
	setup() {
		if (process.env.NUXT_E2E === "true") {
			return;
		}

		try {
			initializeFirestore(useFirebaseApp(), {
				localCache: persistentLocalCache({
					tabManager: persistentMultipleTabManager(),
				}),
			});
		} catch {
			// Firestore was already started, or this browser cannot open IndexedDB.
		}
	},
});

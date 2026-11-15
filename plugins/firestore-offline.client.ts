import {
	enableIndexedDbPersistence,
	enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { useFirestore } from "vuefire";

export default defineNuxtPlugin({
	name: "firestore-offline-persistence",
	enforce: "post",
	parallel: true,
	async setup() {
		if (process.env.NUXT_E2E === "true") {
			return;
		}

		const db = useFirestore();

		try {
			await enableMultiTabIndexedDbPersistence(db);
		} catch (error: unknown) {
			const code = (error as { code?: string })?.code;
			if (code === "failed-precondition" || code === "unimplemented") {
				return;
			}
			try {
				await enableIndexedDbPersistence(db);
			} catch {
				// Persistence unavailable (private mode, unsupported browser, etc.)
			}
		}
	},
});
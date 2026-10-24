import { doc } from "firebase/firestore";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";
import { createUserDocument } from "../domain/user-document/createUserDocument";
import { createVueFireUserDocumentStore } from "../domain/user-document/vueFireStore";
import type { UserMovie } from "../types/movie";

export function useUserDocument() {
	const user = useCurrentUser();
	const db = useFirestore();
	const userRef = computed(() => (user.value?.uid ? doc(db, "users", user.value.uid) : null));
	const userDoc = useDocument(userRef);
	const version = ref(0);

	const store = createVueFireUserDocumentStore(db, () => user.value?.uid ?? null, userDoc);
	const document = createUserDocument(store);
	const stopNotify = document.onChange(() => {
		version.value += 1;
	});

	onScopeDispose(() => {
		stopNotify();
		document.stop();
		store.dispose();
	});

	return {
		movies: computed(() => {
			version.value;
			return document.movies();
		}),
		watchNext: computed(() => {
			version.value;
			return document.watchNext();
		}),
		theme: computed(() => {
			version.value;
			return document.theme();
		}),
		isInList: (id: string) => {
			version.value;
			return document.isInList(id);
		},
		add: (movie: UserMovie) => document.add(movie),
		remove: (id: string) => document.remove(id),
		setNext: (id: string, next: boolean) => document.setNext(id, next),
		setTheme: (theme: string) => document.setTheme(theme),
	};
}

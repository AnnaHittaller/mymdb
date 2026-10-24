import { doc } from "firebase/firestore";
import type { ComputedRef, InjectionKey } from "vue";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";
import { createUserDocument } from "../domain/user-document/createUserDocument";
import { createVueFireUserDocumentStore } from "../domain/user-document/vueFireStore";
import type { UserMovie } from "../types/movie";

type UserDocumentApi = {
	movies: ComputedRef<UserMovie[]>;
	watchNext: ComputedRef<UserMovie[]>;
	theme: ComputedRef<string>;
	isInList: (id: string) => boolean;
	add: (movie: UserMovie) => Promise<void>;
	remove: (id: string) => Promise<void>;
	setNext: (id: string, next: boolean) => Promise<void>;
	setTheme: (theme: string) => Promise<void>;
};

const userDocumentKey: InjectionKey<UserDocumentApi> = Symbol("user-document");

export function provideUserDocument() {
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

	const api: UserDocumentApi = {
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

	provide(userDocumentKey, api);
}

export function useUserDocument() {
	const api = inject(userDocumentKey);
	if (!api) {
		throw new Error("User document is not available");
	}
	return api;
}

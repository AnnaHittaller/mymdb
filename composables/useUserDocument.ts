import { doc } from "firebase/firestore";
import type { ComputedRef, InjectionKey } from "vue";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";
import { CACHE_DURATION, CATALOG_SUMMARY_CHUNK } from "../constants/movie";
import {
	createUserDocument,
	type CatalogUpdate,
	type ToggleMoviePayload,
} from "../domain/user-document/createUserDocument";
import {
	FAVORITES_LIST_ID,
	WATCH_NEXT_LIST_ID,
} from "../domain/user-document/listConstants";
import type { MediaTypeHint } from "../domain/user-document/reconcileWatchlist";
import { createVueFireUserDocumentStore } from "../domain/user-document/vueFireStore";
import type { MediaType } from "../types/catalog";
import type { UserList } from "../types/list";
import type { UserMovie } from "../types/movie";
import { catalogKey, defaultMediaType } from "../utils/catalogKey";

type UserDocumentApi = {
	movies: ComputedRef<UserMovie[]>;
	watchNext: ComputedRef<UserMovie[]>;
	lists: ComputedRef<UserList[]>;
	theme: ComputedRef<string>;
	moviesInList: (listId: string) => UserMovie[];
	listById: (listId: string) => UserList | undefined;
	isInList: (listId: string, id: string, mediaType?: MediaType) => boolean;
	isOnAnyList: (id: string, mediaType?: MediaType) => boolean;
	isInFavorites: (id: string, mediaType?: MediaType) => boolean;
	toggleListMembership: (listId: string, payload: ToggleMoviePayload) => Promise<void>;
	removeFromList: (listId: string, id: string, mediaType?: MediaType) => Promise<void>;
	setFavorites: (payload: ToggleMoviePayload, add: boolean) => Promise<void>;
	createList: (name: string) => Promise<void>;
	renameList: (listId: string, name: string) => Promise<void>;
	deleteList: (listId: string) => Promise<void>;
	setTheme: (theme: string) => Promise<void>;
	setUsername: (username: string) => Promise<void>;
	repairWatchlist: (hints: MediaTypeHint[]) => Promise<void>;
	favoritesListId: typeof FAVORITES_LIST_ID;
	watchNextListId: typeof WATCH_NEXT_LIST_ID;
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

	if (import.meta.client) {
		watchCatalogRefresh(
			() => {
				version.value;
				return user.value?.uid ?? null;
			},
			() => document.movies(),
			(updates) => document.refreshCatalog(updates),
		);
	}

	const api: UserDocumentApi = {
		movies: computed(() => {
			version.value;
			return document.movies();
		}),
		watchNext: computed(() => {
			version.value;
			return document.watchNext();
		}),
		lists: computed(() => {
			version.value;
			return document.lists();
		}),
		theme: computed(() => {
			version.value;
			return document.theme();
		}),
		moviesInList: (listId: string) => {
			version.value;
			return document.moviesInList(listId);
		},
		listById: (listId: string) => {
			version.value;
			return document.listById(listId);
		},
		isInList: (listId: string, id: string, mediaType?: MediaType) => {
			version.value;
			return document.isInList(listId, id, mediaType);
		},
		isOnAnyList: (id: string, mediaType?: MediaType) => {
			version.value;
			return document.isOnAnyList(id, mediaType);
		},
		isInFavorites: (id: string, mediaType?: MediaType) => {
			version.value;
			return document.isInFavorites(id, mediaType);
		},
		toggleListMembership: (listId, payload) => document.toggleListMembership(listId, payload),
		removeFromList: (listId, id, mediaType) => document.removeFromList(listId, id, mediaType),
		setFavorites: (payload, add) => document.setFavorites(payload, add),
		createList: (name) => document.createList(name),
		renameList: (listId, name) => document.renameList(listId, name),
		deleteList: (listId) => document.deleteList(listId),
		setTheme: (theme) => document.setTheme(theme),
		setUsername: (username) => document.setUsername(username),
		repairWatchlist: (hints) => document.repairWatchlist(hints),
		favoritesListId: FAVORITES_LIST_ID,
		watchNextListId: WATCH_NEXT_LIST_ID,
	};

	provide(userDocumentKey, api);
	return api;
}

const CATALOG_REFRESH_STORAGE_PREFIX = "mymdb:catalog-refresh:";

function catalogRefreshKey(uid: string) {
	return `${CATALOG_REFRESH_STORAGE_PREFIX}${uid}`;
}

function catalogRefreshIsFresh(uid: string) {
	const raw = localStorage.getItem(catalogRefreshKey(uid));
	const stamp = raw ? Number(raw) : Number.NaN;
	return Number.isFinite(stamp) && Date.now() - stamp < CACHE_DURATION;
}

async function fetchCatalogSummaries(movies: UserMovie[]): Promise<CatalogUpdate[]> {
	const updates: CatalogUpdate[] = [];
	for (let index = 0; index < movies.length; index += CATALOG_SUMMARY_CHUNK) {
		const chunk = movies.slice(index, index + CATALOG_SUMMARY_CHUNK);
		const entries = chunk
			.map((movie) => catalogKey(movie.id, defaultMediaType(movie.mediaType)))
			.join(",");
		const summaries = await $fetch<CatalogUpdate[]>("/api/catalog/summaries", {
			query: { entries },
		});
		updates.push(...summaries);
	}
	return updates;
}

function watchCatalogRefresh(
	userId: () => string | null,
	movies: () => UserMovie[],
	refreshCatalog: (updates: CatalogUpdate[]) => Promise<void>,
) {
	const started = new Set<string>();
	watch(
		() => {
			const uid = userId();
			return uid && movies().length > 0 ? uid : null;
		},
		(uid) => {
			if (!uid || started.has(uid) || catalogRefreshIsFresh(uid)) {
				return;
			}
			started.add(uid);
			void (async () => {
				try {
					const list = movies();
					if (list.length === 0 || userId() !== uid) {
						started.delete(uid);
						return;
					}
					const updates = await fetchCatalogSummaries(list);
					if (userId() !== uid) {
						started.delete(uid);
						return;
					}
					await refreshCatalog(updates);
					if (userId() !== uid) {
						return;
					}
					localStorage.setItem(catalogRefreshKey(uid), String(Date.now()));
				} catch {
					started.delete(uid);
				}
			})();
		},
		{ immediate: true },
	);
}

export function useUserDocument() {
	const api = inject(userDocumentKey);
	if (!api) {
		throw new Error("User document is not available");
	}
	return api;
}

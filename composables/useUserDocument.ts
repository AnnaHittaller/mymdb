import { doc } from "firebase/firestore";
import type { ComputedRef, InjectionKey } from "vue";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";
import { CACHE_DURATION, CATALOG_SUMMARY_CHUNK } from "../constants/movie";
import {
	createUserDocument,
	type CatalogUpdate,
} from "../domain/user-document/createUserDocument";
import type { MediaTypeHint } from "../domain/user-document/reconcileWatchlist";
import { createVueFireUserDocumentStore } from "../domain/user-document/vueFireStore";
import type { MediaType } from "../types/catalog";
import type { UserMovie } from "../types/movie";
import { catalogKey, defaultMediaType } from "../utils/catalogKey";

type UserDocumentApi = {
	movies: ComputedRef<UserMovie[]>;
	watchNext: ComputedRef<UserMovie[]>;
	theme: ComputedRef<string>;
	isInList: (id: string, mediaType?: MediaType) => boolean;
	add: (movie: UserMovie) => Promise<void>;
	remove: (id: string, mediaType?: MediaType) => Promise<void>;
	setNext: (id: string, next: boolean, mediaType?: MediaType) => Promise<void>;
	setTheme: (theme: string) => Promise<void>;
	setUsername: (username: string) => Promise<void>;
	repairWatchlist: (hints: MediaTypeHint[]) => Promise<void>;
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
			(updates) => document.refreshCatalog(updates)
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
		theme: computed(() => {
			version.value;
			return document.theme();
		}),
		isInList: (id: string, mediaType?: MediaType) => {
			version.value;
			return document.isInList(id, mediaType);
		},
		add: (movie: UserMovie) => document.add(movie),
		remove: (id: string, mediaType?: MediaType) => document.remove(id, mediaType),
		setNext: (id: string, next: boolean, mediaType?: MediaType) =>
			document.setNext(id, next, mediaType),
		setTheme: (theme: string) => document.setTheme(theme),
		setUsername: (username: string) => document.setUsername(username),
		repairWatchlist: (hints: MediaTypeHint[]) => document.repairWatchlist(hints),
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
	refreshCatalog: (updates: CatalogUpdate[]) => Promise<void>
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
		{ immediate: true }
	);
}

export function useUserDocument() {
	const api = inject(userDocumentKey);
	if (!api) {
		throw new Error("User document is not available");
	}
	return api;
}

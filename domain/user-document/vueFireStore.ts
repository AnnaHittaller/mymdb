import { doc, runTransaction, type Firestore } from "firebase/firestore";
import { watch, type Ref } from "vue";
import type { UserMovie } from "../../types/movie";
import type { UserDocumentData, UserDocumentStore } from "./types";

function toDate(value: unknown): Date {
	if (value instanceof Date) {
		return value;
	}
	if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
		return value.toDate();
	}
	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	return new Date(0);
}

function toUserMovie(value: unknown): UserMovie | null {
	if (!value || typeof value !== "object") {
		return null;
	}
	const movie = value as Record<string, unknown>;
	if (typeof movie.id !== "string" && typeof movie.id !== "number") {
		return null;
	}
	if (typeof movie.title !== "string") {
		return null;
	}
	return {
		id: String(movie.id),
		title: movie.title,
		rating: typeof movie.rating === "number" ? movie.rating : 0,
		poster: typeof movie.poster === "string" ? movie.poster : "",
		seen: Boolean(movie.seen),
		next: Boolean(movie.next),
		timestamp: toDate(movie.timestamp),
	};
}

export function toUserDocument(data: unknown, uid: string): UserDocumentData | null {
	if (!data || typeof data !== "object") {
		return null;
	}
	const record = data as Record<string, unknown>;
	if (typeof record.uid === "string" && record.uid !== uid) {
		return null;
	}
	const movies = Array.isArray(record.movies)
		? record.movies.flatMap((movie) => {
				const normalized = toUserMovie(movie);
				return normalized ? [normalized] : [];
			})
		: [];
	return {
		uid,
		username: typeof record.username === "string" ? record.username : "",
		email: typeof record.email === "string" ? record.email : "",
		theme: typeof record.theme === "string" ? record.theme : "",
		movies,
	};
}

function serialize(document: UserDocumentData) {
	return {
		uid: document.uid,
		username: document.username,
		email: document.email,
		theme: document.theme,
		movies: document.movies.map((movie) => ({
			...movie,
			timestamp: toDate(movie.timestamp),
		})),
	};
}

export function createVueFireUserDocumentStore(
	db: Firestore,
	getUid: () => string | null,
	source: Ref<unknown>
): UserDocumentStore & { dispose: () => void } {
	let current: UserDocumentData | null = null;
	const listeners = new Set<(document: UserDocumentData | null) => void>();

	function publish(data: unknown) {
		const uid = getUid();
		current = uid ? toUserDocument(data, uid) : null;
		const snapshot = current ? structuredClone(current) : null;
		for (const listener of listeners) {
			listener(snapshot);
		}
	}

	const stop = watch(source, (value) => publish(value), { immediate: true });

	return {
		current: () => (current ? structuredClone(current) : null),
		subscribe(listener) {
			listeners.add(listener);
			listener(current ? structuredClone(current) : null);
			return () => {
				listeners.delete(listener);
			};
		},
		async transact(update) {
			const uid = getUid();
			if (!uid) {
				throw new Error("No user document");
			}
			const ref = doc(db, "users", uid);
			await runTransaction(db, async (transaction) => {
				const snap = await transaction.get(ref);
				const latest = snap.exists() ? toUserDocument(snap.data(), uid) : null;
				transaction.set(ref, serialize(update(latest)), { merge: true });
			});
		},
		dispose: stop,
	};
}

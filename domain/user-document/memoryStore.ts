import type { UserDocumentData, UserDocumentStore } from "./types";

function cloneDocument(document: UserDocumentData | null): UserDocumentData | null {
	return document ? structuredClone(document) : null;
}

export function createMemoryUserDocumentStore(initial: UserDocumentData | null): UserDocumentStore {
	let current = cloneDocument(initial);
	let queue = Promise.resolve();
	const listeners = new Set<(document: UserDocumentData | null) => void>();

	function publish() {
		const snapshot = cloneDocument(current);
		for (const listener of listeners) {
			listener(snapshot);
		}
	}

	return {
		current: () => cloneDocument(current),
		subscribe(listener) {
			listeners.add(listener);
			listener(cloneDocument(current));
			return () => {
				listeners.delete(listener);
			};
		},
		transact(update) {
			const run = queue.then(() => {
				const next = update(cloneDocument(current));
				current = cloneDocument(next);
				publish();
			});
			queue = run.then(
				() => undefined,
				() => undefined
			);
			return run;
		},
	};
}

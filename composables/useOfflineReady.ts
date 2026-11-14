const offline = ref(import.meta.client ? !navigator.onLine : false);
let listenersBound = false;

function bindConnectivityListeners() {
	if (!import.meta.client || listenersBound) {
		return;
	}
	listenersBound = true;
	offline.value = !navigator.onLine;
	const sync = () => {
		offline.value = !navigator.onLine;
	};
	window.addEventListener("online", sync);
	window.addEventListener("offline", sync);
}

export function useOfflineReady() {
	bindConnectivityListeners();
	return {
		isOffline: readonly(offline),
	};
}

export const OFFLINE_WRITE_TOAST = {
	title: "You're offline",
	description: "Changes need a connection.",
} as const;
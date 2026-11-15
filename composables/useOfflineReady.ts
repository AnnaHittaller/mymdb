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

export function offlineWriteToastCopy(t: (key: string) => string) {
	return {
		title: t("offline.writeTitle"),
		description: t("offline.writeDescription"),
	};
}
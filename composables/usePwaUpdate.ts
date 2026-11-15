const PWA_UPDATE_TOAST_ID = "pwa-update";

export function usePwaUpdate() {
	const nuxtApp = useNuxtApp();
	const toast = useToast();
	const toastShownForWaitingSw = ref(false);

	onMounted(() => {
		const pwa = nuxtApp.$pwa;
		if (!pwa) return;

		watch(
			() => pwa.needRefresh,
			(needRefresh) => {
				if (!needRefresh || toastShownForWaitingSw.value) return;
				toastShownForWaitingSw.value = true;

				const online = navigator.onLine;

				toast.add({
					id: PWA_UPDATE_TOAST_ID,
					title: "New version available",
					description: online
						? "Refresh to load the latest MyMDb."
						: "Connect to refresh.",
					color: "info",
					duration: 15_000,
					progress: true,
					actions: [
						{
							label: "Refresh",
							onClick: () => {
								if (navigator.onLine) {
									void pwa.updateServiceWorker(true);
								}
							},
						},
						{
							label: "Later",
							onClick: () => {},
						},
					],
				});
			},
			{ immediate: true },
		);
	});
}
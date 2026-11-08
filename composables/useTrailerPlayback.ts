import type { MediaType } from "~/types/catalog";
import type { TrailerRef, TrailerVideoResponse } from "~/types/trailer";

type PlayOptions = {
	id: number | string;
	mediaType: MediaType;
	title: string;
	trailer?: TrailerRef | null;
};

export function useTrailerPlayback() {
	const toast = useToast();
	const modalOpen = ref(false);
	const activeTitle = ref("");
	const activeTrailer = ref<TrailerRef | null>(null);
	const loading = ref(false);

	async function openTrailer(options: PlayOptions): Promise<boolean> {
		activeTitle.value = options.title;

		if (options.trailer) {
			activeTrailer.value = options.trailer;
			modalOpen.value = true;
			return true;
		}

		loading.value = true;
		try {
			const response = await $fetch<TrailerVideoResponse>("/api/catalog/videos", {
				query: { id: options.id, mediaType: options.mediaType },
			});
			if (!response.trailer) {
				toast.add({
					title: "No trailer available",
					description: "There is no trailer for this title yet.",
					color: "neutral",
				});
				return false;
			}
			activeTrailer.value = response.trailer;
			modalOpen.value = true;
			return true;
		} catch {
			toast.add({
				title: "Couldn't load trailer",
				description: "Try again in a moment.",
				color: "error",
			});
			return false;
		} finally {
			loading.value = false;
		}
	}

	watch(modalOpen, (isOpen) => {
		if (!isOpen) activeTrailer.value = null;
	});

	return {
		modalOpen,
		activeTitle,
		activeTrailer,
		loading,
		openTrailer,
	};
}

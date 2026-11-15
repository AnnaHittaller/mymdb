const SCROLL_GUTTER_CLASS = "scrollbar-gutter-stable";

function pageScrollsVertically(): boolean {
	const doc = document.documentElement;
	return doc.scrollHeight > doc.clientHeight + 1;
}

/** Reserve viewport scrollbar gutter only when the document actually overflows vertically. */
export function useScrollbarGutter() {
	if (import.meta.server) return;

	const route = useRoute();
	let resizeObserver: ResizeObserver | undefined;

	const sync = () => {
		document.documentElement.classList.toggle(SCROLL_GUTTER_CLASS, pageScrollsVertically());
	};

	onMounted(() => {
		sync();
		resizeObserver = new ResizeObserver(() => sync());
		resizeObserver.observe(document.body);
		window.addEventListener("resize", sync, { passive: true });
	});

	onUnmounted(() => {
		resizeObserver?.disconnect();
		window.removeEventListener("resize", sync);
		document.documentElement.classList.remove(SCROLL_GUTTER_CLASS);
	});

	watch(
		() => route.fullPath,
		async () => {
			await nextTick();
			sync();
			requestAnimationFrame(sync);
		},
	);
}

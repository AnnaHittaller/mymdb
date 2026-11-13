const DRAG_THRESHOLD_PX = 6;

/** Horizontal strip: hidden scrollbar, drag, wheel, and overflow hints. */
export function useHorizontalScrollStrip() {
	const scrollEl = ref<HTMLElement | null>(null);
	const canScrollLeft = ref(false);
	const canScrollRight = ref(false);
	const isGrabbing = ref(false);
	const didDrag = ref(false);

	let trackingPointer = false;
	let activePointerId: number | null = null;
	let startX = 0;
	let startScrollLeft = 0;

	function updateScrollHints() {
		const el = scrollEl.value;
		if (!el) {
			canScrollLeft.value = false;
			canScrollRight.value = false;
			return;
		}
		const maxScroll = el.scrollWidth - el.clientWidth;
		canScrollLeft.value = el.scrollLeft > 2;
		canScrollRight.value = maxScroll - el.scrollLeft > 2;
	}

	function onWheel(event: WheelEvent) {
		const el = scrollEl.value;
		if (!el || el.scrollWidth <= el.clientWidth) return;
		const delta =
			Math.abs(event.deltaX) > Math.abs(event.deltaY)
				? event.deltaX
				: event.deltaY;
		if (delta === 0) return;
		el.scrollLeft += delta;
		event.preventDefault();
	}

	function onPointerDown(event: PointerEvent) {
		const el = scrollEl.value;
		if (!el || event.button !== 0) return;
		trackingPointer = true;
		activePointerId = event.pointerId;
		didDrag.value = false;
		isGrabbing.value = false;
		startX = event.clientX;
		startScrollLeft = el.scrollLeft;
	}

	function onPointerMove(event: PointerEvent) {
		if (
			!trackingPointer ||
			!scrollEl.value ||
			activePointerId !== event.pointerId
		) {
			return;
		}
		const deltaX = event.clientX - startX;
		if (!didDrag.value && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
			didDrag.value = true;
			isGrabbing.value = true;
			scrollEl.value.setPointerCapture(event.pointerId);
		}
		if (!didDrag.value) return;
		scrollEl.value.scrollLeft = startScrollLeft - deltaX;
	}

	function endDrag(event: PointerEvent) {
		if (!trackingPointer || activePointerId !== event.pointerId) return;
		trackingPointer = false;
		activePointerId = null;
		if (didDrag.value) {
			scrollEl.value?.releasePointerCapture(event.pointerId);
		}
		isGrabbing.value = false;
		updateScrollHints();
	}

	function consumeDragClick(): boolean {
		if (!didDrag.value) return false;
		didDrag.value = false;
		return true;
	}

	watch(
		scrollEl,
		(el, _, onCleanup) => {
			if (!el) return;
			updateScrollHints();
			el.addEventListener("scroll", updateScrollHints, { passive: true });
			el.addEventListener("wheel", onWheel, { passive: false });
			el.addEventListener("pointerdown", onPointerDown);
			el.addEventListener("pointermove", onPointerMove);
			el.addEventListener("pointerup", endDrag);
			el.addEventListener("pointercancel", endDrag);
			const resizeObserver = new ResizeObserver(() => updateScrollHints());
			resizeObserver.observe(el);
			onCleanup(() => {
				el.removeEventListener("scroll", updateScrollHints);
				el.removeEventListener("wheel", onWheel);
				el.removeEventListener("pointerdown", onPointerDown);
				el.removeEventListener("pointermove", onPointerMove);
				el.removeEventListener("pointerup", endDrag);
				el.removeEventListener("pointercancel", endDrag);
				resizeObserver.disconnect();
			});
		},
		{ flush: "post" },
	);

	return {
		scrollEl,
		canScrollLeft,
		canScrollRight,
		isGrabbing,
		consumeDragClick,
	};
}

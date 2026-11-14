import type { MediaType } from "~/types/catalog";
import { catalogDetailPath } from "~/utils/catalogPath";

function absoluteCatalogUrl(id: string | number, mediaType: MediaType): string {
	const path = catalogDetailPath(id, mediaType);
	if (import.meta.client) {
		return `${window.location.origin}${path}`;
	}
	const { origin } = useRequestURL();
	return `${origin}${path}`;
}

export function useCatalogShare() {
	const toast = useToast();

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			toast.add({
				title: "Link copied",
				icon: "i-heroicons-check-circle",
				color: "success",
				duration: 4000,
			});
		} catch {
			toast.add({
				title: "Could not copy link",
				icon: "i-heroicons-exclamation-circle",
				color: "error",
				duration: 6000,
			});
		}
	}

	async function shareUrl(options: {
		url: string;
		title: string;
		text?: string;
	}) {
		if (import.meta.client && typeof navigator.share === "function") {
			try {
				await navigator.share({
					title: options.title,
					...(options.text ? { text: options.text } : {}),
					url: options.url,
				});
				return;
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
			}
		}
		await copyUrl(options.url);
	}

	async function shareCatalogTitle(options: {
		id: string | number;
		mediaType: MediaType;
		title: string;
	}) {
		const url = absoluteCatalogUrl(options.id, options.mediaType);
		await shareUrl({
			url,
			title: options.title,
			text: `${options.title} on MyMDb`,
		});
	}

	return { shareCatalogTitle, shareUrl, catalogShareUrl: absoluteCatalogUrl, copyUrl };
}
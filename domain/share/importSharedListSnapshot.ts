import type { ToggleMoviePayload } from "../user-document/createUserDocument";
import { MAX_LIST_NAME_LENGTH, MAX_LIST_TITLES } from "../user-document/listConstants";
import type { MediaType } from "../../types/catalog";
import type { UserList } from "../../types/list";
import type { UserMovie } from "../../types/movie";
import type { PublishedListItem } from "../../types/share";

export const IMPORT_AS_NEW_LIST = "__import_new__" as const;

export type ImportSnapshotResult = {
	added: number;
	skippedDuplicates: number;
	skippedCap: number;
	targetListId: string;
};

export type ImportSnapshotDeps = {
	items: PublishedListItem[];
	isOnAnyList: (id: string, mediaType?: MediaType) => boolean;
	moviesInList: (listId: string) => UserMovie[];
	toggleListMembership: (listId: string, payload: ToggleMoviePayload) => Promise<void>;
	createList: (name: string) => Promise<void>;
	lists: () => UserList[];
};

export function importListNameFromSnapshot(sourceListName: string): string {
	const trimmed = sourceListName.trim();
	if (!trimmed) return "Imported list";
	return trimmed.length > MAX_LIST_NAME_LENGTH ? trimmed.slice(0, MAX_LIST_NAME_LENGTH) : trimmed;
}

export function payloadFromPublishedItem(item: PublishedListItem): ToggleMoviePayload {
	return {
		id: item.id,
		mediaType: item.mediaType,
		title: item.title,
		rating: item.rating ?? 0,
		poster: item.poster ?? "",
		seen: false,
	};
}

export async function resolveImportTargetListId(
	choice: typeof IMPORT_AS_NEW_LIST | string,
	newListName: string,
	deps: Pick<ImportSnapshotDeps, "createList" | "lists">,
): Promise<string> {
	if (choice !== IMPORT_AS_NEW_LIST) {
		return choice;
	}
	const beforeIds = new Set(deps.lists().map((list) => list.id));
	await deps.createList(importListNameFromSnapshot(newListName));
	const created = deps.lists().find((list) => list.kind === "custom" && !beforeIds.has(list.id));
	if (!created) {
		throw new Error("Could not create a list for import.");
	}
	return created.id;
}

export async function importSharedListSnapshot(
	targetListId: string,
	deps: ImportSnapshotDeps,
): Promise<ImportSnapshotResult> {
	let added = 0;
	let skippedDuplicates = 0;
	let skippedCap = 0;

	for (const item of deps.items) {
		if (deps.isOnAnyList(item.id, item.mediaType)) {
			skippedDuplicates += 1;
			continue;
		}
		if (deps.moviesInList(targetListId).length >= MAX_LIST_TITLES) {
			skippedCap += 1;
			continue;
		}
		await deps.toggleListMembership(targetListId, payloadFromPublishedItem(item));
		added += 1;
	}

	return {
		added,
		skippedDuplicates,
		skippedCap,
		targetListId,
	};
}

export function formatImportSnapshotToast(result: ImportSnapshotResult): { title: string; description?: string } {
	const skipped = result.skippedDuplicates + result.skippedCap;
	if (result.added === 0 && skipped === 0) {
		return { title: "Nothing to import", description: "Every title is already on your lists." };
	}
	const title =
		result.added === 1
			? "1 title added to your list"
			: `${result.added} titles added to your list`;
	if (skipped === 0) {
		return { title };
	}
	const parts: string[] = [];
	if (result.skippedDuplicates > 0) {
		parts.push(
			result.skippedDuplicates === 1
				? "1 duplicate"
				: `${result.skippedDuplicates} duplicates`,
		);
	}
	if (result.skippedCap > 0) {
		parts.push(
			result.skippedCap === 1
				? "1 over the list limit"
				: `${result.skippedCap} over the list limit`,
		);
	}
	return {
		title,
		description: `Skipped ${parts.join(" and ")}.`,
	};
}
import type { DocumentData } from "firebase-admin/firestore";
import type { H3Event } from "h3";
import { toUserDocument } from "../../domain/user-document/vueFireStore";
import { buildPublishedListSnapshot } from "../../domain/share/buildPublishedListSnapshot";
import { ShareListCapError, ShareListNotFoundError } from "../../domain/share/errors";
import {
	PUBLISHED_LISTS_COLLECTION,
	type PublicPublishedListSnapshot,
	type PublishedListSnapshot,
	type PublishListResponse,
} from "../../types/share";
import { useAdminFirestore } from "./adminFirestore";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isShareId(shareId: string): boolean {
	return UUID_RE.test(shareId);
}

function toPublicSnapshot(snapshot: PublishedListSnapshot): PublicPublishedListSnapshot {
	const { ownerUid: _ownerUid, ...rest } = snapshot;
	return rest;
}

function parseStoredSnapshot(data: DocumentData, shareId: string): PublishedListSnapshot | null {
	if (!data || typeof data !== "object") return null;
	const row = data as Record<string, unknown>;
	if (row.schemaVersion !== 1) return null;
	if (typeof row.createdAt !== "string") return null;
	if (typeof row.ownerUid !== "string") return null;
	if (typeof row.ownerDisplayName !== "string") return null;
	if (typeof row.sourceListId !== "string") return null;
	if (typeof row.sourceListName !== "string") return null;
	if (row.sourceListKind !== "custom" && row.sourceListKind !== "system") return null;
	if (!Array.isArray(row.items)) return null;
	return {
		schemaVersion: 1,
		shareId,
		createdAt: row.createdAt,
		ownerUid: row.ownerUid,
		ownerDisplayName: row.ownerDisplayName,
		sourceListId: row.sourceListId,
		sourceListName: row.sourceListName,
		sourceListKind: row.sourceListKind,
		...(typeof row.sourceSystemListId === "string"
			? { sourceSystemListId: row.sourceSystemListId as "favorites" | "watch-next" }
			: {}),
		items: row.items as PublishedListSnapshot["items"],
	};
}

export async function loadOwnerUserDocument(uid: string, event?: H3Event) {
	const db = useAdminFirestore(event);
	const snapshot = await db.collection("users").doc(uid).get();
	if (!snapshot.exists) {
		return null;
	}
	return toUserDocument(snapshot.data(), uid);
}

export async function publishListSnapshot(
	uid: string,
	listId: string,
	origin: string,
	event?: H3Event,
): Promise<PublishListResponse> {
	const document = await loadOwnerUserDocument(uid, event);
	if (!document) {
		throw createError({ statusCode: 404, message: "User library not found." });
	}
	const shareId = crypto.randomUUID();
	const createdAt = new Date().toISOString();
	let snapshot: PublishedListSnapshot;
	try {
		snapshot = buildPublishedListSnapshot(document, listId, shareId, createdAt);
	} catch (error) {
		if (error instanceof ShareListNotFoundError) {
			throw createError({ statusCode: 404, message: error.message });
		}
		if (error instanceof ShareListCapError) {
			throw createError({ statusCode: 400, message: error.message });
		}
		throw error;
	}
	const db = useAdminFirestore(event);
	await db.collection(PUBLISHED_LISTS_COLLECTION).doc(shareId).create(snapshot);
	const url = `${origin.replace(/\/$/, "")}/s/${shareId}`;
	return { shareId, url };
}

export async function readPublicListSnapshot(
	shareId: string,
	event?: H3Event,
): Promise<PublicPublishedListSnapshot | null> {
	const db = useAdminFirestore(event);
	const snapshot = await db.collection(PUBLISHED_LISTS_COLLECTION).doc(shareId).get();
	if (!snapshot.exists) {
		return null;
	}
	const parsed = parseStoredSnapshot(snapshot.data() ?? {}, shareId);
	if (!parsed) {
		return null;
	}
	return toPublicSnapshot(parsed);
}
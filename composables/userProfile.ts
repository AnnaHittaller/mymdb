import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { User as AppUser } from "~/types/user";
import { defaultSystemLists } from "~/domain/user-document/migrateV2";
import { SCHEMA_VERSION_V2 } from "~/domain/user-document/listConstants";

export function defaultUsername(user: User, email: string) {
	const fromName = user.displayName?.trim();
	if (fromName) return fromName;
	const local = email.split("@")[0]?.trim();
	return local || "user";
}

/** Ensures the Firestore client has an auth token before rules are evaluated. */
export async function waitForAuthToken(user: User) {
	await user.getIdToken();
}

/**
 * Creates `users/{uid}` when missing. Never overwrites an existing profile (safe after provider linking).
 */
export async function ensureUserProfile(
	db: Firestore,
	user: User,
	profile: Pick<AppUser, "username" | "email"> & { theme?: string },
) {
	await waitForAuthToken(user);
	const ref = doc(db, "users", user.uid);
	const existing = await getDoc(ref);
	if (existing.exists()) {
		return;
	}
	await setDoc(ref, {
		uid: user.uid,
		username: profile.username,
		email: profile.email,
		theme: profile.theme ?? "emerald",
		schemaVersion: SCHEMA_VERSION_V2,
		lists: defaultSystemLists(),
		movies: [],
	} satisfies AppUser);
}

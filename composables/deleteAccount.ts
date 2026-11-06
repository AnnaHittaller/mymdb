import {
	deleteUser,
	EmailAuthProvider,
	reauthenticateWithCredential,
	reauthenticateWithPopup,
	type AuthProvider,
	type User,
} from "firebase/auth";
import { deleteDoc, doc, type Firestore } from "firebase/firestore";

export class ProfileDataRemovedError extends Error {
	override readonly cause: unknown;

	constructor(cause: unknown) {
		super(
			"Your saved movies were removed, but the account could not be deleted. Sign out, sign in again, and try once more.",
		);
		this.name = "ProfileDataRemovedError";
		this.cause = cause;
	}
}

export function accountNeedsPassword(user: User) {
	return user.providerData.some((provider) => provider.providerId === "password");
}

export function deleteFailureMessage(error: unknown) {
	if (error instanceof ProfileDataRemovedError) {
		return error.message;
	}
	const code =
		typeof error === "object" && error && "code" in error
			? String((error as { code?: unknown }).code ?? "")
			: "";
	if (
		code === "auth/invalid-credential" ||
		code === "auth/wrong-password" ||
		code === "auth/invalid-login-credentials"
	) {
		return "That password is incorrect.";
	}
	if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
		return "Google confirmation was cancelled.";
	}
	if (code === "auth/requires-recent-login") {
		return "Sign out, sign in again, then delete your profile.";
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return "Could not delete your profile.";
}

/**
 * Confirms a recent sign-in, removes `users/{uid}`, then deletes the Auth user.
 * The document goes first so Firestore rules still see the owner.
 */
export async function deleteAccount(
	db: Firestore,
	user: User,
	options: { password?: string; googleProvider: AuthProvider },
) {
	if (accountNeedsPassword(user)) {
		const email = user.email;
		const password = options.password?.trim();
		if (!email || !password) {
			throw new Error("Enter your password to delete this profile.");
		}
		await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, password));
	} else if (user.providerData.some((provider) => provider.providerId === "google.com")) {
		await reauthenticateWithPopup(user, options.googleProvider);
	}

	await deleteDoc(doc(db, "users", user.uid));
	try {
		await deleteUser(user);
	} catch (error) {
		throw new ProfileDataRemovedError(error);
	}
}

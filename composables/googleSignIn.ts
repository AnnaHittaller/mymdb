import {
	GoogleAuthProvider,
	linkWithCredential,
	linkWithPopup,
	signInWithEmailAndPassword,
	signInWithPopup,
	type Auth,
	type UserCredential,
} from "firebase/auth";
import type { GoogleAuthProvider as GoogleAuthProviderType } from "firebase/auth";

export type GoogleSignInOptions = {
	email?: string;
	password?: string;
	promptForPassword: (email: string) => Promise<string | null>;
};

/**
 * Prefer password-first linking when the user gives email + password, then attach Google with
 * linkWithPopup. That keeps the password provider (Firebase auto-link on signInWithPopup alone
 * can leave email/password sign-in broken for the same address).
 *
 * Falls back to signInWithPopup when email/password are not provided (new or Google-only users),
 * with manual linking if Firebase throws account-exists-with-different-credential.
 */
export async function signInWithGoogleAndLink(
	auth: Auth,
	provider: GoogleAuthProviderType,
	options: GoogleSignInOptions,
): Promise<UserCredential> {
	const email = options.email?.trim();

	if (email) {
		const password = options.password?.length
			? options.password
			: await options.promptForPassword(email);
		if (!password) {
			throw new Error("Google link cancelled.");
		}

		const passwordSignIn = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		try {
			return await linkWithPopup(passwordSignIn.user, provider);
		} catch (error: unknown) {
			const authError = error as { code?: string };
			// Google already linked to this user — treat as signed in.
			if (authError.code === "auth/provider-already-linked") {
				return passwordSignIn;
			}
			if (authError.code === "auth/credential-already-in-use") {
				throw new Error(
					"This Google account is linked to another user. Sign in with Google only, or use a different Google account.",
				);
			}
			throw error;
		}
	}

	try {
		return await signInWithPopup(auth, provider);
	} catch (error: unknown) {
		const authError = error as {
			code?: string;
			customData?: { email?: string };
		};
		if (authError.code !== "auth/account-exists-with-different-credential") {
			throw error;
		}

		const existingEmail = authError.customData?.email;
		const pendingGoogleCred = GoogleAuthProvider.credentialFromError(
			error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
		);
		if (!existingEmail || !pendingGoogleCred) {
			throw error;
		}

		const password = await options.promptForPassword(existingEmail);
		if (!password) {
			throw new Error("Google link cancelled.");
		}

		const passwordSignIn = await signInWithEmailAndPassword(
			auth,
			existingEmail,
			password,
		);
		await linkWithCredential(passwordSignIn.user, pendingGoogleCred);
		return passwordSignIn;
	}
}

export const googleLinkHint =
	"Already linked? Use Google alone. First-time link? Enter email & password once, then Google.";

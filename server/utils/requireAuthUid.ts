import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getCookie, getRequestHeader } from "h3";
import type { H3Event } from "h3";
import { AUTH_COOKIE_NAME, decodeSessionCookie } from "vuefire/server";
import { getFirebaseAdminApp } from "./firebaseAdminApp";

/**
 * Resolves the signed-in user on API routes: `__session` cookie (SSR) or `Authorization: Bearer` ID token.
 */
export async function requireAuthUid(event: H3Event): Promise<string> {
	const adminApp = getFirebaseAdminApp(event);
	const adminAuth = getAdminAuth(adminApp);

	const bearer = getRequestHeader(event, "authorization");
	if (bearer?.startsWith("Bearer ")) {
		const idToken = bearer.slice("Bearer ".length).trim();
		if (idToken) {
			try {
				const decoded = await adminAuth.verifyIdToken(idToken);
				if (decoded.uid) {
					return decoded.uid;
				}
			} catch {
				// Fall through to session cookie.
			}
		}
	}

	const decoded = await decodeSessionCookie(getCookie(event, AUTH_COOKIE_NAME), adminApp);
	if (decoded?.uid) {
		return decoded.uid;
	}

	throw createError({ statusCode: 401, message: "Sign in to share a list." });
}
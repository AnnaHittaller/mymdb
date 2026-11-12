import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, type User } from "firebase/auth";
import { accountNeedsPassword } from "~/composables/deleteAccount";

export function changePasswordFailureMessage(error: unknown) {
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
	if (code === "auth/weak-password") {
		return "Choose a stronger password (at least 6 characters).";
	}
	if (code === "auth/requires-recent-login") {
		return "Sign out, sign in again, then change your password.";
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return "Could not change your password.";
}

export async function changeAccountPassword(user: User, currentPassword: string, newPassword: string) {
	if (!accountNeedsPassword(user)) {
		throw new Error("Password cannot be changed for this sign-in method.");
	}
	const email = user.email;
	if (!email) {
		throw new Error("No email is linked to this account.");
	}
	await reauthenticateWithCredential(
		user,
		EmailAuthProvider.credential(email, currentPassword.trim()),
	);
	await updatePassword(user, newPassword);
}

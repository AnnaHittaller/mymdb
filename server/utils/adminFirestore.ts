import { getFirestore } from "firebase-admin/firestore";
import type { H3Event } from "h3";
import { getFirebaseAdminApp } from "./firebaseAdminApp";

export function useAdminFirestore(event?: H3Event) {
	return getFirestore(getFirebaseAdminApp(event));
}
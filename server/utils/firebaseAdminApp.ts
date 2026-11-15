import type { App } from "firebase-admin/app";
import type { H3Event } from "h3";
import { ensureAdminApp } from "vuefire/server";

type VuefireRuntimeConfig = {
	admin?: { options?: Record<string, unknown> };
};

type VuefirePublicConfig = {
	config?: { projectId?: string };
};

/** Admin SDK app for Nitro handlers (does not rely on `useNuxtApp()`). */
export function getFirebaseAdminApp(event?: H3Event): App {
	const contextApp = event?.context?.firebaseApp as App | undefined;
	if (contextApp) {
		return contextApp;
	}
	const config = useRuntimeConfig(event);
	const vuefire = config.vuefire as VuefireRuntimeConfig | undefined;
	const projectId = (config.public.vuefire as VuefirePublicConfig | undefined)?.config?.projectId;
	return ensureAdminApp(
		{
			projectId,
			...vuefire?.admin?.options,
		},
		"mymdb-server",
	);
}
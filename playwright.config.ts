import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

function loadDotEnv() {
	const path = `${rootDir}/.env`;
	if (!existsSync(path)) return;
	for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const value = trimmed.slice(eq + 1).trim();
		if (!(key in process.env)) process.env[key] = value;
	}
}

loadDotEnv();

/** Firebase demo project + emulators (see firebase.json). */
const e2eFirebaseEnv: Record<string, string> = {
	NUXT_E2E: "true",
	FIREBASE_APIKEY: "fake-api-key",
	FIREBASE_AUTHDOMAIN: "localhost",
	FIREBASE_PROJECTID: "demo-mymdb-e2e",
	FIREBASE_STORAGEBUCKET: "demo-mymdb-e2e.appspot.com",
	FIREBASE_MESSAGINGSENDERID: "123456789012",
	FIREBASE_APPID: "1:123456789012:web:abcdef0123456789",
	FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
	FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
	VUEFIRE_EMULATORS: "true",
};

// Nuxt reads process.env at build time; .env must not point the test build at production Firebase.
Object.assign(process.env, e2eFirebaseEnv);
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

const tmdbEnv = {
	NUXT_API_KEY: process.env.NUXT_API_KEY ?? "",
	NUXT_API_BASE_URL: process.env.NUXT_API_BASE_URL ?? "",
	NUXT_API_BEARER_TOKEN: process.env.NUXT_API_BEARER_TOKEN ?? "",
};

export default defineConfig<ConfigOptions>({
	testDir: "./test/e2e",
	fullyParallel: false,
	workers: 1,
	timeout: 120_000,
	use: {
		...devices["Desktop Chrome"],
		// Prefer installed Chrome so `npx playwright install chromium` is optional locally.
		channel: "chrome",
		nuxt: {
			rootDir,
			setupTimeout: 240_000,
			env: {
				...e2eFirebaseEnv,
				...tmdbEnv,
			},
		},
	},
});

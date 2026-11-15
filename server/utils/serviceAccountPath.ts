import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

/**
 * `nuxt preview` runs with cwd `.output`, so a relative
 * `GOOGLE_APPLICATION_CREDENTIALS` such as `sa.json` is looked up inside the
 * build output. The gitignored key stays at the project root. JSON credential
 * blobs (Netlify) and absolute paths are left unchanged.
 */
export function resolveServiceAccountPath(
	credentials: string | undefined,
	cwd: string,
): string | undefined {
	if (!credentials) return credentials;
	const trimmed = credentials.trim();
	if (!trimmed || trimmed.startsWith("{") || isAbsolute(trimmed)) return credentials;
	const fromCwd = resolve(cwd, trimmed);
	if (existsSync(fromCwd)) return fromCwd;
	const fromParent = resolve(cwd, "..", trimmed);
	if (existsSync(fromParent)) return fromParent;
	return credentials;
}

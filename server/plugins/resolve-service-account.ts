import { resolveServiceAccountPath } from "../utils/serviceAccountPath";

export default defineNitroPlugin(() => {
	const resolved = resolveServiceAccountPath(
		process.env.GOOGLE_APPLICATION_CREDENTIALS,
		process.cwd(),
	);
	if (resolved) process.env.GOOGLE_APPLICATION_CREDENTIALS = resolved;
});

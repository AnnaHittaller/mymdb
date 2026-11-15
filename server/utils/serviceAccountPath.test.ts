import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveServiceAccountPath } from "./serviceAccountPath";

describe("resolveServiceAccountPath", () => {
	it("leaves JSON blobs and absolute paths alone", () => {
		expect(resolveServiceAccountPath('{"type":"service_account"}', "D:\\out")).toBe(
			'{"type":"service_account"}',
		);
		expect(resolveServiceAccountPath("D:\\keys\\sa.json", "D:\\app\\.output")).toBe(
			"D:\\keys\\sa.json",
		);
		expect(resolveServiceAccountPath(undefined, "D:\\app")).toBeUndefined();
	});

	it("finds a relative key next to the project when cwd is .output", () => {
		const root = join(tmpdir(), `sa-path-${Date.now()}`);
		const output = join(root, ".output");
		mkdirSync(output, { recursive: true });
		writeFileSync(join(root, "sa.json"), "{}");

		const resolved = resolveServiceAccountPath("sa.json", output);
		expect(resolved).toBe(join(root, "sa.json"));
	});

	it("prefers the file in cwd when it is already there", () => {
		const root = join(tmpdir(), `sa-cwd-${Date.now()}`);
		mkdirSync(root, { recursive: true });
		writeFileSync(join(root, "sa.json"), "{}");

		expect(resolveServiceAccountPath("sa.json", root)).toBe(join(root, "sa.json"));
	});
});

import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

type JsonTree = string | JsonTree[] | { [key: string]: JsonTree }

const localeDir = path.join(process.cwd(), "i18n/locales")

function loadLocale(code: "en" | "de" | "hu") {
	return JSON.parse(readFileSync(path.join(localeDir, `${code}.json`), "utf8")) as JsonTree
}

/** Dot paths to every string leaf in a locale tree. */
function stringPaths(value: JsonTree, prefix: string[] = []): string[] {
	if (typeof value === "string") {
		return [prefix.join(".")]
	}
	if (Array.isArray(value)) {
		return value.flatMap((entry, index) => stringPaths(entry, [...prefix, String(index)]))
	}
	if (value && typeof value === "object") {
		return Object.keys(value).flatMap((key) => stringPaths(value[key], [...prefix, key]))
	}
	return []
}

function getAtPath(tree: JsonTree, dotPath: string): string | undefined {
	const parts = dotPath.split(".")
	let current: JsonTree = tree
	for (const part of parts) {
		if (typeof current !== "object" || current === null || Array.isArray(current)) {
			return undefined
		}
		current = current[part]
	}
	return typeof current === "string" ? current : undefined
}

/** Same spelling in EN and target locale is OK for these paths (brands, shared legal terms, placeholders). */
const IDENTICAL_OK: Record<"de" | "hu", readonly string[]> = {
	de: [
		"meta.title",
		"browse.ratingPlus",
		"theme.mandy",
		"legal.cookies",
		"legal.impressum",
		"legal.impressumTitle",
		"legal.tableName",
	],
	hu: ["meta.title", "browse.ratingPlus", "theme.mandy"],
}

describe("i18n locale files", () => {
	const en = loadLocale("en")
	const de = loadLocale("de")
	const hu = loadLocale("hu")
	const enPaths = stringPaths(en)

	it("de and hu contain every key from en", () => {
		for (const dotPath of enPaths) {
			expect(getAtPath(de, dotPath), `de missing ${dotPath}`).toBeDefined()
			expect(getAtPath(hu, dotPath), `hu missing ${dotPath}`).toBeDefined()
		}
	})

	it("de and hu do not reuse English copy except allowlist", () => {
		for (const dotPath of enPaths) {
			const enText = getAtPath(en, dotPath)!
			if (!IDENTICAL_OK.de.includes(dotPath)) {
				expect(getAtPath(de, dotPath), dotPath).not.toBe(enText)
			}
			if (!IDENTICAL_OK.hu.includes(dotPath)) {
				expect(getAtPath(hu, dotPath), dotPath).not.toBe(enText)
			}
		}
	})
})
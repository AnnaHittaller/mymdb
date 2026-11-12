import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["domain/**/*.test.ts", "utils/**/*.test.ts", "server/**/*.test.ts"],
	},
});

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(scriptsDir);
const playwrightCli = join(root, "node_modules/@playwright/test/cli.js");

const child = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
	stdio: "inherit",
	cwd: root,
	env: (() => {
		const env = { ...process.env, NODE_USE_SYSTEM_CA: "1" };
		delete env.VSCODE_CWD;
		return env;
	})(),
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(scriptsDir);

const playwrightArgs = process.argv.slice(2);

/** Firestore emulator needs a JDK on PATH (or D:\\Java\\… from scripts/install-java-d.ps1). */
function applyJavaEnv(env) {
	const javaExe = process.platform === "win32" ? "java.exe" : "java";
	const prependBin = (javaHome) => {
		const bin = join(javaHome, "bin");
		if (!existsSync(join(bin, javaExe))) return false;
		env.JAVA_HOME = javaHome;
		const sep = process.platform === "win32" ? ";" : ":";
		env.PATH = `${bin}${sep}${env.PATH ?? ""}`;
		return true;
	};

	if (process.env.JAVA_HOME && prependBin(process.env.JAVA_HOME)) return;

	const defaultD = join("D:/Java/jdk-17");
	if (prependBin(defaultD)) return;

	const javaRoot = "D:/Java";
	if (!existsSync(javaRoot)) return;
	for (const name of readdirSync(javaRoot)) {
		if (prependBin(join(javaRoot, name))) return;
	}
}

/** firebase-tools via npx is large; default cache/temp away from a full system drive. */
const npmCache =
	process.env.npm_config_cache ?? process.env.NPM_CONFIG_CACHE ?? "D:/npm-cache";
const tmpDir = process.env.TMPDIR ?? process.env.TMP ?? process.env.TEMP ?? "D:/tmp";

const env = {
	...process.env,
	NODE_USE_SYSTEM_CA: "1",
	npm_config_cache: npmCache,
	NPM_CONFIG_CACHE: npmCache,
	TMP: tmpDir,
	TEMP: tmpDir,
	TMPDIR: tmpDir,
};
delete env.VSCODE_CWD;
applyJavaEnv(env);

const playwrightCmd = ["node", "./scripts/playwright-test.mjs", ...playwrightArgs].join(" ");

const emulatorExecArgs = [
	"emulators:exec",
	"--only",
	"auth,firestore",
	"--project",
	"demo-mymdb-e2e",
	"--",
	playwrightCmd,
];

const localFirebase = join(root, "node_modules/firebase-tools/lib/bin/firebase.js");

const child = existsSync(localFirebase)
	? spawn(process.execPath, [localFirebase, ...emulatorExecArgs], {
			stdio: "inherit",
			cwd: root,
			env,
		})
	: spawn(
			"npx",
			["--cache", npmCache, "--yes", "firebase-tools@13.30.0", ...emulatorExecArgs],
			{
				stdio: "inherit",
				cwd: root,
				shell: true,
				env,
			},
		);

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});

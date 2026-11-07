import { spawn } from "node:child_process"
import { realpathSync } from "node:fs"
import { resolve } from "node:path"

// Git Bash reports a lowercase drive letter. Vitest 5 then loads two copies of
// its runtime on Windows and describe() crashes. The canonical path keeps one copy.
const cwd = realpathSync.native(process.cwd())
const vitest = resolve(cwd, "node_modules/vitest/vitest.mjs")
const child = spawn(process.execPath, [vitest, "run", ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
  env: process.env,
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

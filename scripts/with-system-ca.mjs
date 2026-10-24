import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const nuxtBin = fileURLToPath(new URL("../node_modules/nuxt/bin/nuxt.mjs", import.meta.url))
const child = spawn(process.execPath, [nuxtBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NODE_USE_SYSTEM_CA: "1" },
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

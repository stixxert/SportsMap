#!/usr/bin/env node
/**
 * `open-next build` → `opennextjs-cloudflare build`.
 *
 * The Cloudflare project's build command is `npx open-next build`, left over from the
 * older integration where the AWS `open-next` CLI was the host and
 * @opennextjs/cloudflare was only a wrapper it loaded. `open-next` is not one of our
 * dependencies, so npx downloaded the unrelated AWS adapter, which has no `cloudflare`
 * wrapper in its compatibility matrix and crashed while validating open-next.config.ts.
 *
 * This shim gives the name a local target, so the existing build command resolves to the
 * supported Cloudflare CLI instead of fetching the AWS adapter. No dashboard change and
 * no extra dependency. It deliberately does not depend on `open-next` at all.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const LOCAL_BIN = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32"
    ? "opennextjs-cloudflare.cmd"
    : "opennextjs-cloudflare",
);

if (!existsSync(LOCAL_BIN)) {
  console.error(
    "open-next: @opennextjs/cloudflare is not installed. Run `pnpm install` first.",
  );
  process.exit(1);
}

const child = spawn(LOCAL_BIN, process.argv.slice(2), {
  stdio: "inherit",
  cwd: process.cwd(),
  env: process.env,
});

child.on("error", (error) => {
  console.error("open-next: failed to start the Cloudflare CLI", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const currentPid = process.pid;
const parentPid = process.ppid;

function processCwd(pid) {
  try {
    const output = execFileSync(
      "lsof",
      ["-a", "-p", String(pid), "-d", "cwd", "-Fn"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );

    return output
      .split("\n")
      .find((line) => line.startsWith("n"))
      ?.slice(1);
  } catch {
    return undefined;
  }
}

function runningNextDevProcesses() {
  try {
    const output = execFileSync("ps", ["-axo", "pid=,command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [pidText, ...commandParts] = line.split(/\s+/);
        return { pid: Number(pidText), command: commandParts.join(" ") };
      })
      .filter(({ pid, command }) => {
        if (!Number.isFinite(pid) || pid === currentPid || pid === parentPid)
          return false;
        if (!/\bnext\b/.test(command) || !/\bdev\b/.test(command)) return false;

        return command.includes(appRoot) || processCwd(pid) === appRoot;
      });
  } catch {
    return [];
  }
}

const existing = runningNextDevProcesses();
if (existing.length > 0) {
  console.error(
    "[dev-cache] Another @ibo/web next dev process is already running:",
  );
  for (const processInfo of existing) {
    console.error(`  pid ${processInfo.pid}: ${processInfo.command}`);
  }
  console.error(
    "[dev-cache] Stop it before starting a second dev server. Shared .next webpack cache cannot be written safely by two dev servers.",
  );
  process.exit(1);
}

const webpackCacheDir = join(appRoot, ".next", "cache", "webpack");
for (const dirname of [
  "client-development",
  "server-development",
  "edge-server-development",
]) {
  rmSync(join(webpackCacheDir, dirname), { recursive: true, force: true });
}

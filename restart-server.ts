#!/usr/bin/env bun

import { $ } from "bun";

try {
  await $`sudo -v`;
  process.chdir("/opt/survev/server");
  await $`git pull`;
  await $`pnpm run build`;
  await $`sudo systemctl restart survev-game`;
} catch (error) {
  console.error("Update failed:", error);
  process.exit(1);
}
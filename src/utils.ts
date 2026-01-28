import * as fs from "node:fs/promises";
import type { AppListProvider } from "./provider";
import type { RuleSetExtension } from "./rules";

export const exhaustProvider = async (
  provider: AppListProvider,
  limit: number = 1_000,
) => {
  const result: Record<string, string> = Object.create(null);
  for (let i = 0; ; i++) {
    const data = await exponentialBackoff(() => provider.retrieve(i));
    Object.assign(result, data);
    if (Object.keys(data).length <= 0 || Object.keys(result).length >= limit)
      break;
  }
  return result;
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const processRuleExclusions = (
  rules: Record<string, string>,
  exclusions: RuleSetExtension[],
) => {
  const excludedRegex = new RegExp(
    exclusions
      .map((e) => (typeof e === "string" ? escapeRegex(e) : e.regex))
      .join("|"),
    "ig",
  );

  return Object.fromEntries(
    Object.entries(rules).filter(([k]) => !k.match(excludedRegex)),
  );
};

export const mkdir = async (dir: string) => {
  return fs
    .mkdir(dir, { recursive: true })
    .catch((e: NodeJS.ErrnoException) => {
      if (e.code !== "EEXIST") throw e;
      return undefined;
    });
};

export const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const exponentialBackoff = async <T>(
  fn: () => T,
  maxRetries: number = 5,
  startDelayMs: number = 1000,
): Promise<T> => {
  let delayMs = startDelayMs;
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      delayMs *= 2;
      lastError = e;
      console.warn(
        `Function ${fn.name} failed (attempt ${i}/${maxRetries}):`,
        lastError,
      );
      await sleep(delayMs);
    }
  }
  throw lastError;
};

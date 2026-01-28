import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";
import { ProviderType, providers } from "./provider";
import { type RuleSetExtension, rulesRenderers } from "./rules";
import { exhaustProvider, mkdir, processRuleExclusions } from "./utils";

interface RulesetConfig {
  excluded: RuleSetExtension[];
  included: RuleSetExtension[];
  headers: Record<string, string>;
}

type RulesetWriteOptions = {
  dataPath: string;
  namespace: string;
  type: ProviderType;
  rules: Record<string, string>;
  includes?: RuleSetExtension[];
  suffix?: string;
};

const writeRulesetFiles = async ({
  dataPath,
  namespace,
  type,
  rules,
  includes,
  suffix = "",
}: RulesetWriteOptions) => {
  for (const renderer of rulesRenderers) {
    const filePath = path.resolve(
      dataPath,
      namespace,
      `${ProviderType[type]}${suffix}.${renderer.extension}`,
    );
    console.log(`writing to ${filePath}`);
    await mkdir(path.dirname(filePath));
    await fs.writeFile(filePath, renderer.render(rules, includes));
  }
};

const readRulesetConfig = async (
  configFile: string,
): Promise<RulesetConfig | null> => {
  const configExists = await fs
    .stat(configFile)
    .then((s) => s.isFile())
    .catch(() => false);
  if (!configExists) return null;

  return YAML.parse(await fs.readFile(configFile, "utf-8")) as RulesetConfig;
};

const providerTypes = Object.values(ProviderType).filter(
  (value): value is ProviderType => typeof value === "number",
);

const main = async () => {
  const dataPath = path.resolve(process.cwd(), "result");
  await mkdir(dataPath);

  const configFile = path.resolve(process.cwd(), "config.yaml");
  const config = await readRulesetConfig(configFile);

  for (const type of providerTypes) {
    const merged: Record<string, string> = Object.create(null);

    for (const Provider of providers) {
      const provider = new Provider(type, config?.headers);
      console.log(
        `retrieving from ${Provider.providerName}(${ProviderType[type]})`,
      );
      await provider.init();
      const result = await exhaustProvider(provider);

      await writeRulesetFiles({
        dataPath,
        namespace: Provider.providerName,
        type,
        rules: result,
      });

      if (!config) continue;
      const { excluded, included } = config;
      const mutatedConfig = processRuleExclusions(result, excluded);
      await writeRulesetFiles({
        dataPath,
        namespace: Provider.providerName,
        type,
        rules: mutatedConfig,
        includes: included,
        suffix: ".mutated",
      });

      Object.assign(merged, mutatedConfig);
    }

    await writeRulesetFiles({
      dataPath,
      namespace: "@Merged",
      type,
      rules: merged,
    });

    if (!config) continue;
    const { excluded, included } = config;
    const mutatedConfig = processRuleExclusions(merged, excluded);
    await writeRulesetFiles({
      dataPath,
      namespace: "@Merged",
      type,
      rules: mutatedConfig,
      includes: included,
      suffix: ".mutated",
    });
  }
};

await main();

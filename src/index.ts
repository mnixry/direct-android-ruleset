import { AppListProvider, ProviderType, providers } from "./provider";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";

type RuleSetExtension = string | { regex: string };

interface RulesetConfig {
  excluded: RuleSetExtension[];
  included: RuleSetExtension[];
  headers: Record<string, string>;
}

const rulesToYaml = (
  rules: Record<string, string>,
  includes?: RuleSetExtension[]
) => {
  const document = new YAML.Document({ payload: [] });

  for (const [pkgName, name] of Object.entries(rules).sort(([ka], [kb]) =>
    ka.localeCompare(kb)
  )) {
    const node = document.createNode(`PROCESS-NAME,${pkgName}`);
    if (name) node.comment = name;
    document.addIn(["payload"], node);
  }

  if (includes) {
    for (const include of includes) {
      const node = document.createNode(
        typeof include === "string"
          ? `PROCESS-NAME,${include}`
          : `PROCESS-NAME-REGEX,${include.regex}`
      );
      document.addIn(["payload"], node);
    }
  }
  return document.toString();
};

const rulesToSurgioSnippet = (
  rules: Record<string, string>,
  includes?: RuleSetExtension[]
) => {
  const snippets: string[] = ["{% macro main(rule) %}"];

  for (const [pkgName, name] of Object.entries(rules).sort(([ka], [kb]) =>
    ka.localeCompare(kb)
  )) {
    const comment = name ? ` {# ${name} #}` : "";
    snippets.push(`PROCESS-NAME,${pkgName},{{ rule }}${comment}`);
  }

  if (includes) {
    for (const include of includes) {
      snippets.push(
        typeof include === "string"
          ? `PROCESS-NAME,${include}`
          : `PROCESS-NAME-REGEX,${include.regex}`
      );
    }
  }

  snippets.push("{% endmacro %}");
  return snippets.join("\n");
};

const exhaustProvider = async (
  provider: AppListProvider,
  limit: number = 1_000
) => {
  const result: Record<string, string> = {};
  for (let i = 0; ; i++) {
    const data = await provider.retrieve(i);
    Object.assign(result, data);
    if (Object.keys(data).length <= 0 || Object.keys(result).length >= limit)
      break;
  }
  return result;
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const processRuleExclusions = (
  rules: Record<string, string>,
  exclusions: RuleSetExtension[]
) => {
  const excludedRegex = new RegExp(
    exclusions
      .map((e) => (typeof e === "string" ? escapeRegex(e) : e.regex))
      .join("|"),
    "ig"
  );

  return Object.fromEntries(
    Object.entries(rules).filter(([k]) => !k.match(excludedRegex))
  );
};

const mkdir = async (dir: string) => {
  return fs.mkdir(dir, { recursive: true }).catch((e: any) => {
    if (e.code !== "EEXIST") throw e;
    return undefined;
  });
};

const main = async () => {
  const dataPath = path.resolve(process.cwd(), "result");
  await mkdir(dataPath);

  const configFile = path.resolve(process.cwd(), "config.yaml");
  const config = (await fs
    .stat(configFile)
    .then((s) => s.isFile())
    .catch(() => false))
    ? (YAML.parse(await fs.readFile(configFile, "utf-8")) as RulesetConfig)
    : null;

  for (const type of Object.values(ProviderType).filter(
    (v) => typeof v === "number"
  )) {
    const merged: Record<string, string> = {};

    for (const Provider of providers) {
      const provider = new Provider(type, config?.headers);
      console.log(
        `retrieving from ${Provider.providerName}(${ProviderType[type]})`
      );
      await provider.init();
      const result = await exhaustProvider(provider);

      const filePath = path.resolve(
        dataPath,
        Provider.providerName,
        ProviderType[type] + ".yaml"
      );
      console.log(`writing to ${filePath}`);
      const yaml = rulesToYaml(result);
      await mkdir(path.dirname(filePath));
      await fs.writeFile(filePath, yaml);

      const surgioSnippetFilePath = path.resolve(
        dataPath,
        Provider.providerName,
        ProviderType[type] + ".tpl"
      );
      console.log(`writing to ${surgioSnippetFilePath}`);
      const surgioSnippet = rulesToSurgioSnippet(result);
      await mkdir(path.dirname(surgioSnippetFilePath));
      await fs.writeFile(surgioSnippetFilePath, surgioSnippet);

      if (!config) continue;
      const { excluded, included } = config;
      const mutatedConfig = processRuleExclusions(result, excluded);
      const mutatedFilePath = path.resolve(
        dataPath,
        Provider.providerName,
        ProviderType[type] + ".mutated.yaml"
      );
      console.log(`writing to ${mutatedFilePath}`);
      const mutatedYaml = rulesToYaml(mutatedConfig, included);
      await mkdir(path.dirname(mutatedFilePath));
      await fs.writeFile(mutatedFilePath, mutatedYaml);

      const mutatedSurgioSnippetFilePath = path.resolve(
        dataPath,
        Provider.providerName,
        ProviderType[type] + ".mutated.tpl"
      );
      console.log(`writing to ${mutatedSurgioSnippetFilePath}`);
      const mutatedSurgioSnippet = rulesToSurgioSnippet(
        mutatedConfig,
        included
      );
      await mkdir(path.dirname(mutatedSurgioSnippetFilePath));
      await fs.writeFile(mutatedSurgioSnippetFilePath, mutatedSurgioSnippet);

      Object.assign(merged, mutatedConfig);
    }

    const mergedFilePath = path.resolve(
      dataPath,
      "@Merged",
      ProviderType[type] + ".yaml"
    );
    console.log(`writing to ${mergedFilePath}`);
    const mergedYaml = rulesToYaml(merged);
    await mkdir(path.dirname(mergedFilePath));
    await fs.writeFile(mergedFilePath, mergedYaml);

    const mergedSurgioSnippetFilePath = path.resolve(
      dataPath,
      "@Merged",
      ProviderType[type] + ".tpl"
    );
    console.log(`writing to ${mergedSurgioSnippetFilePath}`);
    const mergedSurgioSnippet = rulesToSurgioSnippet(merged);
    await mkdir(path.dirname(mergedSurgioSnippetFilePath));
    await fs.writeFile(mergedSurgioSnippetFilePath, mergedSurgioSnippet);

    if (!config) continue;
    const { excluded, included } = config;
    const mutatedConfig = processRuleExclusions(merged, excluded);
    const mutatedFilePath = path.resolve(
      dataPath,
      "@Merged",
      ProviderType[type] + ".mutated.yaml"
    );
    console.log(`writing to ${mutatedFilePath}`);
    const mutatedYaml = rulesToYaml(mutatedConfig, included);
    await mkdir(path.dirname(mutatedFilePath));
    await fs.writeFile(mutatedFilePath, mutatedYaml);

    const mutatedSurgioSnippetFilePath = path.resolve(
      dataPath,
      "@Merged",
      ProviderType[type] + ".mutated.tpl"
    );
    console.log(`writing to ${mutatedSurgioSnippetFilePath}`);
    const mutatedSurgioSnippet = rulesToSurgioSnippet(mutatedConfig, included);
    await mkdir(path.dirname(mutatedSurgioSnippetFilePath));
    await fs.writeFile(mutatedSurgioSnippetFilePath, mutatedSurgioSnippet);
  }
};

await main();

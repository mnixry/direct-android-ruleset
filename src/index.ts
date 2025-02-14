import { AppListProvider, ProviderType, providers } from "./provider";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";

const rulesToYaml = (rules: Record<string, string>) => {
  const document = new YAML.Document({ payload: [] });
  for (const [pkgName, name] of Object.entries(rules).sort(([ka], [kb]) =>
    ka.localeCompare(kb)
  )) {
    const node = document.createNode(`PROCESS-NAME,${pkgName}`);
    node.comment = name;
    document.addIn(["payload"], node);
  }
  return document.toString();
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

const main = async () => {
  const dataPath = path.resolve(process.cwd(), "result");
  if (
    !(await fs
      .stat(dataPath)
      .then((s) => s.isDirectory())
      .catch(() => false))
  ) {
    await fs.mkdir(dataPath);
  }

  for (const type of Object.values(ProviderType).filter(
    (v) => typeof v === "number"
  )) {
    for (const Provider of providers) {
      const provider = new Provider(type);
      console.log(
        `retrieving from ${Provider.providerName}(${ProviderType[type]})`
      );
      await provider.init();
      const result = await exhaustProvider(provider);

      const fileName = `${Provider.providerName}-${ProviderType[type]}.yaml`;
      const filePath = path.resolve(dataPath, fileName);
      console.log(`writing to ${filePath}`);
      const yaml = rulesToYaml(result);
      await fs.writeFile(filePath, yaml);
    }
  }
};

await main();

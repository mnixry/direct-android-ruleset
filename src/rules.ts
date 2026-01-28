import * as YAML from "yaml";

export type RuleSetExtension = string | { regex: string };

type RulesMap = Record<string, string>;

const sortRuleEntries = (rules: RulesMap) =>
  Object.entries(rules).sort(([ka], [kb]) => ka.localeCompare(kb));

const formatRulePayload = (value: string, isRegex = false) =>
  `PROCESS-NAME${isRegex ? "-REGEX" : ""},${value}`;

const formatExtensionPayload = (include: RuleSetExtension) =>
  typeof include === "string"
    ? formatRulePayload(include)
    : formatRulePayload(include.regex, true);

export const rulesToYaml = (
  rules: RulesMap,
  includes?: RuleSetExtension[],
) => {
  const document = new YAML.Document({ payload: [] });

  for (const [pkgName, name] of sortRuleEntries(rules)) {
    const node = document.createNode(formatRulePayload(pkgName));
    if (name) node.comment = name;
    document.addIn(["payload"], node);
  }

  if (includes) {
    for (const include of includes) {
      const node = document.createNode(formatExtensionPayload(include));
      document.addIn(["payload"], node);
    }
  }
  return document.toString();
};

export const rulesToSurgioSnippet = (
  rules: RulesMap,
  includes?: RuleSetExtension[],
) => {
  const snippets: string[] = ["{% macro main(rule) %}"];

  for (const [pkgName, name] of sortRuleEntries(rules)) {
    const comment = name ? ` # ${name}` : "";
    snippets.push(`${formatRulePayload(pkgName)},{{ rule }}${comment}`);
  }

  if (includes) {
    for (const include of includes) {
      snippets.push(`${formatExtensionPayload(include)},{{ rule }}`);
    }
  }

  snippets.push("{% endmacro %}");
  return snippets.join("\n");
};

export interface RulesRenderer {
  extension: string;
  render: (rules: RulesMap, includes?: RuleSetExtension[]) => string;
}

export const rulesRenderers: RulesRenderer[] = [
  { extension: "yaml", render: rulesToYaml },
  { extension: "tpl", render: rulesToSurgioSnippet },
];

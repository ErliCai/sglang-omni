#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const [root, kind] = process.argv.slice(2);
if (!root || !["layers", "tour"].includes(kind)) {
  console.error("usage: normalize-artifacts.cjs <project-root> <layers|tour>");
  process.exit(2);
}

const intermediate = path.join(root, ".ua", "intermediate");
const graph = JSON.parse(fs.readFileSync(path.join(intermediate, "assembled-graph.json"), "utf8"));
const nodeIds = new Set(graph.nodes.map((node) => node.id));
const knownPrefixes = /^(file|config|document|service|pipeline|table|schema|resource|endpoint):/;
const normalizeRef = (value) => {
  if (typeof value === "object" && value) value = value.id;
  if (typeof value !== "string" || value.length === 0) return null;
  return knownPrefixes.test(value) ? value : `file:${value.replaceAll("\\\\", "/")}`;
};

const filePath = path.join(intermediate, `${kind}.json`);
const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
let items = Array.isArray(raw) ? raw : raw[kind === "layers" ? "layers" : "steps"];
if (!Array.isArray(items)) throw new Error(`${kind}.json is not an array or supported envelope`);

if (kind === "layers") {
  const kebab = (name) => String(name || "unnamed")
    .trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "unnamed";
  items = items.map((item) => {
    const refs = item.nodeIds ?? item.nodes ?? [];
    const normalized = [...new Set(refs.map(normalizeRef).filter((id) => id && nodeIds.has(id)))];
    return {
      id: item.id || `layer:${kebab(item.name)}`,
      name: item.name || "未命名层",
      description: item.description || "该层尚无描述。",
      nodeIds: normalized,
    };
  }).filter((item) => item.nodeIds.length > 0);
} else {
  items = items.map((item) => {
    const refs = item.nodeIds ?? item.nodesToInspect ?? [];
    const normalized = [...new Set(refs.map(normalizeRef).filter((id) => id && nodeIds.has(id)))];
    const result = {
      order: Number(item.order),
      title: item.title || "未命名步骤",
      description: item.description || item.whyItMatters || "该步骤尚无描述。",
      nodeIds: normalized,
    };
    if (typeof item.languageLesson === "string") result.languageLesson = item.languageLesson;
    return result;
  }).filter((item) => item.nodeIds.length > 0)
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }));
}

fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");

const duplicates = [];
const seen = new Set();
for (const item of items) {
  for (const id of item.nodeIds) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
}

const result = { kind, count: items.length, refs: [...seen].length, duplicateRefs: duplicates.length };
if (kind === "layers") {
  const fileLevelTypes = new Set(["file", "config", "document", "service", "pipeline", "table", "schema", "resource", "endpoint"]);
  const expected = graph.nodes.filter((node) => fileLevelTypes.has(node.type)).map((node) => node.id);
  const expectedSet = new Set(expected);
  result.expectedFileLevelNodes = expected.length;
  result.missing = expected.filter((id) => !seen.has(id));
  result.extra = [...seen].filter((id) => !expectedSet.has(id));
}
console.log(JSON.stringify(result, null, 2));

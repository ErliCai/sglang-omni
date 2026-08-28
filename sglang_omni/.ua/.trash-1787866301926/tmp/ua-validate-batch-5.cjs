const fs = require("fs");
const path = require("path");

const [graphPath, inputPath, extractPath] = process.argv.slice(2);
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const extract = JSON.parse(fs.readFileSync(extractPath, "utf8"));
const errors = [];
const nodeTypes = new Set(["file", "function", "class", "config", "document", "service", "table", "endpoint", "pipeline", "schema", "resource"]);
const fileLevelTypes = new Set(["file", "config", "document", "service", "pipeline", "schema", "resource"]);
const complexities = new Set(["simple", "moderate", "complex"]);
const edgeWeights = new Map([
  ["contains", 1.0], ["imports", 0.7], ["calls", 0.8],
  ["inherits", 0.9], ["implements", 0.9], ["exports", 0.8],
  ["depends_on", 0.6], ["tested_by", 0.5], ["configures", 0.6],
  ["documents", 0.5], ["deploys", 0.7], ["migrates", 0.7],
  ["triggers", 0.6], ["defines_schema", 0.8], ["serves", 0.7],
  ["provisions", 0.7], ["routes", 0.6], ["related", 0.5],
]);

if (path.basename(graphPath) !== "batch-5.json") errors.push("输出文件名不是 batch-5.json");
if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) errors.push("缺少 nodes 或 edges 数组");

const ids = new Set();
for (const node of graph.nodes || []) {
  if (!node.id || ids.has(node.id)) errors.push(`无效或重复节点: ${node.id}`);
  ids.add(node.id);
  if (!nodeTypes.has(node.type)) errors.push(`非法节点类型: ${node.id}`);
  if (!node.name || !node.summary || !/[\u3400-\u9fff]/u.test(node.summary)) errors.push(`节点缺少中文名称或摘要: ${node.id}`);
  if (!Array.isArray(node.tags) || node.tags.length < 3 || node.tags.length > 5) errors.push(`节点标签数量不合规: ${node.id}`);
  if (!complexities.has(node.complexity)) errors.push(`非法复杂度: ${node.id}`);
  if (fileLevelTypes.has(node.type) && !node.filePath) errors.push(`文件级节点缺少 filePath: ${node.id}`);
  if ((node.type === "function" || node.type === "class") && (!Array.isArray(node.lineRange) || node.lineRange.length !== 2)) errors.push(`函数或类缺少 lineRange: ${node.id}`);
}

for (const batchFile of input.batchFiles) {
  if (!ids.has(`file:${batchFile.path}`)) errors.push(`批次文件缺少节点: ${batchFile.path}`);
}
for (const result of extract.results) {
  const exported = new Set((result.exports || []).map((item) => item.name));
  for (const fn of result.functions || []) {
    if ((fn.endLine - fn.startLine + 1 >= 10 || exported.has(fn.name)) && !ids.has(`function:${result.path}:${fn.name}`)) errors.push(`缺少显著函数节点: ${result.path}:${fn.name}`);
  }
  for (const cls of result.classes || []) {
    if (((cls.methods || []).length >= 2 || cls.endLine - cls.startLine + 1 >= 20 || exported.has(cls.name)) && !ids.has(`class:${result.path}:${cls.name}`)) errors.push(`缺少显著类节点: ${result.path}:${cls.name}`);
  }
}

const edgeKeys = new Set();
for (const edge of graph.edges || []) {
  const key = `${edge.source}|${edge.target}|${edge.type}`;
  if (edgeKeys.has(key)) errors.push(`重复边: ${key}`);
  edgeKeys.add(key);
  if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`悬空边: ${key}`);
  if (edge.source === edge.target) errors.push(`自引用边: ${key}`);
  if (edge.direction !== "forward") errors.push(`边方向错误: ${key}`);
  if (!edgeWeights.has(edge.type)) errors.push(`非法边类型: ${key}`);
  if (edgeWeights.has(edge.type) && edge.weight !== edgeWeights.get(edge.type)) errors.push(`边权重错误: ${key}`);
}

const expectedImports = new Set();
for (const [source, targets] of Object.entries(input.batchImportData)) {
  for (const target of targets) expectedImports.add(`${source}->${target}`);
}
const actualImports = new Set(graph.edges.filter((edge) => edge.type === "imports").map((edge) => `${edge.source.slice(5)}->${edge.target.slice(5)}`));
for (const item of expectedImports) if (!actualImports.has(item)) errors.push(`缺少 import 边: ${item}`);
for (const item of actualImports) if (!expectedImports.has(item)) errors.push(`多余 import 边: ${item}`);
if (graph.nodes.length > 60 || graph.edges.length > 120) errors.push("单文件超过拆分阈值");

const nodeTypeCounts = Object.fromEntries([...nodeTypes].map((type) => [type, graph.nodes.filter((node) => node.type === type).length]).filter(([, count]) => count > 0));
const edgeTypeCounts = Object.fromEntries([...edgeWeights.keys()].map((type) => [type, graph.edges.filter((edge) => edge.type === type).length]).filter(([, count]) => count > 0));
console.log(JSON.stringify({
  valid: errors.length === 0,
  nodes: graph.nodes.length,
  edges: graph.edges.length,
  nodeTypeCounts,
  edgeTypeCounts,
  expectedImports: expectedImports.size,
  actualImports: actualImports.size,
  filesSkipped: extract.filesSkipped,
  errors,
}, null, 2));
if (errors.length) process.exit(1);

const fs = require("fs");
const path = require("path");

const root = process.argv[2];
const index = Number(process.argv[3]);
const ua = path.join(root, ".ua");
const batches = JSON.parse(fs.readFileSync(path.join(ua, "intermediate", "batches.json"), "utf8"));
const batch = batches.batches.find((item) => item.batchIndex === index);
if (!batch) throw new Error(`Batch ${index} not found`);

const matcher = new RegExp(`^batch-${index}(?:-part-(\\d+))?\\.json$`);
const names = fs.readdirSync(path.join(ua, "intermediate")).filter((name) => matcher.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!names.length) throw new Error(`No output files for batch ${index}`);

const nodes = [];
const edges = [];
for (const name of names) {
  const fragment = JSON.parse(fs.readFileSync(path.join(ua, "intermediate", name), "utf8"));
  if (!Array.isArray(fragment.nodes) || !Array.isArray(fragment.edges)) throw new Error(`${name} lacks nodes/edges arrays`);
  nodes.push(...fragment.nodes);
  edges.push(...fragment.edges);
}

const nodeIds = new Set();
const duplicateNodeIds = [];
const invalidNodes = [];
for (const node of nodes) {
  if (!node.id || !node.type || !node.name || !node.summary || !Array.isArray(node.tags) || !node.tags.length || !["simple", "moderate", "complex"].includes(node.complexity)) invalidNodes.push(node.id || "<missing-id>");
  if (nodeIds.has(node.id)) duplicateNodeIds.push(node.id);
  nodeIds.add(node.id);
}

const fileLevelTypes = new Set(["file", "config", "document", "service", "pipeline", "table", "schema", "resource", "endpoint"]);
const represented = new Set(nodes.filter((node) => fileLevelTypes.has(node.type) && node.filePath).map((node) => node.filePath));
const missingFiles = batch.files.map((file) => file.path).filter((filePath) => !represented.has(filePath));
const expectedImports = Object.values(batch.batchImportData || {}).reduce((sum, list) => sum + list.length, 0);
const actualImports = edges.filter((edge) => edge.type === "imports").length;
const invalidEdges = edges.filter((edge) => !edge.source || !edge.target || !edge.type || edge.direction !== "forward" || typeof edge.weight !== "number").length;

process.stdout.write(JSON.stringify({
  batchIndex: index,
  files: names,
  nodeCount: nodes.length,
  edgeCount: edges.length,
  expectedImports,
  actualImports,
  missingFiles,
  duplicateNodeIds,
  invalidNodes,
  invalidEdges,
  valid: missingFiles.length === 0 && duplicateNodeIds.length === 0 && invalidNodes.length === 0 && invalidEdges === 0 && expectedImports === actualImports
}, null, 2));

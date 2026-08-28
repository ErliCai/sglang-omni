import fs from "node:fs";

const base = "sglang_omni/.ua";
const names = ["batch-16-part-1.json", "batch-16-part-2.json"];
const parts = names.map((name) => JSON.parse(fs.readFileSync(`${base}/intermediate/${name}`, "utf8")));
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-16.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-16.json`, "utf8"));

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

const allNodes = parts.flatMap((p) => p.nodes);
const allEdges = parts.flatMap((p) => p.edges);
const ids = new Set(allNodes.map((n) => n.id));
assert(allNodes.length === 117, `节点总数错误: ${allNodes.length}`);
assert(ids.size === allNodes.length, "存在重复节点 ID");
assert(extracted.filesSkipped.length === 0, `提取跳过文件: ${extracted.filesSkipped.join(",")}`);
assert(extracted.results.length === 25, `文件数错误: ${extracted.results.length}`);
assert(input.neighborMap && Object.keys(input.neighborMap).length === 0, "neighborMap 未原样传入");

const allowedTypes = new Set(["file", "document", "function", "class"]);
const allowedComplexity = new Set(["simple", "moderate", "complex"]);
for (const n of allNodes) {
  assert(n.id && n.type && n.name && n.filePath && n.summary, `节点缺少字段: ${JSON.stringify(n)}`);
  assert(allowedTypes.has(n.type), `节点类型错误: ${n.id}`);
  assert(Array.isArray(n.tags) && n.tags.length >= 3 && n.tags.length <= 5, `标签数量错误: ${n.id}`);
  assert(allowedComplexity.has(n.complexity), `复杂度错误: ${n.id}`);
  assert(/[\u3400-\u9fff]/u.test(n.summary), `摘要不是中文: ${n.id}`);
  if (n.type === "function" || n.type === "class") {
    assert(Array.isArray(n.lineRange) && n.lineRange.length === 2 && n.lineRange[0] <= n.lineRange[1], `行号错误: ${n.id}`);
  }
}

const expectedSymbols = [];
for (const r of extracted.results) {
  const fileType = r.fileCategory === "code" ? "file" : "document";
  const fileId = `${fileType}:${r.path}`;
  assert(ids.has(fileId), `缺少文件节点: ${fileId}`);
  for (const [kind, items] of [["function", r.functions || []], ["class", r.classes || []]]) {
    for (const item of items) {
      const id = `${kind}:${r.path}:${item.name}`;
      expectedSymbols.push({ fileId, id, lineRange: [item.startLine, item.endLine] });
      assert(ids.has(id), `缺少符号节点: ${id}`);
      const node = allNodes.find((n) => n.id === id);
      assert(node.lineRange[0] === item.startLine && node.lineRange[1] === item.endLine, `符号行号不一致: ${id}`);
    }
  }
}
assert(expectedSymbols.length === 92, `符号数错误: ${expectedSymbols.length}`);

const allowedEdge = {
  contains: 1,
  imports: 0.7,
  calls: 0.8,
  exports: 0.8,
  depends_on: 0.6
};
const edgeKeys = new Set();
for (const e of allEdges) {
  assert(ids.has(e.source), `边源不存在: ${e.source}`);
  assert(ids.has(e.target), `边目标不存在: ${e.target}`);
  assert(e.source !== e.target, `自环: ${e.source}`);
  assert(e.direction === "forward", `边方向错误: ${e.source}`);
  assert(allowedEdge[e.type] === e.weight, `边权重错误: ${e.type} ${e.weight}`);
  const key = `${e.source}|${e.target}|${e.type}`;
  assert(!edgeKeys.has(key), `重复边: ${key}`);
  edgeKeys.add(key);
}

for (const { fileId, id } of expectedSymbols) {
  assert(edgeKeys.has(`${fileId}|${id}|contains`), `缺少 contains: ${id}`);
  assert(edgeKeys.has(`${fileId}|${id}|exports`), `缺少 exports: ${id}`);
}

const actualImports = allEdges
  .filter((e) => e.type === "imports")
  .map((e) => `${e.source}|${e.target}`)
  .sort();
const expectedImports = Object.entries(input.batchImportData)
  .flatMap(([source, targets]) => targets.map((target) => `file:${source}|file:${target}`))
  .sort();
assert(JSON.stringify(actualImports) === JSON.stringify(expectedImports), `导入边不一致: ${JSON.stringify(actualImports)}`);

const paths = extracted.results.map((r) => r.path).sort();
const chunk = Math.ceil(paths.length / 2);
const expectedChunks = [new Set(paths.slice(0, chunk)), new Set(paths.slice(chunk))];
for (let i = 0; i < parts.length; i++) {
  const localIds = new Set(parts[i].nodes.map((n) => n.id));
  assert(parts[i].nodes.every((n) => expectedChunks[i].has(n.filePath)), `分片 ${i + 1} 包含错误文件`);
  assert(parts[i].edges.every((e) => localIds.has(e.source)), `分片 ${i + 1} 包含非本地源边`);
}

const calculatedParts = Math.ceil(Math.max(allNodes.length / 60, allEdges.length / 120));
assert(calculatedParts === 2, `分片数计算错误: ${calculatedParts}`);
assert(allEdges.length === 210, `边总数错误: ${allEdges.length}`);

console.log(JSON.stringify({
  valid: true,
  files: extracted.results.length,
  nodes: allNodes.length,
  edges: allEdges.length,
  imports: actualImports.length,
  skipped: extracted.filesSkipped.length,
  partNodes: parts.map((p) => p.nodes.length),
  partEdges: parts.map((p) => p.edges.length)
}));

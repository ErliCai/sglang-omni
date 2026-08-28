import fs from "node:fs";

const base = "sglang_omni/.ua";
const names = [1, 2, 3, 4, 5].map((i) => `batch-24-part-${i}.json`);
const actualNames = fs.readdirSync(`${base}/intermediate`).filter((name) => name.startsWith("batch-24")).sort();
const parts = names.map((name) => JSON.parse(fs.readFileSync(`${base}/intermediate/${name}`, "utf8")));
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-24.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-24.json`, "utf8"));
const raw = JSON.parse(fs.readFileSync(`${base}/intermediate/batches.json`, "utf8"));
const batch = (Array.isArray(raw) ? raw : raw.batches).find((x) => x.batchIndex === 24);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

assert(JSON.stringify(actualNames) === JSON.stringify(names), `输出文件名不精确: ${JSON.stringify(actualNames)}`);
assert(JSON.stringify(input.batchFiles) === JSON.stringify(batch.files), "batchFiles 未原样传入");
assert(JSON.stringify(input.batchImportData) === JSON.stringify(batch.batchImportData), "batchImportData 未原样传入");
assert(JSON.stringify(input.neighborMap) === JSON.stringify(batch.neighborMap), "neighborMap 未原样传入");
assert(extracted.scriptCompleted === true, "结构提取未完成");
assert(extracted.filesSkipped.length === 0, `存在跳过文件: ${extracted.filesSkipped.join(",")}`);
assert(extracted.results.length === 25, `文件数错误: ${extracted.results.length}`);

const nodes = parts.flatMap((p) => p.nodes), edges = parts.flatMap((p) => p.edges), ids = new Set(nodes.map((n) => n.id));
assert(nodes.length === 247, `节点总数错误: ${nodes.length}`);
assert(ids.size === nodes.length, "存在重复节点 ID");
assert(edges.length === 540, `边总数错误: ${edges.length}`);

const nodeTypes = new Set(["file", "document", "function", "class"]), complexities = new Set(["simple", "moderate", "complex"]);
for (const n of nodes) {
  assert(n.id && n.type && n.name && n.filePath && n.summary, `节点缺少必填字段: ${JSON.stringify(n)}`);
  assert(nodeTypes.has(n.type), `节点类型错误: ${n.id}`);
  assert(Array.isArray(n.tags) && n.tags.length >= 3 && n.tags.length <= 5, `标签数量错误: ${n.id}`);
  assert(complexities.has(n.complexity), `复杂度错误: ${n.id}`);
  assert(/[\u3400-\u9fff]/u.test(n.summary), `摘要不是中文: ${n.id}`);
  if (n.type === "function" || n.type === "class") assert(Array.isArray(n.lineRange) && n.lineRange.length === 2 && n.lineRange[0] <= n.lineRange[1], `行号错误: ${n.id}`);
}

const expectedSymbols = [];
for (const result of extracted.results) {
  const fileType = result.fileCategory === "code" ? "file" : "document", fileId = `${fileType}:${result.path}`;
  assert(ids.has(fileId), `缺少文件节点: ${fileId}`);
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) {
    for (const item of list) {
      const sid = `${kind}:${result.path}:${item.name}`;
      expectedSymbols.push([fileId, sid]);
      assert(ids.has(sid), `缺少符号节点: ${sid}`);
      const node = nodes.find((n) => n.id === sid);
      assert(node.lineRange[0] === item.startLine && node.lineRange[1] === item.endLine, `行范围不一致: ${sid}`);
    }
  }
}
assert(expectedSymbols.length === 222, `结构符号数错误: ${expectedSymbols.length}`);

const weights = { contains: 1, imports: 0.7, calls: 0.8, exports: 0.8, depends_on: 0.6 }, edgeKeys = new Set();
for (const e of edges) {
  assert(ids.has(e.source), `边源不存在: ${e.source}`);
  assert(ids.has(e.target), `边目标不存在: ${e.target}`);
  assert(e.source !== e.target, `存在自环: ${e.source}`);
  assert(e.direction === "forward", `边方向错误: ${e.source}`);
  assert(weights[e.type] === e.weight, `边类型或权重错误: ${e.type}/${e.weight}`);
  const key = `${e.source}|${e.target}|${e.type}`;
  assert(!edgeKeys.has(key), `重复边: ${key}`);
  edgeKeys.add(key);
}
for (const [fileId, sid] of expectedSymbols) {
  assert(edgeKeys.has(`${fileId}|${sid}|contains`), `缺少 contains 边: ${sid}`);
  assert(edgeKeys.has(`${fileId}|${sid}|exports`), `缺少 exports 边: ${sid}`);
}

const actualImports = edges.filter((e) => e.type === "imports").map((e) => `${e.source}|${e.target}`).sort();
const expectedImports = Object.entries(input.batchImportData).flatMap(([source, targets]) => targets.map((target) => `file:${source}|file:${target}`)).sort();
assert(JSON.stringify(actualImports) === JSON.stringify(expectedImports), `导入边不一致: ${JSON.stringify(actualImports)}`);
assert(actualImports.length === 1, `导入边应为 1，实际 ${actualImports.length}`);

const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
assert(partCount === 5, `分片数计算错误: ${partCount}`);
const paths = extracted.results.map((r) => r.path).sort(), chunkSize = Math.ceil(paths.length / partCount);
for (let i = 0; i < parts.length; i++) {
  const expectedPaths = new Set(paths.slice(i * chunkSize, (i + 1) * chunkSize)), localIds = new Set(parts[i].nodes.map((n) => n.id));
  assert(parts[i].nodes.every((n) => expectedPaths.has(n.filePath)), `分片 ${i + 1} 文件归属错误`);
  assert(parts[i].edges.every((e) => localIds.has(e.source)), `分片 ${i + 1} 存在非本地源边`);
}

console.log(JSON.stringify({ valid: true, files: extracted.results.length, nodes: nodes.length, edges: edges.length, imports: actualImports.length, skipped: extracted.filesSkipped.length, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

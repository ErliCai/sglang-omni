const fs = require("fs");
const path = require("path");

function fail(message) {
  process.stderr.write(String(message) + "\n");
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail("无法读取或解析输入 JSON：" + error.message);
  }
}

function rank(nodes, counts, field) {
  return nodes
    .map((node) => ({
      id: node.id,
      [field]: counts.get(node.id) || 0,
      name: node.name,
      summary: node.summary,
    }))
    .sort((a, b) => b[field] - a[field] || a.id.localeCompare(b.id))
    .slice(0, 20);
}

function isRootOrOneLevel(filePath) {
  return filePath.split("/").filter(Boolean).length <= 2;
}

function codeEntryName(filePath) {
  const base = path.posix.basename(filePath);
  const exact = new Set([
    "index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js",
    "server.ts", "server.js", "mod.rs", "main.go", "main.py", "main.rs",
    "manage.py", "app.py", "wsgi.py", "asgi.py", "run.py", "__main__.py",
    "Application.java", "Main.java", "Program.cs", "config.ru", "index.php",
    "App.swift", "Application.kt", "main.cpp", "main.c",
  ]);
  return exact.has(base);
}

function pairKey(a, b) {
  return a < b ? a + "\u0000" + b : b + "\u0000" + a;
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) fail("用法：node ua-tour-analyze.js <input.json> <output.json>");
  const input = readJson(inputPath);
  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  const edges = Array.isArray(input.edges) ? input.edges : [];
  const layers = Array.isArray(input.layers) ? input.layers : [];
  if (!nodes.length) fail("输入不包含文件级节点");
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  if (nodeById.size !== nodes.length) fail("节点 ID 不唯一");

  const knownEdges = edges.filter(
    (edge) => nodeById.has(edge.source) && nodeById.has(edge.target)
  );
  const fanIn = new Map(nodes.map((node) => [node.id, 0]));
  const fanOut = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of knownEdges) {
    fanOut.set(edge.source, fanOut.get(edge.source) + 1);
    fanIn.set(edge.target, fanIn.get(edge.target) + 1);
  }

  const fanInRanking = rank(nodes, fanIn, "fanIn");
  const fanOutRanking = rank(nodes, fanOut, "fanOut");
  const fanOutOrder = [...nodes]
    .sort((a, b) => (fanOut.get(b.id) || 0) - (fanOut.get(a.id) || 0) || a.id.localeCompare(b.id));
  const topFanOutIds = new Set(
    fanOutOrder
      .slice(0, Math.max(1, Math.ceil(nodes.length * 0.1)))
      .filter((node) => (fanOut.get(node.id) || 0) > 0)
      .map((node) => node.id)
  );
  const fanInValues = nodes.map((node) => fanIn.get(node.id) || 0).sort((a, b) => a - b);
  const lowFanInThreshold = fanInValues[Math.max(0, Math.ceil(nodes.length * 0.25) - 1)] || 0;

  const entryPointCandidates = [];
  for (const node of nodes) {
    let score = 0;
    if (node.type === "file") {
      if (codeEntryName(node.filePath)) score += 3;
      if (isRootOrOneLevel(node.filePath)) score += 1;
      if (topFanOutIds.has(node.id)) score += 1;
      if ((fanIn.get(node.id) || 0) <= lowFanInThreshold) score += 1;
    } else if (node.type === "document") {
      const lower = node.filePath.toLowerCase();
      if (lower === "readme.md") score += 5;
      else if (!lower.includes("/") && lower.endsWith(".md")) score += 2;
    }
    if (score > 0) {
      entryPointCandidates.push({
        id: node.id,
        score,
        name: node.name,
        summary: node.summary,
        type: node.type,
        filePath: node.filePath,
        fanIn: fanIn.get(node.id) || 0,
        fanOut: fanOut.get(node.id) || 0,
      });
    }
  }
  entryPointCandidates.sort((a, b) =>
    b.score - a.score ||
    b.fanOut - a.fanOut ||
    a.filePath.localeCompare(b.filePath)
  );
  const topEntryPointCandidates = entryPointCandidates.slice(0, 5);

  const startCandidate = entryPointCandidates.find(
    (candidate) => candidate.type === "file"
  );
  const traversalEdges = knownEdges.filter(
    (edge) => edge.type === "imports" || edge.type === "calls"
  );
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of traversalEdges) adjacency.get(edge.source).push(edge.target);
  for (const values of adjacency.values()) values.sort();

  const bfsTraversal = {
    startNode: startCandidate ? startCandidate.id : null,
    order: [],
    depthMap: {},
    byDepth: {},
  };
  if (startCandidate) {
    const queue = [startCandidate.id];
    bfsTraversal.depthMap[startCandidate.id] = 0;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      const depth = bfsTraversal.depthMap[current];
      bfsTraversal.order.push(current);
      const depthKey = String(depth);
      if (!bfsTraversal.byDepth[depthKey]) bfsTraversal.byDepth[depthKey] = [];
      bfsTraversal.byDepth[depthKey].push(current);
      for (const target of adjacency.get(current) || []) {
        if (Object.prototype.hasOwnProperty.call(bfsTraversal.depthMap, target)) continue;
        bfsTraversal.depthMap[target] = depth + 1;
        queue.push(target);
      }
    }
  }

  const nonCodeFiles = {
    documentation: [],
    infrastructure: [],
    data: [],
    config: [],
  };
  for (const node of nodes) {
    const item = {
      id: node.id,
      name: node.name,
      type: node.type,
      summary: node.summary,
      filePath: node.filePath,
    };
    if (node.type === "document") nonCodeFiles.documentation.push(item);
    else if (["service", "pipeline", "resource"].includes(node.type)) {
      nonCodeFiles.infrastructure.push(item);
    } else if (["table", "schema", "endpoint"].includes(node.type)) {
      nonCodeFiles.data.push(item);
    } else if (node.type === "config") nonCodeFiles.config.push(item);
  }
  for (const values of Object.values(nonCodeFiles)) {
    values.sort((a, b) => a.filePath.localeCompare(b.filePath));
  }

  const directed = new Map();
  for (const edge of traversalEdges) {
    const key = edge.source + "\u0000" + edge.target;
    directed.set(key, (directed.get(key) || 0) + 1);
  }
  const mutualPairs = [];
  const seenPair = new Set();
  for (const [key, count] of directed.entries()) {
    const [source, target] = key.split("\u0000");
    if (!directed.has(target + "\u0000" + source)) continue;
    const pair = pairKey(source, target);
    if (seenPair.has(pair)) continue;
    seenPair.add(pair);
    mutualPairs.push({
      nodes: [source, target].sort(),
      edgeCount: count + directed.get(target + "\u0000" + source),
    });
  }

  const neighborSets = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of traversalEdges) {
    neighborSets.get(edge.source).add(edge.target);
    neighborSets.get(edge.target).add(edge.source);
  }
  const clusters = [];
  for (const seed of mutualPairs) {
    const cluster = new Set(seed.nodes);
    let expanded = true;
    while (expanded && cluster.size < 5) {
      expanded = false;
      const candidates = nodes
        .filter((node) => !cluster.has(node.id))
        .map((node) => ({
          id: node.id,
          links: [...cluster].filter((member) => neighborSets.get(node.id).has(member)).length,
        }))
        .filter((item) => item.links >= 2)
        .sort((a, b) => b.links - a.links || a.id.localeCompare(b.id));
      if (candidates.length) {
        cluster.add(candidates[0].id);
        expanded = true;
      }
    }
    let edgeCount = 0;
    for (const edge of traversalEdges) {
      if (cluster.has(edge.source) && cluster.has(edge.target)) edgeCount += 1;
    }
    clusters.push({ nodes: [...cluster].sort(), edgeCount });
  }
  const uniqueClusters = new Map();
  for (const cluster of clusters) {
    const key = cluster.nodes.join("\u0000");
    const previous = uniqueClusters.get(key);
    if (!previous || previous.edgeCount < cluster.edgeCount) uniqueClusters.set(key, cluster);
  }
  const topClusters = [...uniqueClusters.values()]
    .sort((a, b) => b.edgeCount - a.edgeCount || b.nodes.length - a.nodes.length)
    .slice(0, 10);

  const nodeSummaryIndex = {};
  for (const node of nodes) {
    nodeSummaryIndex[node.id] = {
      name: node.name,
      type: node.type,
      summary: node.summary,
      filePath: node.filePath,
    };
  }

  const result = {
    scriptCompleted: true,
    entryPointCandidates: topEntryPointCandidates,
    allScoredEntryPoints: entryPointCandidates,
    fanInRanking,
    fanOutRanking,
    bfsTraversal,
    nonCodeFiles,
    clusters: topClusters,
    layers: {
      count: layers.length,
      list: layers.map(({ id, name, description }) => ({ id, name, description })),
    },
    nodeSummaryIndex,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    knownFileLevelEdges: knownEdges.length,
    ignoredSubFileEdges: edges.length - knownEdges.length,
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  } catch (error) {
    fail("无法写入拓扑结果：" + error.message);
  }
}

main();

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

function commonPrefixSegments(paths) {
  if (!paths.length) return [];
  const split = paths.map((p) => p.split("/").filter(Boolean));
  const prefix = [];
  for (let i = 0; i < split[0].length - 1; i += 1) {
    const segment = split[0][i];
    if (split.every((parts) => parts[i] === segment)) prefix.push(segment);
    else break;
  }
  return prefix;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function objectFromSortedMap(map) {
  return Object.fromEntries(
    [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [
        key,
        value instanceof Set ? [...value].sort() : value,
      ])
  );
}

function directoryPattern(group) {
  const key = group.toLowerCase();
  const groups = [
    [["routes", "api", "controllers", "endpoints", "handlers", "controller", "routers", "blueprints", "serializers"], "api"],
    [["services", "core", "lib", "domain", "logic", "internal", "signals", "mailers", "jobs", "channels", "composables"], "service"],
    [["models", "db", "data", "persistence", "repository", "entities", "entity", "migrations", "sql", "database", "schema"], "data"],
    [["components", "views", "pages", "ui", "layouts", "screens"], "ui"],
    [["middleware", "plugins", "interceptors", "guards"], "middleware"],
    [["utils", "helpers", "common", "shared", "tools", "pkg", "templatetags"], "utility"],
    [["config", "constants", "env", "settings", "management", "commands"], "config"],
    [["__tests__", "test", "tests", "spec", "specs"], "test"],
    [["types", "interfaces", "schemas", "contracts", "dtos", "dto", "request", "response"], "types"],
    [["hooks"], "hooks"],
    [["store", "state", "reducers", "actions", "slices"], "state"],
    [["assets", "static", "public"], "assets"],
    [["cmd", "bin"], "entry"],
    [["docs", "documentation", "wiki"], "documentation"],
    [["deploy", "deployment", "infra", "infrastructure", "k8s", "kubernetes", "helm", "charts", "terraform", "tf", "docker"], "infrastructure"],
    [[".github", ".gitlab", ".circleci"], "ci-cd"],
  ];
  for (const [names, label] of groups) {
    if (names.includes(key)) return label;
  }
  return "unclassified";
}

function filePattern(filePath, nodeType) {
  const lower = filePath.toLowerCase();
  const base = path.posix.basename(lower);
  if (
    /(^|\/)test_[^/]+\.py$/.test(lower) ||
    /(^|\/)[^/]+_test\.go$/.test(lower) ||
    /\.[^.\/]+\.(test|spec)\.[^.\/]+$/.test(lower) ||
    /(^|\/)(tests?|specs?)\//.test(lower)
  ) return "test";
  if (lower.endsWith(".d.ts")) return "types";
  if (["index.ts", "index.js", "__init__.py"].includes(base)) return "entry";
  if (base === "manage.py") return "entry";
  if (["wsgi.py", "asgi.py"].includes(base)) return "config";
  if (/^cmd\/[^/]+\/main\.go$/.test(lower)) return "entry";
  if (["src/main.rs", "src/lib.rs"].includes(lower)) return "entry";
  if (["application.java", "program.cs", "config.ru"].includes(base)) return "entry";
  if (["cargo.toml", "go.mod", "gemfile", "pom.xml", "build.gradle", "composer.json"].includes(base)) return "config";
  if (base === "dockerfile" || base.startsWith("dockerfile.") || base.startsWith("docker-compose.")) return "infrastructure";
  if (lower.endsWith(".tf") || lower.endsWith(".tfvars")) return "infrastructure";
  if (/^\.github\/workflows\//.test(lower) || base === ".gitlab-ci.yml" || base === "jenkinsfile") return "ci-cd";
  if (lower.endsWith(".sql")) return "data";
  if (/\.(graphql|gql|proto)$/.test(lower)) return "types";
  if (/\.(md|rst)$/.test(lower)) return "documentation";
  if (base === "makefile") return "infrastructure";
  if (nodeType === "config") return "config";
  if (nodeType === "document") return "documentation";
  if (nodeType === "service" || nodeType === "resource") return "infrastructure";
  if (nodeType === "pipeline") return "ci-cd";
  if (["table", "schema", "endpoint"].includes(nodeType)) return "data";
  return "unclassified";
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) fail("用法：node ua-arch-analyze.js <input.json> <output.json>");
  const input = readJson(inputPath);
  const fileNodes = Array.isArray(input.fileNodes) ? input.fileNodes : [];
  const importEdges = Array.isArray(input.importEdges) ? input.importEdges : [];
  const allEdges = Array.isArray(input.allEdges) ? input.allEdges : [];
  if (!fileNodes.length) fail("输入不包含文件级节点");

  const nodeById = new Map(fileNodes.map((node) => [node.id, node]));
  if (nodeById.size !== fileNodes.length) fail("文件级节点 ID 不唯一");
  const prefixSegments = commonPrefixSegments(fileNodes.map((node) => node.filePath));
  const directoryGroups = new Map();
  const groupById = new Map();
  const secondLevelGroups = new Map();
  const nodeTypeGroups = new Map();
  const filePatternMatches = new Map();

  for (const node of fileNodes) {
    const parts = node.filePath.split("/").filter(Boolean);
    const rest = parts.slice(prefixSegments.length);
    const group = rest.length > 1 ? rest[0] : "root";
    if (!directoryGroups.has(group)) directoryGroups.set(group, []);
    directoryGroups.get(group).push(node.id);
    groupById.set(node.id, group);

    const second =
      rest.length > 2 ? group + "/" + rest[1] :
      rest.length > 1 ? group + "/root" :
      "root";
    if (!secondLevelGroups.has(second)) secondLevelGroups.set(second, []);
    secondLevelGroups.get(second).push(node.id);

    if (!nodeTypeGroups.has(node.type)) nodeTypeGroups.set(node.type, []);
    nodeTypeGroups.get(node.type).push(node.id);
    filePatternMatches.set(node.id, filePattern(node.filePath, node.type));
  }
  for (const values of directoryGroups.values()) values.sort();
  for (const values of secondLevelGroups.values()) values.sort();
  for (const values of nodeTypeGroups.values()) values.sort();

  const adjacency = new Map(fileNodes.map((node) => [node.id, new Set()]));
  const reverseAdjacency = new Map(fileNodes.map((node) => [node.id, new Set()]));
  const pairCounts = new Map();
  const internalCounts = new Map();
  const involvingCounts = new Map();
  const importsFromGroups = new Map();
  const importedByGroups = new Map();

  for (const group of directoryGroups.keys()) {
    internalCounts.set(group, 0);
    involvingCounts.set(group, 0);
    importsFromGroups.set(group, new Set());
    importedByGroups.set(group, new Set());
  }

  for (const edge of importEdges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) continue;
    adjacency.get(edge.source).add(edge.target);
    reverseAdjacency.get(edge.target).add(edge.source);
    const from = groupById.get(edge.source);
    const to = groupById.get(edge.target);
    increment(involvingCounts, from);
    if (to !== from) increment(involvingCounts, to);
    if (from === to) {
      increment(internalCounts, from);
    } else {
      increment(pairCounts, from + "\u0000" + to);
      importsFromGroups.get(from).add(to);
      importedByGroups.get(to).add(from);
    }
  }

  const crossCategoryCounts = new Map();
  const nonCodeConnections = [];
  for (const edge of allEdges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    if (source.type !== target.type) {
      increment(crossCategoryCounts, source.type + "\u0000" + target.type + "\u0000" + edge.type);
    }
    if (source.type !== "file" || target.type !== "file") {
      nonCodeConnections.push({
        source: edge.source,
        target: edge.target,
        edgeType: edge.type,
      });
    }
  }

  const crossCategoryEdges = [...crossCategoryCounts.entries()]
    .map(([key, count]) => {
      const [fromType, toType, edgeType] = key.split("\u0000");
      return { fromType, toType, edgeType, count };
    })
    .sort((a, b) =>
      a.fromType.localeCompare(b.fromType) ||
      a.toType.localeCompare(b.toType) ||
      a.edgeType.localeCompare(b.edgeType)
    );

  const interGroupImports = [...pairCounts.entries()]
    .map(([key, count]) => {
      const [from, to] = key.split("\u0000");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  const intraGroupDensity = {};
  for (const group of [...directoryGroups.keys()].sort()) {
    const internalEdges = internalCounts.get(group) || 0;
    const totalEdges = involvingCounts.get(group) || 0;
    intraGroupDensity[group] = {
      internalEdges,
      totalEdges,
      density: totalEdges ? Number((internalEdges / totalEdges).toFixed(4)) : 0,
    };
  }

  const dependencyDirection = [];
  const seenPairs = new Set();
  for (const item of interGroupImports) {
    const pair = [item.from, item.to].sort().join("\u0000");
    if (seenPairs.has(pair)) continue;
    seenPairs.add(pair);
    const forward = pairCounts.get(item.from + "\u0000" + item.to) || 0;
    const reverse = pairCounts.get(item.to + "\u0000" + item.from) || 0;
    if (forward > reverse) {
      dependencyDirection.push({ dependent: item.from, dependsOn: item.to, forward, reverse });
    } else if (reverse > forward) {
      dependencyDirection.push({ dependent: item.to, dependsOn: item.from, forward: reverse, reverse: forward });
    } else if (forward > 0) {
      dependencyDirection.push({ dependent: item.from, dependsOn: item.to, forward, reverse, balanced: true });
    }
  }
  dependencyDirection.sort((a, b) => b.forward - a.forward || a.dependent.localeCompare(b.dependent));

  const paths = fileNodes.map((node) => node.filePath);
  const lowerPaths = paths.map((p) => p.toLowerCase());
  const infraFiles = paths.filter((filePath, index) => {
    const lower = lowerPaths[index];
    return (
      path.posix.basename(lower) === "dockerfile" ||
      path.posix.basename(lower).startsWith("dockerfile.") ||
      path.posix.basename(lower).startsWith("docker-compose.") ||
      lower.endsWith(".tf") ||
      lower.endsWith(".tfvars") ||
      /(^|\/)(k8s|kubernetes|helm|charts|terraform|infra|infrastructure|docker)(\/|$)/.test(lower) ||
      /^\.github\/workflows\//.test(lower) ||
      path.posix.basename(lower) === ".gitlab-ci.yml" ||
      path.posix.basename(lower) === "jenkinsfile"
    );
  }).sort();
  const deploymentTopology = {
    hasDockerfile: lowerPaths.some((p) => path.posix.basename(p) === "dockerfile" || path.posix.basename(p).startsWith("dockerfile.")),
    hasCompose: lowerPaths.some((p) => path.posix.basename(p).startsWith("docker-compose.")),
    hasK8s: lowerPaths.some((p) => /(^|\/)(k8s|kubernetes|helm|charts)(\/|$)/.test(p)),
    hasTerraform: lowerPaths.some((p) => p.endsWith(".tf") || p.endsWith(".tfvars") || /(^|\/)terraform(\/|$)/.test(p)),
    hasCI: lowerPaths.some((p) => /^\.github\/workflows\//.test(p) || path.posix.basename(p) === ".gitlab-ci.yml" || path.posix.basename(p) === "jenkinsfile"),
    infraFiles,
  };

  const dataPipeline = {
    schemaFiles: fileNodes.filter((node) =>
      ["schema", "table", "endpoint"].includes(node.type) ||
      /\.(sql|graphql|gql|proto|prisma)$/i.test(node.filePath)
    ).map((node) => node.filePath).sort(),
    migrationFiles: paths.filter((p) => /(^|\/)migrations?(\/|$)/i.test(p)).sort(),
    dataModelFiles: paths.filter((p) => /(^|\/)(models?|entities|repository|data)(\/|$)/i.test(p)).sort(),
    apiHandlerFiles: paths.filter((p) => /(^|\/)(api|routes|routers|controllers|endpoints|handlers)(\/|$)/i.test(p)).sort(),
  };

  const docGroups = new Set();
  for (const node of fileNodes) {
    if (node.type === "document" || /\.(md|rst)$/i.test(node.filePath)) {
      docGroups.add(groupById.get(node.id));
    }
  }
  const groupNames = [...directoryGroups.keys()].sort();
  const docCoverage = {
    groupsWithDocs: docGroups.size,
    totalGroups: groupNames.length,
    coverageRatio: Number((docGroups.size / groupNames.length).toFixed(4)),
    undocumentedGroups: groupNames.filter((group) => !docGroups.has(group)),
  };

  const groupDependencies = {};
  for (const group of groupNames) {
    groupDependencies[group] = {
      importsFrom: [...importsFromGroups.get(group)].sort(),
      importedBy: [...importedByGroups.get(group)].sort(),
    };
  }

  const fileFanIn = {};
  const fileFanOut = {};
  for (const node of fileNodes) {
    fileFanIn[node.id] = reverseAdjacency.get(node.id).size;
    fileFanOut[node.id] = adjacency.get(node.id).size;
  }

  const result = {
    scriptCompleted: true,
    commonPathPrefix: prefixSegments.length ? prefixSegments.join("/") + "/" : "",
    directoryGroups: objectFromSortedMap(directoryGroups),
    secondLevelGroups: objectFromSortedMap(secondLevelGroups),
    nodeTypeGroups: objectFromSortedMap(nodeTypeGroups),
    crossCategoryEdges,
    nonCodeConnections,
    interGroupImports,
    intraGroupDensity,
    patternMatches: Object.fromEntries(groupNames.map((group) => [group, directoryPattern(group)])),
    filePatternMatches: objectFromSortedMap(filePatternMatches),
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection,
    groupDependencies,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup: Object.fromEntries(groupNames.map((group) => [group, directoryGroups.get(group).length])),
      nodeTypeCounts: Object.fromEntries(
        [...nodeTypeGroups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([type, values]) => [type, values.length])
      ),
      importEdgeCount: importEdges.length,
      fileLevelEdgeCount: allEdges.length,
    },
    fileFanIn,
    fileFanOut,
    fileMetadata: Object.fromEntries(
      fileNodes.map((node) => [node.id, {
        id: node.id,
        type: node.type,
        name: node.name,
        filePath: node.filePath,
        summary: node.summary,
        tags: node.tags,
      }])
    ),
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  } catch (error) {
    fail("无法写入结果 JSON：" + error.message);
  }
}

main();

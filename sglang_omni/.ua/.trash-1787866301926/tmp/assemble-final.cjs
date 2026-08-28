#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const [root, gitCommitHash] = process.argv.slice(2);
if (!root || !gitCommitHash) {
  console.error("usage: assemble-final.cjs <project-root> <git-commit-hash>");
  process.exit(2);
}

const intermediate = path.join(root, ".ua", "intermediate");
const graphPath = path.join(intermediate, "assembled-graph.json");
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const scan = JSON.parse(fs.readFileSync(path.join(intermediate, "scan-result.json"), "utf8"));
const layers = JSON.parse(fs.readFileSync(path.join(intermediate, "layers.json"), "utf8"));
const tour = JSON.parse(fs.readFileSync(path.join(intermediate, "tour.json"), "utf8"));

const assembled = {
  version: "1.0.0",
  project: {
    name: scan.name,
    languages: scan.languages,
    frameworks: scan.frameworks,
    description: scan.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash,
  },
  nodes: graph.nodes,
  edges: graph.edges,
  layers,
  tour,
};

fs.writeFileSync(graphPath, `${JSON.stringify(assembled, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  path: graphPath,
  nodes: assembled.nodes.length,
  edges: assembled.edges.length,
  layers: assembled.layers.length,
  tour: assembled.tour.length,
}, null, 2));

import fs from "node:fs";
import path from "node:path";

const [projectRoot, scanPath, outputPath] = process.argv.slice(2);
const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));

fs.writeFileSync(
  outputPath,
  JSON.stringify({ projectRoot: path.resolve(projectRoot), files: scan.files }, null, 2),
  "utf8",
);

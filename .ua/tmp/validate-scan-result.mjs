import fs from "node:fs";

const [scanPath, importPath, outputPath] = process.argv.slice(2);
const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));
const imports = JSON.parse(fs.readFileSync(importPath, "utf8"));
const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const forbidden = ["scriptCompleted", "stats", "rawDescription", "readmeHead"].filter(
  (key) => Object.hasOwn(output, key),
);
const checks = {
  filesEqual: JSON.stringify(output.files) === JSON.stringify(scan.files),
  importMapEqual: JSON.stringify(output.importMap) === JSON.stringify(imports.importMap),
  totalMatches: output.totalFiles === output.files.length,
  importEntries: Object.keys(output.importMap).length,
  forbidden,
  frameworks: output.frameworks,
  languages: output.languages,
};

console.log(JSON.stringify(checks, null, 2));
if (
  !checks.filesEqual ||
  !checks.importMapEqual ||
  !checks.totalMatches ||
  checks.importEntries !== output.totalFiles ||
  forbidden.length > 0
) {
  process.exit(1);
}

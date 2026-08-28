const fs = require("fs");
const p = process.argv[2];
try {
  const s = JSON.parse(fs.readFileSync(p, "utf8"));
  const categories = {};
  for (const f of s.files) {
    categories[f.fileCategory] = (categories[f.fileCategory] || 0) + 1;
  }
  process.stdout.write(JSON.stringify({
    valid: true,
    name: s.name,
    description: s.description,
    totalFiles: s.totalFiles,
    actualFiles: s.files.length,
    filteredByIgnore: s.filteredByIgnore,
    complexity: s.estimatedComplexity,
    languages: s.languages,
    frameworks: s.frameworks,
    importMapEntries: Object.keys(s.importMap || {}).length,
    categories,
    bytes: fs.statSync(p).size
  }, null, 2));
} catch (error) {
  process.stderr.write(error.stack + "\n");
  process.exit(1);
}

const fs = require("fs");
const path = require("path");

const uaDir = path.resolve(__dirname, "..");
const scan = JSON.parse(
  fs.readFileSync(path.join(uaDir, "tmp", "ua-scan-files.json"), "utf8"),
);
const imports = JSON.parse(
  fs.readFileSync(path.join(uaDir, "tmp", "ua-import-map-output.json"), "utf8"),
);

const result = {
  name: "sglang-omni",
  description:
    "SGLang-Omni 是面向 omni models 的多阶段流水线框架，为多模态与语音 serving 提供开放基础设施。注意：项目包含超过 100 个源文件；若需更快结果，可考虑进一步限定分析到子目录。",
  languages: Object.keys(scan.stats.byLanguage).sort(),
  frameworks: [
    "FastAPI",
    "Pydantic",
    "PyTest",
    "PyTorch",
    "SGLang",
    "Transformers",
    "Uvicorn",
  ],
  files: scan.files,
  totalFiles: scan.totalFiles,
  filteredByIgnore: scan.filteredByIgnore,
  estimatedComplexity: scan.estimatedComplexity,
  importMap: imports.importMap,
};

fs.writeFileSync(
  path.join(uaDir, "intermediate", "scan-result.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

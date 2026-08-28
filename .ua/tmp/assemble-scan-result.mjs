import fs from "node:fs";
import path from "node:path";

const [scanPath, importPath, outputPath] = process.argv.slice(2);
const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));
const imports = JSON.parse(fs.readFileSync(importPath, "utf8"));

if (scan.totalFiles !== scan.files.length) {
  throw new Error(`totalFiles (${scan.totalFiles}) 与 files.length (${scan.files.length}) 不一致`);
}

if (Object.keys(imports.importMap).length !== scan.files.length) {
  throw new Error("importMap 条目数量与 files.length 不一致");
}

const result = {
  name: "sglang-omni",
  description:
    "SGLang-Omni 是面向 omni、语音和 TTS 模型的多阶段推理服务流水线框架，负责组织异构阶段、阶段间传输以及兼容 OpenAI 的服务接口。注意：该项目包含超过 100 个源文件；如需更快完成分析，可考虑将范围限定到某个子目录。",
  languages: [
    "config",
    "css",
    "dockerfile",
    "html",
    "javascript",
    "json",
    "makefile",
    "markdown",
    "python",
    "shell",
    "toml",
    "txt",
    "unknown",
    "wav",
    "yaml",
  ],
  frameworks: [
    "Docker",
    "FastAPI",
    "GitHub Actions",
    "Pydantic",
    "Pytest",
    "Uvicorn",
  ],
  files: scan.files,
  totalFiles: scan.totalFiles,
  filteredByIgnore: scan.filteredByIgnore,
  estimatedComplexity: scan.estimatedComplexity,
  importMap: imports.importMap,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

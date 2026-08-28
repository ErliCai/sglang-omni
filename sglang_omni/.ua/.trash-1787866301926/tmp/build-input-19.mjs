import fs from "node:fs";

const batchesRaw = JSON.parse(fs.readFileSync("sglang_omni/.ua/intermediate/batches.json", "utf8"));
const batches = Array.isArray(batchesRaw) ? batchesRaw : batchesRaw.batches;
const batch = batches.find((item) => item.batchIndex === 19);
if (!batch) throw new Error("找不到 batchIndex 19");

const output = {
  projectRoot: "C:\\Users\\erlic\\Documents\\sgl-omni\\sglang-omni\\sglang_omni",
  batchFiles: batch.files,
  batchImportData: batch.batchImportData,
  neighborMap: batch.neighborMap
};
const json = JSON.stringify(output, null, 2) + "\n";
console.log("*** Begin Patch");
console.log("*** Add File: sglang_omni/.ua/tmp/ua-file-analyzer-input-19.json");
for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
console.log("*** End Patch");

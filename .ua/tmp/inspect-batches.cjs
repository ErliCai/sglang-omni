const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const batches = data.batches || [];
const summaries = batches.map((batch) => ({
  batchIndex: batch.batchIndex,
  fileCount: (batch.files || batch.batchFiles || []).length,
  files: (batch.files || batch.batchFiles || []).slice(0, 3).map((file) => file.path),
  importFiles: Object.keys(batch.batchImportData || {}).length,
  neighborFiles: Object.keys(batch.neighborMap || {}).length
}));
process.stdout.write(JSON.stringify({
  totalBatches: batches.length,
  keys: Object.keys(data),
  firstBatchKeys: batches[0] ? Object.keys(batches[0]) : [],
  summaries
}, null, 2));

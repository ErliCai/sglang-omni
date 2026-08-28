import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uaDir = fs.existsSync(path.join(root, ".understand-anything"))
  ? path.join(root, ".understand-anything")
  : path.join(root, ".ua");
const input = JSON.parse(fs.readFileSync(path.join(uaDir, "tmp", "ua-file-analyzer-input-3.json"), "utf8"));
const extraction = JSON.parse(fs.readFileSync(path.join(uaDir, "tmp", "ua-file-extract-results-3.json"), "utf8"));

const info = {
  "sglang_omni/scheduling/sglang_backend/request_data.py": ["定义 SGLang 后端自回归与扩散语言模型请求的运行时数据容器，集中保存生成状态、嵌入、队列及完成原因。", ["data-model", "scheduling", "request-state", "sglang-backend"]],
  "sglang_omni/scheduling/sglang_backend/server_args_builder.py": ["根据平台、算子配置与显存预算构造 SGLang ServerArgs，并规范化 CUDA Graph 与编码器内存预留参数。", ["configuration", "factory", "gpu-memory", "sglang-backend"]],
  "sglang_omni/scheduling/types.py": ["定义调度器请求、输出、状态与延迟准入等共享数据契约，并提供采样 logprob 的规范化转换。", ["type-definition", "data-model", "scheduling", "serialization"]],
  "sglang_omni/utils/gpu_compat.py": ["检测可见 GPU 的 CUDA 架构与 P2P 能力，生成兼容性环境变量并决定是否禁用 custom all-reduce。", ["gpu-compat", "cuda", "hardware-detection", "configuration"]],
  "sglang_omni/utils/gpu_memory.py": ["提供可见 GPU 映射、NVML/torch 显存查询、阶段预算计算及跨进程启动锁等底层显存工具。", ["gpu-memory", "nvml", "resource-management", "utility"]],
  "tests/unit_test/arkasr/test_pipeline.py": ["验证 ArkASR 配置注册、阶段拓扑、Pre-LM 编码器、异步解码以及 SGLang 基础设施生命周期。", ["test", "arkasr", "pipeline", "integration-contract"]],
  "tests/unit_test/fakes.py": ["提供跨单元测试复用的执行桥与 ServerArgs 测试替身，隔离上游 SGLang 运行时依赖。", ["test-fixture", "test-double", "sglang-backend"]],
  "tests/unit_test/fixtures/qwen_fakes.py": ["构造 Qwen3-Omni 状态、载荷、tokenizer 与各阶段模型替身，供流水线和调度器测试复用。", ["test-fixture", "qwen3-omni", "test-double", "payload"]],
  "tests/unit_test/ming_omni/test_tp.py": ["验证 Ming-Omni Thinker 的 tensor parallel 分组、rank 专属阶段规格、设备放置约束与模块导入隔离。", ["test", "ming-omni", "tensor-parallel", "placement"]],
  "tests/unit_test/model_runner/test_hidden_capture.py": ["验证隐藏状态静态捕获在 CUDA Graph 重放下的缓冲区复用、容量限制、dtype 校验与多层刷新。", ["test", "model-runner", "cuda-graph", "hidden-state"]],
  "tests/unit_test/model_runner/test_register_omni_model.py": ["验证 Omni 模型注册流程会安全跳过无法导入的可选模型实现。", ["test", "model-registry", "error-handling"]],
  "tests/unit_test/model_runner/test_weight_checker.py": ["验证严格权重快照与 checksum、特殊 dtype 字节转换，以及模型工作进程的磁盘和分布式权重更新契约。", ["test", "model-runner", "weight-update", "checksum"]],
  "tests/unit_test/pipeline/test_async_decode.py": ["全面验证异步解码句柄生命周期、lookahead、完成判定、回退同步、批处理行映射与 CUDA 事件行为。", ["test", "pipeline", "async-decode", "cuda-event"]],
  "tests/unit_test/pipeline/test_gpu_architecture.py": ["验证 GPU SM 到架构标识的映射保持显式且稳定。", ["test", "gpu-compat", "architecture"]],
  "tests/unit_test/pipeline/test_gpu_compat_custom_ar.py": ["验证 custom all-reduce 在 GPU 数量、NVML 可用性、P2P mesh 与驱动错误下的启停决策。", ["test", "gpu-compat", "all-reduce", "nvml"]],
  "tests/unit_test/pipeline/test_gpu_memory.py": ["验证 CUDA_VISIBLE_DEVICES 解析、NVML 进程显存统计、设备信息回退、预算公式与启动锁行为。", ["test", "gpu-memory", "nvml", "resource-budget"]],
  "tests/unit_test/profiler/test_event_recorder.py": ["验证 profiler 事件记录器的 JSONL 持久化、线程与 asyncio 上下文隔离、并发安全及单例接口。", ["test", "profiler", "event-recorder", "concurrency"]],
  "tests/unit_test/profiler/test_stop_run_id.py": ["验证 profiler 停止消息的可选 run_id 兼容性及记录器对匹配和不匹配运行标识的处理。", ["test", "profiler", "run-id", "backward-compatibility"]],
  "tests/unit_test/qwen3_omni/test_audio_encoder_batch_dedup.py": ["验证 Qwen3-Omni 音频编码器按 cache key 对批内重复请求去重，并在缺少 key 时保留逐请求执行。", ["test", "qwen3-omni", "audio-encoder", "deduplication"]],
  "tests/unit_test/qwen3_omni/test_code2wav.py": ["验证 Code2Wav 阶段的模型装载、显存预算、批处理、CUDA Graph 开关、流式阈值与输出生命周期。", ["test", "qwen3-omni", "code2wav", "cuda-graph"]],
  "tests/unit_test/qwen3_omni/test_code2wav_batching.py": ["验证 Code2Wav 批处理调度器的窗口收集、chunk 对齐、公平性、背压、streaming EOS 与失败隔离。", ["test", "qwen3-omni", "code2wav", "batching"]],
  "tests/unit_test/qwen3_omni/test_code2wav_cuda_graph.py": ["验证 Code2Wav CUDA Graph 的 warmup、capture key、私有 stream、内存池、并发重放与 eager parity。", ["test", "qwen3-omni", "code2wav", "cuda-graph"]],
  "tests/unit_test/qwen3_omni/test_code2wav_overlap.py": ["验证 Code2Wav 同步与重叠执行协议的逐位一致性、延迟窗口、非流式聚合、异常恢复和并发隔离。", ["test", "qwen3-omni", "code2wav", "overlap"]],
  "tests/unit_test/qwen3_omni/test_pipeline.py": ["覆盖 Qwen3-Omni 多模态流水线的配置、状态投影、预处理、阶段路由、内存预算和请求构建契约。", ["test", "qwen3-omni", "pipeline", "multimodal"]],
  "tests/unit_test/qwen3_omni/test_request_builder_text_only.py": ["验证纯文本 Qwen 请求构建对嵌套 model inputs、旧式扁平载荷与顺序 mRoPE 位置的处理。", ["test", "qwen3-omni", "request-builder", "mrope"]],
  "tests/unit_test/qwen3_omni/test_sglang_ar_budget.py": ["验证 Qwen3-Omni 自回归阶段在共置和非共置场景下的显存预算、预留量与冲突配置校验。", ["test", "qwen3-omni", "sglang-backend", "gpu-memory"]],
  "tests/unit_test/qwen3_omni/test_streaming.py": ["全面验证 Qwen3-Omni 文本与语音 active subgraph、流式载荷、detokenizer、终止传播和客户端协调。", ["test", "qwen3-omni", "streaming", "multimodal"]],
  "tests/unit_test/qwen3_omni/test_talker.py": ["全面验证 Qwen3-Omni Talker 的 prefill/decode、反馈与文本队列、调度、CUDA Graph、采样及终止状态机。", ["test", "qwen3-omni", "talker", "state-machine"]],
  "tests/unit_test/qwen3_omni/test_talker_prefill_embed_cache.py": ["验证 Talker prefill embedding cache 的索引解析、分片复用、重复行一致性、fallback 与缺失权重错误。", ["test", "qwen3-omni", "talker-prefill", "embedding-cache"]],
  "tests/unit_test/qwen3_omni/test_talker_projection.py": ["验证流向 Talker 的载荷投影会保留使用中的 embedding，并剔除 deepstack 与无关编码器输出。", ["test", "qwen3-omni", "talker", "payload-projection"]],
  "tests/unit_test/scheduling/test_deferred_admission.py": ["验证依赖完成前的延迟准入、abort 与失败传播，以及构建线程池背压下的调度行为。", ["test", "scheduling", "deferred-admission", "backpressure"]],
  "tests/unit_test/scheduling/test_engine_factory.py": ["验证 ASR/TTS engine builder 的 CPU-only 导入、checkpoint 解析、阶段顺序、hook 契约与失败清理。", ["test", "engine-factory", "asr", "tts"]],
  "tests/unit_test/scheduling/test_request_data.py": ["验证 sampled logprobs 在 tensor、CPU list 与 None 输入之间的稳定规范化。", ["test", "scheduling", "logprobs", "serialization"]],
  "tests/unit_test/scheduling/test_server_args_builder_device.py": ["验证 ServerArgs 构建时平台解析、调用方覆盖与 operator placement 之间的设备选择和冲突校验。", ["test", "scheduling", "device-placement", "server-args"]],
  "tests/unit_test/serve/test_sglang_bootstrap.py": ["验证 SGLang 启动阶段的后端诊断、CUDA Graph 初始化、隐藏状态捕获容量及延迟 capture 恢复。", ["test", "bootstrap", "sglang-backend", "cuda-graph"]]
};

const productionFunctionSummary = {
  _platform_device_type: "解析当前平台的 SGLang 设备类型，供 ServerArgs 构建使用。",
  _normalize_decode_cuda_graph_overrides: "规范化 decode CUDA Graph 覆盖项并检查相互冲突的配置。",
  build_sglang_server_args: "综合模型、设备、并行与显存参数构建可启动的 SGLang ServerArgs。",
  apply_encoder_mem_reserve: "将编码器显存预留折算到可供后端使用的静态显存比例。",
  sampled_logprobs_to_list: "将采样器返回的 logprob tensor 或序列规范化为 Python list。",
  gpu_architecture_for_sm: "把 CUDA SM 版本映射为统一的 GPU 架构标识。",
  _get_compute_capability: "读取指定 CUDA 设备的 compute capability。",
  _get_cuda_device_count: "获取当前运行时可见的 CUDA 设备数量。",
  _visible_gpu_ids: "解析当前进程可访问的逻辑 GPU 标识集合。",
  get_visible_gpu_sm_version: "返回可见 GPU 的 SM 版本，用于选择兼容 kernel。",
  visible_gpus_need_flashinfer_cuda_norm: "判断可见 GPU 是否需要启用 FlashInfer CUDA norm 兼容路径。",
  get_gpu_compat_env_defaults: "根据硬件能力生成 GPU 兼容性环境变量默认值。",
  apply_gpu_compat_env_defaults: "在不覆盖用户设置的前提下应用 GPU 兼容环境默认值。",
  gpu_ids_support_p2p_mesh: "通过 NVML 验证给定 GPU 集合是否形成完整 P2P mesh。",
  should_disable_custom_all_reduce_for_gpus: "根据设备数量和 P2P 能力决定是否禁用 custom all-reduce。",
  parse_cuda_visible_devices: "解析 CUDA_VISIBLE_DEVICES 的索引、UUID 与空值形式。",
  resolve_visible_device_id: "将进程内逻辑 GPU 编号解析为物理索引或 UUID。",
  is_process_scoped_memory_available: "探测当前环境能否按进程统计 GPU 显存占用。",
  get_process_gpu_memory_bytes: "通过 NVML 汇总指定进程在目标 GPU 上占用的显存字节数。",
  get_gpu_device_info: "读取 GPU 总显存、空闲显存与进程占用，并在 NVML 不可用时回退。",
  _get_torch_gpu_device_info: "使用 torch CUDA API 获取基础设备显存信息。",
  format_bytes_gib: "把字节数格式化为便于诊断的 GiB 文本。",
  calculate_stage_budget_available_bytes: "依据阶段总预算和当前占用计算可用加载显存。",
  calculate_stage_load_delta_bytes: "计算模型阶段从加载前到加载后的显存增量。",
  get_gpu_startup_lock_path: "为目标 GPU 生成稳定的跨进程启动锁路径。",
  gpu_startup_lock: "提供带超时与清理语义的 GPU 启动文件锁上下文。",
  _try_import_pynvml: "安全加载 pynvml，并在不可用时返回明确的 fallback 信号。"
};

function complexity(lines) {
  return lines < 50 ? "simple" : lines <= 200 ? "moderate" : "complex";
}

function topicFor(filePath) {
  if (filePath.includes("code2wav")) return "code2wav";
  if (filePath.includes("talker")) return "talker";
  if (filePath.includes("stream")) return "streaming";
  if (filePath.includes("gpu_memory")) return "gpu-memory";
  if (filePath.includes("gpu_compat") || filePath.includes("gpu_architecture")) return "gpu-compat";
  if (filePath.includes("profiler")) return "profiler";
  if (filePath.includes("scheduling")) return "scheduling";
  if (filePath.includes("arkasr")) return "arkasr";
  if (filePath.includes("ming_omni")) return "ming-omni";
  if (filePath.includes("qwen3_omni")) return "qwen3-omni";
  return "model-runner";
}

function functionSummary(filePath, name) {
  if (productionFunctionSummary[name] && filePath.startsWith("sglang_omni/")) return productionFunctionSummary[name];
  if (name.startsWith("test_")) return `验证 \`${name}\` 场景所表达的行为、状态变化与边界条件。`;
  if (name.startsWith("_") || name.startsWith("make_") || name.startsWith("model_dir")) {
    return `构造或处理 \`${name}\` 对应的测试数据与运行环境，供同文件场景复用。`;
  }
  return `实现 \`${name}\` 对应的模块级处理逻辑，并向调用方提供稳定结果。`;
}

function classSummary(filePath, cls) {
  const name = cls.name;
  if (name === "SGLangARRequestData") return "保存 SGLang 自回归请求在 prefill、decode 与 Talker 协作期间的完整可变状态。";
  if (name === "SGLangDLLMRequestData") return "保存扩散语言模型请求的输出 token、阶段载荷与完成原因。";
  if (name === "GpuDeviceInfo") return "封装 GPU 总量、空闲量、进程占用与设备标识等显存快照。";
  if (filePath === "sglang_omni/scheduling/types.py") return `定义调度流程中的 \`${name}\` 数据契约，供调度器、模型运行器与输出层共享。`;
  if (name.startsWith("Fake") || name.startsWith("_Fake") || name.startsWith("_Stub") || name.startsWith("_Captured") || name.startsWith("_Strict") || name.startsWith("_Wait") || name.startsWith("_DF") || name.startsWith("_Mixed") || name.startsWith("_Stale") || name.startsWith("_Availability") || name.startsWith("_Sequenced") || name.startsWith("_Device") || name.startsWith("_Byte") || name.startsWith("_Stream") || name.startsWith("_Raising")) {
    return `为测试提供 \`${name}\` 替身，以可控方式模拟依赖、状态或硬件行为。`;
  }
  if (name.startsWith("Test")) return `组织 \`${name}\` 相关测试场景及其共享断言。`;
  return `定义 \`${name}\` 所需的数据与行为，服务于 ${topicFor(filePath)} 场景。`;
}

const nodes = [];
const edges = [];
const nodeIds = new Set();
const edgeKeys = new Set();
function addNode(node) {
  if (nodeIds.has(node.id)) return;
  nodeIds.add(node.id);
  nodes.push(node);
}
function addEdge(edge) {
  if (edge.source === edge.target) return;
  const key = `${edge.source}|${edge.target}|${edge.type}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push(edge);
}

for (const result of extraction.results) {
  const filePath = result.path;
  const fileId = `file:${filePath}`;
  const [summary, tags] = info[filePath] ?? [`分析并实现 \`${path.posix.basename(filePath)}\` 对应的项目功能。`, ["code", "python", "project-module"]];
  const fileNode = {
    id: fileId,
    type: "file",
    name: path.posix.basename(filePath),
    filePath,
    summary,
    tags,
    complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0)
  };
  if (filePath === "sglang_omni/utils/gpu_compat.py") fileNode.languageNotes = "通过 torch 与 NVML 的分层探测兼容不同 CUDA 硬件和驱动环境。";
  if (filePath === "sglang_omni/utils/gpu_memory.py") fileNode.languageNotes = "同时支持 NVML 的进程级统计与 torch 的设备级 fallback，并使用文件锁协调多进程启动。";
  addNode(fileNode);

  const exported = new Set((result.exports ?? []).map((item) => item.name));
  for (const fn of result.functions ?? []) {
    const lines = Math.max(1, (fn.endLine ?? fn.startLine) - fn.startLine + 1);
    if (lines < 10 && !exported.has(fn.name)) continue;
    const fnId = `function:${filePath}:${fn.name}`;
    if (nodeIds.has(fnId)) continue;
    const isTest = fn.name.startsWith("test_");
    addNode({
      id: fnId,
      type: "function",
      name: fn.name,
      filePath,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummary(filePath, fn.name),
      tags: isTest ? ["test", "unit-test", topicFor(filePath)] : [filePath.startsWith("tests/") ? "test-fixture" : "utility", topicFor(filePath), "python"],
      complexity: complexity(lines)
    });
    addEdge({ source: fileId, target: fnId, type: "contains", direction: "forward", weight: 1.0 });
    if (exported.has(fn.name)) addEdge({ source: fileId, target: fnId, type: "exports", direction: "forward", weight: 0.8 });
  }

  for (const cls of result.classes ?? []) {
    const lines = Math.max(1, (cls.endLine ?? cls.startLine) - cls.startLine + 1);
    if ((cls.methods?.length ?? 0) < 2 && lines < 20 && !exported.has(cls.name)) continue;
    const clsId = `class:${filePath}:${cls.name}`;
    if (nodeIds.has(clsId)) continue;
    addNode({
      id: clsId,
      type: "class",
      name: cls.name,
      filePath,
      lineRange: [cls.startLine, cls.endLine],
      summary: classSummary(filePath, cls),
      tags: filePath.startsWith("tests/") ? ["test-double", "test-fixture", topicFor(filePath)] : ["data-model", topicFor(filePath), "python"],
      complexity: complexity(lines)
    });
    addEdge({ source: fileId, target: clsId, type: "contains", direction: "forward", weight: 1.0 });
    if (exported.has(cls.name)) addEdge({ source: fileId, target: clsId, type: "exports", direction: "forward", weight: 0.8 });
  }

  for (const targetPath of input.batchImportData[filePath] ?? []) {
    addEdge({ source: fileId, target: `file:${targetPath}`, type: "imports", direction: "forward", weight: 0.7 });
    if (filePath.startsWith("tests/") && !targetPath.startsWith("tests/")) {
      addEdge({ source: fileId, target: `file:${targetPath}`, type: "tested_by", direction: "forward", weight: 0.5 });
    }
  }
}

const importCount = edges.filter((edge) => edge.type === "imports").length;
const expectedImports = Object.values(input.batchImportData).reduce((sum, values) => sum + values.length, 0);
if (importCount !== expectedImports) throw new Error(`Import edge mismatch: ${importCount} != ${expectedImports}`);

const nodeCount = nodes.length;
const edgeCount = edges.length;
const partCount = nodeCount <= 60 && edgeCount <= 120
  ? 1
  : Math.ceil(Math.max(nodeCount / 60, edgeCount / 120));
const sortedFiles = [...input.batchFiles].sort((a, b) => a.path.localeCompare(b.path));
const intermediate = path.join(uaDir, "intermediate");

for (let i = 0; i < partCount; i += 1) {
  const start = Math.floor((i * sortedFiles.length) / partCount);
  const end = Math.floor(((i + 1) * sortedFiles.length) / partCount);
  const group = new Set(sortedFiles.slice(start, end).map((file) => file.path));
  const partNodes = nodes.filter((node) => group.has(node.filePath));
  const partNodeIds = new Set(partNodes.map((node) => node.id));
  const partEdges = edges.filter((edge) => partNodeIds.has(edge.source));
  const outputPath = partCount === 1
    ? path.join(intermediate, "batch-3.json")
    : path.join(intermediate, `batch-3-part-${i + 1}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ partCount, nodeCount, edgeCount, importCount, expectedImports, filesAnalyzed: extraction.filesAnalyzed, filesSkipped: extraction.filesSkipped ?? [] }));

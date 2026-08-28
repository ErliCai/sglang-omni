import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const extraction = JSON.parse(fs.readFileSync(path.join(root, ".ua/tmp/ua-file-extract-results-2.json"), "utf8"));
const input = JSON.parse(fs.readFileSync(path.join(root, ".ua/tmp/ua-file-analyzer-input-2.json"), "utf8"));

const fileInfo = {
  "sglang_omni/model_runner/__init__.py": ["模型运行器包的初始化入口，用于建立该子包的 Python 命名空间。", ["entry-point", "model-runner", "package"]],
  "sglang_omni/model_runner/_hidden_capture.py": ["为模型层安装 hidden state 捕获钩子，并以预分配张量视图收集批次中的辅助隐藏表示。", ["hidden-state", "hook", "tensor-buffer"]],
  "sglang_omni/model_runner/sglang_model_runner.py": ["扩展 SGLang 模型运行器，负责模型加载、KV cache 配置、CUDA Graph 初始化以及在线权重更新。", ["model-runner", "kv-cache", "weight-update", "cuda-graph"]],
  "sglang_omni/model_runner/weight_checker.py": ["对模型权重生成稳定摘要和聚合校验和，用于严格比较更新前后的参数一致性。", ["weight-check", "checksum", "validation"]],
  "sglang_omni/models/arkasr/__init__.py": ["ArkASR 模型包入口，公开该模型族的配置定义。", ["entry-point", "arkasr", "barrel"]],
  "sglang_omni/models/arkasr/audio_lengths.py": ["根据音频帧长度计算 ArkASR 编码后的 token 数量和批量长度。", ["audio", "token-length", "utility"]],
  "sglang_omni/models/arkasr/audio_tower.py": ["实现 ArkASR 的音频编码塔，包括 RoPE 注意力、特制 Whisper 编码层与 MLP 适配器。", ["audio-encoder", "attention", "rope", "model-component"]],
  "sglang_omni/models/arkasr/config.py": ["定义 ArkASR 工厂、阶段和流水线配置，并映射内存比例与 SGLang 生成角色。", ["configuration", "pipeline", "arkasr"]],
  "sglang_omni/models/arkasr/configuration_arkasr.py": ["提供 Hugging Face 风格的 ArkASR 模型配置与处理器加载接口。", ["configuration", "processor", "huggingface"]],
  "sglang_omni/models/arkasr/engine_builder.py": ["组装 ArkASR 推理引擎的基础设施、模型资源、调度适配器和清理回调。", ["engine-builder", "arkasr", "factory", "scheduling"]],
  "sglang_omni/models/arkasr/request_builders.py": ["把转写输入转换为 ArkASR 调度请求，并构建 token 解码和抑制规则相关的适配器。", ["request-builder", "transcription", "scheduler-adapter"]],
  "sglang_omni/models/arkasr/sglang_model.py": ["实现可在 SGLang 中运行的 ArkASR 条件生成模型，衔接音频编码、特征投影、前向传播和权重加载。", ["model", "audio-encoder", "conditional-generation", "weight-loader"]],
  "sglang_omni/models/arkasr/stages.py": ["创建 ArkASR 的 SGLang 执行器，并把模型服务接入 Omni 分阶段执行框架。", ["stage-factory", "executor", "arkasr"]],
  "sglang_omni/models/qwen3_omni/bootstrap.py": ["分别创建 Qwen3-Omni thinker 与 talker 调度器，集中装配它们的运行参数和生命周期依赖。", ["bootstrap", "scheduler", "qwen3-omni"]],
  "sglang_omni/models/qwen3_omni/components/__init__.py": ["Qwen3-Omni 组件包的轻量初始化入口。", ["entry-point", "component", "package"]],
  "sglang_omni/models/qwen3_omni/components/code2wav_cuda_graph.py": ["管理 Code2Wav CUDA Graph 的构建、分桶捕获、等价性验证、回滚和运行时降级。", ["cuda-graph", "code2wav", "gpu", "runtime"]],
  "sglang_omni/models/qwen3_omni/components/code2wav_scheduler.py": ["调度流式 Code2Wav 解码，维护每路流状态、批处理窗口、pinned memory 槽位以及 CUDA Graph 执行计划。", ["scheduler", "streaming", "code2wav", "cuda-graph"]],
  "sglang_omni/models/qwen3_omni/components/preprocessor.py": ["将文本和多模态消息预处理为 Qwen3-Omni 模型输入，并管理模型目录、缓存键和序列长度校验。", ["preprocessing", "multimodal", "cache", "validation"]],
  "sglang_omni/models/qwen3_omni/components/streaming_detokenizer.py": ["把 thinker 的流式 token 事件还原成文本结果，按请求维护状态并处理完成与中止。", ["streaming", "detokenizer", "event-handler", "scheduler"]],
  "sglang_omni/models/qwen3_omni/components/talker_input.py": ["切分聊天模板并构造 talker 的用户段、助手段和 prefill 输入布局。", ["talker", "prompt-builder", "chat-template"]],
  "sglang_omni/models/qwen3_omni/components/talker_prefill.py": ["构建 talker 的多模态 prefill 表示，合并文本、音频和 speaker embedding，并维护增量文本队列。", ["talker", "prefill", "multimodal", "embedding"]],
  "sglang_omni/models/qwen3_omni/merge.py": ["合并 Qwen3-Omni 预处理结果与流式事件，构建 thinker 输入并解码流水线事件。", ["data-merge", "thinker", "pipeline-state"]],
  "sglang_omni/models/qwen3_omni/payload_types.py": ["定义 Qwen3-Omni 流水线各阶段共享的输入、输出、状态和事件数据结构。", ["data-model", "payload", "pipeline-state"]],
  "sglang_omni/models/qwen3_omni/pending_text_queue.py": ["以张量行为单位维护待处理文本队列，支持复制、游标推进和增量追加。", ["tensor-queue", "streaming", "data-structure"]],
  "sglang_omni/models/qwen3_omni/request_builders.py": ["在 Qwen3-Omni 各阶段间构建、投影和合并请求，覆盖 encoder、thinker、talker 与多模态聚合路径。", ["request-builder", "multimodal", "stage-routing", "qwen3-omni"]],
  "sglang_omni/models/qwen3_omni/stages.py": ["实现 Qwen3-Omni 各执行阶段及 encoder 批处理、缓存和显存策略，连接预处理、编码、thinker、talker 与 decode。", ["stage-executor", "batching", "encoder-cache", "gpu-memory"]],
  "sglang_omni/models/qwen3_omni/talker_scheduler.py": ["在通用 Omni 调度器之上实现 talker 的流式准入、prefetch 判断、decode 回滚和请求状态维护。", ["talker", "scheduler", "streaming", "decode"]],
  "sglang_omni/profiler/event_recorder.py": ["记录带阶段上下文的请求事件和模型路径事件，并以线程安全方式管理 profiling 会话输出。", ["profiling", "event-recorder", "observability"]],
  "sglang_omni/scheduling/bootstrap.py": ["创建 SGLang 调度基础设施，初始化 CUDA Graph 与 hidden capture，并提供延迟图捕获的启动路径。", ["bootstrap", "scheduling", "cuda-graph", "hidden-state"]],
  "sglang_omni/scheduling/omni_scheduler.py": ["实现 Omni 的核心阶段调度循环，统一处理请求准入、批次执行、流式消息、异步 decode、管理命令和资源回收。", ["scheduler", "admission-control", "streaming", "async-decode", "admin"]],
  "sglang_omni/scheduling/sglang_backend/__init__.py": ["汇总并公开 SGLang 后端的 cache、prefill、decode、输出处理和请求数据适配组件。", ["barrel", "sglang-backend", "scheduler-adapter"]],
  "sglang_omni/scheduling/sglang_backend/cache.py": ["根据 SGLang 服务器参数和模型运行器创建合适的 radix tree cache。", ["cache", "factory", "sglang-backend"]],
  "sglang_omni/scheduling/sglang_backend/decode.py": ["封装 SGLang decode 批次的选择逻辑，并判断当前调度状态是否可运行。", ["decode", "scheduler", "sglang-backend"]],
  "sglang_omni/scheduling/sglang_backend/output_processor.py": ["把 SGLang 模型输出转换为 Omni 请求结果，并按请求切分常规与辅助 hidden state。", ["output-processor", "hidden-state", "serialization", "sglang-backend"]],
  "sglang_omni/scheduling/sglang_backend/prefill.py": ["管理 SGLang prefill 请求的加入、完整 prefill 判定、批次调度与可运行状态。", ["prefill", "scheduler", "sglang-backend"]]
};

const exactSymbolSummary = {
  StaticAuxHiddenCapture: "封装辅助 hidden state 的静态捕获缓冲区，并向调用方提供按行裁剪的张量视图。",
  SGLModelRunner: "扩展上游模型运行器，将 Omni 的模型注册、缓存配置、CUDA Graph 和在线权重更新接入统一生命周期。",
  StrictWeightChecker: "遍历模型张量并生成可比较摘要，用于严格验证分布式或在线权重更新的一致性。",
  ArkAudioTower: "以定制 Whisper 编码层处理音频特征，并输出供 ArkASR 解码器消费的隐藏表示。",
  ArkasrEngineBuilder: "按 Omni 引擎构建协议装配 ArkASR 的服务、资源和调度适配器。",
  ArkasrForConditionalGeneration: "组合 ArkASR 音频塔与语言模型前向路径，并实现批量音频编码和权重加载。",
  Code2WavCudaGraphRunner: "按批次和序列形状捕获 Code2Wav CUDA Graph，验证结果后在运行时复用或安全降级。",
  Code2WavScheduler: "维护多个流式音频请求的窗口和资源，选择参与者并执行 Code2Wav 批次步骤。",
  Qwen3OmniPreprocessor: "把原始文本、多模态内容或预分词输入规范化为可缓存的 Qwen3-Omni 预处理状态。",
  StreamingDetokenizeScheduler: "消费流式 token 消息并维护请求级解码状态，最终生成文本输出事件。",
  TalkerPrefillBuilder: "组装 talker 的 prompt embedding、speaker 信息和多模态 mask，并支持增量文本到达。",
  PendingTextTensorQueue: "用张量和游标实现轻量 FIFO 文本队列，避免增量流式处理中的重复拷贝。",
  QwenTalkerScheduler: "扩展核心调度器以满足 talker 对流式文本、prefetch 与 decode 准备状态的特殊要求。",
  RequestEventRecorder: "管理 profiling 会话并将请求生命周期事件安全写入记录目标。",
  OmniScheduler: "驱动 Omni 阶段的主调度状态机，协调准入、执行、流式 I/O、管理操作和故障恢复。",
  SGLangOutputProcessor: "解释 SGLang 模型输出，并将 hidden state 按请求边界切分后附加到 Omni 输出。",
  PrefillManager: "维护待 prefill 请求并依据缓存命中和调度条件生成下一批次。",
  DecodeManager: "根据调度上下文选取下一 decode 批次并暴露可运行性判断。",
  create_thinker_scheduler: "创建并配置 thinker 阶段调度器及其运行时依赖。",
  create_talker_scheduler: "创建并配置 talker 阶段调度器及其流式运行依赖。",
  build_sglang_thinker_request: "把流水线状态转换为 SGLang thinker 请求，并计算多模态位置与批处理元数据。",
  build_sglang_talker_request: "根据 thinker 输出和流式文本状态构造 SGLang talker 请求。",
  create_sglang_infrastructure: "按既定初始化顺序创建 SGLang 运行资源、缓存和 CUDA Graph。",
  create_sglang_infrastructure_defer_cuda_graph: "创建 SGLang 基础设施但推迟 CUDA Graph 捕获，以便调用方完成额外安装步骤。",
  _batch_image_encoder_payloads: "将可合并的图像 encoder 请求打包为批次，并保留拆分输出所需的边界信息。",
  _batch_audio_encoder_payloads: "规范化并填充音频张量，将多个 encoder 请求组合为统一批次。"
};

function symbolSummary(name, type) {
  if (exactSymbolSummary[name]) return exactSymbolSummary[name];
  const label = `\`${name}\``;
  if (type === "class") {
    if (/Config|Args|Contract/.test(name)) return `${label} 定义该子系统使用的结构化配置和约束。`;
    if (/Request|Payload|Output|State|Event|Data|GraphKey/.test(name)) return `${label} 表示阶段间传递的结构化状态或数据载荷。`;
    if (/Scheduler|Manager/.test(name)) return `${label} 封装该执行阶段的调度状态和批次决策。`;
    if (/Runner/.test(name)) return `${label} 封装运行时执行、资源管理和结果回收逻辑。`;
    if (/Builder/.test(name)) return `${label} 集中构建并校验下游执行所需的数据和依赖。`;
    return `${label} 封装该模块的一组相关状态与操作。`;
  }
  if (/^(create|make)_/.test(name)) return `${label} 创建并装配对应运行组件及其依赖。`;
  if (/^build_/.test(name)) return `${label} 从当前流水线状态构建下游阶段所需的数据结构。`;
  if (/^resolve_/.test(name)) return `${label} 根据请求配置解析适用的阶段、目标或运行选项。`;
  if (/^project_/.test(name)) return `${label} 将当前阶段数据投影为下游阶段可消费的载荷。`;
  if (/^apply_/.test(name)) return `${label} 将上游结果或配置应用到当前流水线状态。`;
  if (/^load_/.test(name)) return `${label} 加载并规范化该执行路径所需的模型或张量资源。`;
  if (/merge|combine/.test(name)) return `${label} 合并多路输入，同时保持阶段间的数据契约。`;
  if (/decode/.test(name)) return `${label} 解码当前批次或流式状态，并生成可下游消费的结果。`;
  if (/encode/.test(name)) return `${label} 执行编码相关的数据准备或批处理计算。`;
  if (/validate|check/.test(name)) return `${label} 校验输入形状、容量或状态不变量，并在异常时提前失败。`;
  if (/emit|record/.test(name)) return `${label} 生成并发布运行时事件或结果记录。`;
  if (/cache/.test(name)) return `${label} 读取、更新或描述该路径使用的缓存状态。`;
  if (/batch|bucket/.test(name)) return `${label} 组织批次或分桶数据，以提高阶段执行效率。`;
  if (/tensor|rows|feature|embed/.test(name)) return `${label} 处理张量、特征或 embedding 的形状与数据转换。`;
  if (/stream/.test(name)) return `${label} 处理流式请求的增量状态、消息或完成边界。`;
  return `${label} 实现该模块中的内部数据转换或运行时辅助逻辑。`;
}

function symbolTags(name, type, filePath) {
  const tags = [type];
  const text = `${name} ${filePath}`.toLowerCase();
  if (text.includes("scheduler")) tags.push("scheduler");
  else if (text.includes("request") || text.includes("payload")) tags.push("request-data");
  else if (text.includes("config")) tags.push("configuration");
  else tags.push("runtime");
  if (text.includes("audio") || text.includes("wav")) tags.push("audio");
  else if (text.includes("cuda") || text.includes("gpu")) tags.push("gpu");
  else if (text.includes("stream")) tags.push("streaming");
  else if (text.includes("talker")) tags.push("talker");
  else if (text.includes("thinker")) tags.push("thinker");
  else if (text.includes("encoder")) tags.push("encoder");
  else tags.push("data-flow");
  if (tags.length < 3) tags.push("python");
  return [...new Set(tags)].slice(0, 5);
}

function complexity(lines) {
  if (lines < 50) return "simple";
  if (lines <= 200) return "moderate";
  return "complex";
}

const notes = {
  "sglang_omni/models/qwen3_omni/components/code2wav_cuda_graph.py": "通过分桶和静态输入复用 CUDA Graph，并以 eager 对照验证捕获结果。",
  "sglang_omni/models/qwen3_omni/components/code2wav_scheduler.py": "结合 asyncio 风格流管理、pinned memory 与 CUDA event 实现低延迟批处理。",
  "sglang_omni/scheduling/omni_scheduler.py": "大型 Python 状态机同时兼容同步、overlap 和 async decode 事件循环。",
  "sglang_omni/models/qwen3_omni/stages.py": "阶段函数在批处理、encoder cache 和显存保留策略之间维持显式数据契约。"
};

const nodes = [];
const edges = [];
const resultByPath = new Map(extraction.results.map((r) => [r.path, r]));

for (const batchFile of input.batchFiles) {
  const r = resultByPath.get(batchFile.path);
  if (!r) throw new Error(`缺少结构提取结果: ${batchFile.path}`);
  const [summary, tags] = fileInfo[batchFile.path] ?? [`分析 ${batchFile.path} 中的 Python 运行逻辑。`, ["python", "runtime", "implementation"]];
  const fileNode = {
    id: `file:${batchFile.path}`,
    type: "file",
    name: path.posix.basename(batchFile.path),
    filePath: batchFile.path,
    summary,
    tags,
    complexity: complexity(r.nonEmptyLines ?? r.totalLines ?? batchFile.sizeLines)
  };
  if (notes[batchFile.path]) fileNode.languageNotes = notes[batchFile.path];
  nodes.push(fileNode);

  for (const target of input.batchImportData[batchFile.path] ?? []) {
    edges.push({source: fileNode.id, target: `file:${target}`, type: "imports", direction: "forward", weight: 0.7});
  }

  const exported = new Set((r.exports ?? []).map((e) => e?.name).filter((n) => typeof n === "string" && n.length));
  const structs = [
    ...(r.functions ?? []).map((v) => ({...v, nodeType: "function"})),
    ...(r.classes ?? []).map((v) => ({...v, nodeType: "class"}))
  ];
  for (const s of structs) {
    if (typeof s.name !== "string" || !s.name.length) continue;
    const span = Math.max(1, (s.endLine ?? s.startLine ?? 1) - (s.startLine ?? 1) + 1);
    const significant = exported.has(s.name) || span >= (s.nodeType === "function" ? 10 : 20) || (s.nodeType === "class" && (s.methods ?? []).length >= 2);
    if (!significant) continue;
    const id = `${s.nodeType}:${batchFile.path}:${s.name}`;
    nodes.push({
      id,
      type: s.nodeType,
      name: s.name,
      filePath: batchFile.path,
      lineRange: [s.startLine, s.endLine],
      summary: symbolSummary(s.name, s.nodeType),
      tags: symbolTags(s.name, s.nodeType, batchFile.path),
      complexity: complexity(span)
    });
    edges.push({source: fileNode.id, target: id, type: "contains", direction: "forward", weight: 1.0});
    if (exported.has(s.name)) edges.push({source: fileNode.id, target: id, type: "exports", direction: "forward", weight: 0.8});
  }
}

const nodeCount = nodes.length;
const edgeCount = edges.length;
const partCount = Math.ceil(Math.max(nodeCount / 60, edgeCount / 120));
const sortedFiles = input.batchFiles.map((f) => f.path).sort((a, b) => a.localeCompare(b));
const chunkSize = Math.ceil(sortedFiles.length / partCount);
const output = [];
for (let i = 0; i < partCount; i++) {
  const partFiles = new Set(sortedFiles.slice(i * chunkSize, (i + 1) * chunkSize));
  if (!partFiles.size) continue;
  const partNodes = nodes.filter((n) => partFiles.has(n.filePath));
  const sourceIds = new Set(partNodes.map((n) => n.id));
  const partEdges = edges.filter((e) => sourceIds.has(e.source));
  output.push({
    name: `batch-2-part-${i + 1}.json`,
    contentBase64: Buffer.from(JSON.stringify({nodes: partNodes, edges: partEdges}), "utf8").toString("base64")
  });
}

const expectedImports = Object.values(input.batchImportData).reduce((sum, values) => sum + values.length, 0);
const actualImports = edges.filter((e) => e.type === "imports").length;
if (expectedImports !== actualImports) throw new Error(`import 边数量不匹配: expected=${expectedImports}, actual=${actualImports}`);
const requestedPart = Number.parseInt(process.argv[2] ?? "0", 10);
const selectedOutput = requestedPart > 0 ? output.slice(requestedPart - 1, requestedPart) : output;
console.log(JSON.stringify({nodeCount, edgeCount, expectedImports, actualImports, partCount: output.length, files: selectedOutput}));

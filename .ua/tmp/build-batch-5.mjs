import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const extraction = JSON.parse(fs.readFileSync(path.join(root, ".ua/tmp/ua-file-extract-results-5.json"), "utf8"));
const input = JSON.parse(fs.readFileSync(path.join(root, ".ua/tmp/ua-file-analyzer-input-5.json"), "utf8"));

const fileInfo = {
  "sglang_omni/models/audar_tts/payload_types.py": ["定义 Audar TTS 流水线共享的请求状态和阶段载荷。", ["data-model", "audar-tts", "pipeline-state"]],
  "sglang_omni/models/audar_tts/protocol.py": ["实现 Audar TTS prompt 协议的构造与语音 code 解析。", ["protocol", "prompt-builder", "speech-code"]],
  "sglang_omni/models/audar_tts/request_builders.py": ["规范化文本、参考音频和生成参数，并构建 Audar TTS 初始流水线状态。", ["request-builder", "audar-tts", "validation"]],
  "sglang_omni/models/audar_tts/stages.py": ["实现 Audar TTS 的预处理、参考音频编码、生成引擎和 vocoder 执行阶段。", ["stage-executor", "audar-tts", "reference-audio", "vocoder"]],
  "sglang_omni/models/dots_tts/codec.py": ["加载 Dots 音频 codec，批量编码参考语音并通过统一 hook 缓存 speaker latent。", ["audio-codec", "dots-tts", "reference-encoder", "cache"]],
  "sglang_omni/models/dots_tts/payload_types.py": ["定义 Dots TTS 流水线状态，并提供状态载入与保存辅助函数。", ["data-model", "dots-tts", "pipeline-state"]],
  "sglang_omni/models/dots_tts/request_builders.py": ["把 Dots TTS 状态转换为 SGLang latent 请求，并构造流式输出和回写生成结果。", ["request-builder", "dots-tts", "streaming", "sglang"]],
  "sglang_omni/models/dots_tts/stages.py": ["装配 Dots TTS 预处理、参考编码、latent 生成和 vocoder 阶段，同时配置优化 kernel。", ["stage-executor", "dots-tts", "latent-generation", "vocoder"]],
  "sglang_omni/models/dots_tts/vocoder.py": ["实现 Dots TTS 的批量及流式 vocoder，管理增量 latent、协同执行计划和最终音频结果。", ["vocoder", "streaming", "dots-tts", "batching"]],
  "sglang_omni/models/dots_tts/vocoder_slot_pool.py": ["维护流式 vocoder 的固定槽位、decoder 输入历史和逐行音频切片。", ["slot-pool", "vocoder", "streaming", "tensor-buffer"]],
  "sglang_omni/models/fishaudio_s2_pro/__init__.py": ["FishAudio S2 Pro 模型包入口，公开模型注册所需的配置与能力描述。", ["entry-point", "fishaudio", "barrel"]],
  "sglang_omni/models/fishaudio_s2_pro/engine_builder.py": ["构建 FishAudio S2 Pro 推理引擎，配置 attention backend、模型资源和调度适配器。", ["engine-builder", "fishaudio", "attention", "scheduling"]],
  "sglang_omni/models/fishaudio_s2_pro/fish_speech/tokenizer.py": ["提供 Fish Speech tokenizer 依赖的底层文本分词与规范化定义。", ["tokenizer", "fish-speech", "text-processing"]],
  "sglang_omni/models/fishaudio_s2_pro/payload_types.py": ["定义 FishAudio S2 Pro 语音生成流水线使用的状态载荷。", ["data-model", "fishaudio", "pipeline-state"]],
  "sglang_omni/models/fishaudio_s2_pro/request_builders.py": ["校验采样参数并构建 FishAudio S2 Pro 的 SGLang 请求、结果回写与调度适配器。", ["request-builder", "fishaudio", "validation", "scheduler-adapter"]],
  "sglang_omni/models/fishaudio_s2_pro/stages.py": ["实现 FishAudio S2 Pro 的预处理、参考语音编码、AR 生成和 vocoder 阶段。", ["stage-executor", "fishaudio", "reference-encoder", "vocoder"]],
  "sglang_omni/models/fishaudio_s2_pro/streaming_vocoder.py": ["将 FishAudio code 增量转换为音频片段，处理重叠、crossfade、尾部刷新和多请求调度。", ["streaming", "vocoder", "crossfade", "fishaudio"]],
  "sglang_omni/models/fishaudio_s2_pro/tokenizer.py": ["把文本和参考 VQ code 编排为 FishAudio S2 Pro 推理 prompt，并公开关键语义 token。", ["tokenizer", "prompt-builder", "vq-code", "fishaudio"]],
  "sglang_omni/models/ming_omni/__init__.py": ["Ming-Omni 模型包入口，触发配置和模型注册。", ["entry-point", "ming-omni", "registration"]],
  "sglang_omni/models/ming_omni/bootstrap.py": ["创建 Ming-Omni thinker 调度器及输出适配器，支持文本、组合和流式 thinker 输出。", ["bootstrap", "scheduler", "ming-omni", "streaming"]],
  "sglang_omni/models/ming_omni/components/preprocessor.py": ["将文本、图像、音频和视频输入预处理为 Ming-Omni prompt，并计算 mel 与多模态 token 长度。", ["preprocessing", "multimodal", "mel-spectrogram", "ming-omni"]],
  "sglang_omni/models/ming_omni/components/streaming_detokenizer.py": ["消费 Ming-Omni thinker 的流式 token，按请求恢复文本并附加最终 decode 元数据。", ["streaming", "detokenizer", "scheduler", "ming-omni"]],
  "sglang_omni/models/ming_omni/components/streaming_segmenter.py": ["把增量文本切分为可合成的语音段，处理超时、标点、窗口上限和流结束。", ["streaming", "text-segmentation", "scheduler", "tts"]],
  "sglang_omni/models/ming_omni/components/streaming_talker.py": ["将流式文本段送入 Ming talker，增量生成、序列化并发布音频片段。", ["streaming", "talker", "audio-generation", "scheduler"]],
  "sglang_omni/models/ming_omni/components/streaming_text.py": ["定义流式文本消息、分段配置与有状态分段器，支持标点和最大窗口策略。", ["text-segmentation", "streaming", "data-model"]],
  "sglang_omni/models/ming_omni/components/talker_executor.py": ["管理 Ming talker 模型生命周期和请求队列，执行非流式语音生成并返回用量信息。", ["talker", "executor", "audio-generation", "lifecycle"]],
  "sglang_omni/models/ming_omni/config.py": ["定义 Ming-Omni 各阶段、GPU/TP 约束和文本、语音、流式语音三类流水线拓扑。", ["configuration", "pipeline", "gpu-placement", "ming-omni"]],
  "sglang_omni/models/ming_omni/io.py": ["定义 Ming-Omni 各阶段共享的 prompt、预处理、thinker 输出、流水线状态和事件结构。", ["data-model", "pipeline-state", "ming-omni"]],
  "sglang_omni/models/ming_omni/pipeline/engine_io.py": ["构建 Ming-Omni encoder 与 thinker 请求，并把两个阶段的结果写回流水线状态。", ["request-builder", "encoder", "thinker", "pipeline"]],
  "sglang_omni/models/ming_omni/pipeline/merge.py": ["合并 Ming-Omni 多模态预处理数据，构建 thinker 输入并将模型结果解码为事件。", ["data-merge", "multimodal", "thinker", "event-decoding"]],
  "sglang_omni/models/ming_omni/pipeline/next_stage.py": ["根据当前 Ming-Omni 阶段与输出模态决定后续 encoder、thinker、decode 或 talker 路由。", ["stage-routing", "pipeline", "ming-omni"]],
  "sglang_omni/models/ming_omni/pipeline/sampling.py": ["把 Ming-Omni 请求参数转换为 SGLang sampling kwargs 和 SamplingParams。", ["sampling", "configuration", "sglang"]],
  "sglang_omni/models/ming_omni/pipeline/stages.py": ["创建 Ming-Omni 预处理、聚合、encoder、thinker、talker 和 decode 执行器。", ["stage-executor", "pipeline", "ming-omni", "multimodal"]]
};

const exact = {
  AudarTTSState: "保存 Audar TTS 请求在文本生成、参考编码和音频解码阶段间共享的状态。",
  DotsAudioCodec: "封装 Dots codec 的参考音频加载、批量编码和 speaker latent 采样。",
  DotsReferenceEncoder: "通过通用参考编码调度器批量生成并缓存 Dots speaker 表示。",
  DotsTTSBatchVocoder: "把一批 Dots latent 解码为波形，并负责校验、存储和结果封装。",
  DotsTTSStreamingVocoder: "维护流级解码状态和槽位，为多个 Dots 请求协同执行增量 vocoder。",
  DotsVocoderSlotPool: "复用预分配的 vocoder decoder 状态，支持槽位获取、逐步解码和尾部刷新。",
  FishS2ProEngineBuilder: "按引擎构建协议装配 FishAudio S2 Pro 模型、编译路径和调度组件。",
  S2ProVocoderScheduler: "协调 FishAudio 流式和非流式 vocoder 请求，并管理 code 到音频的增量状态。",
  S2ProTokenizerAdapter: "将文本、参考语音和特殊 token 组织为 FishAudio S2 Pro 模型 prompt。",
  MingPreprocessor: "延迟加载多模态处理器并把文本、图像、视频和音频统一转成模型输入。",
  MingStreamingDetokenizeScheduler: "维护请求级 token 解码状态，将 thinker 流转换为文本事件和最终结果。",
  MingStreamingSegmenterScheduler: "驱动文本分段状态机并把可合成片段发送到下游 talker。",
  MingStreamingTalkerScheduler: "接收流式文本段，调用 talker 生成音频并发布增量波形消息。",
  SegmenterState: "维护尚未输出的文本 token，并依据标点、窗口和 flush 规则形成语音片段。",
  MingTalkerExecutor: "封装 talker 模型加载、请求执行、中止以及语音结果和用量统计。",
  build_sglang_dots_tts_request: "将 Dots TTS 状态和生成配置转换为 SGLang latent 请求。",
  preprocess_dots_tts_payload: "规范化 Dots TTS 文本、参考语音和模型元数据，产出后续阶段使用的状态。",
  build_sglang_tts_request: "将 FishAudio 状态、参考 VQ code 与采样参数转换为 SGLang TTS 请求。",
  build_stream_vocoder_chunk: "根据累计 code 和重叠窗口生成可立即发送的流式音频片段。",
  flush_stream_vocoder_chunk: "在流结束时解码剩余 code 并输出最后一个音频片段。",
  create_thinker_scheduler: "创建 Ming-Omni thinker 调度器并安装所需的输出构建回调。",
  compute_mel_spectrogram: "把输入波形转换为 Ming-Omni 音频 encoder 所需的 mel 频谱特征。"
};

function complexity(lines) {
  return lines < 50 ? "simple" : lines <= 200 ? "moderate" : "complex";
}

function symbolSummary(name, type) {
  if (exact[name]) return exact[name];
  const label = `\`${name}\``;
  if (type === "class") {
    if (/State|Data|Result|Resume|Input|Plan|Config|Args|Event|Reference/.test(name)) return `${label} 定义该执行路径使用的结构化状态、配置或数据载荷。`;
    if (/Scheduler|Executor|Encoder|Vocoder|Codec|Pool/.test(name)) return `${label} 封装该阶段的资源、状态和执行生命周期。`;
    return `${label} 封装该模块的一组相关状态与操作。`;
  }
  if (/^(create|make)_/.test(name)) return `${label} 创建并装配对应阶段的执行组件及其依赖。`;
  if (/^build_/.test(name)) return `${label} 从当前请求或流水线状态构建下游所需的数据。`;
  if (/^apply_/.test(name)) return `${label} 将阶段执行结果合并回共享流水线状态。`;
  if (/^load_/.test(name) || /^_load_/.test(name)) return `${label} 加载并规范化该阶段所需的模型、音频或状态资源。`;
  if (/^store_/.test(name) || /^_store_/.test(name)) return `${label} 将当前阶段状态或产物写回共享载荷。`;
  if (/validate|reject/.test(name)) return `${label} 校验配置、输入或拓扑约束，并在不满足时提前失败。`;
  if (/encode|codec/.test(name)) return `${label} 完成音频或参考特征的编码与格式转换。`;
  if (/vocoder|audio_chunk|crossfade/.test(name)) return `${label} 处理 code 到音频的增量解码、拼接或结果封装。`;
  if (/stream|segment|text/.test(name)) return `${label} 处理流式文本或音频的增量状态与边界。`;
  if (/next|stage/.test(name)) return `${label} 根据当前状态解析流水线的下一执行阶段。`;
  if (/sampling|generation/.test(name)) return `${label} 构造或校验模型生成使用的采样参数。`;
  if (/merge|input|payload|state/.test(name)) return `${label} 规范化、合并或转换阶段间的数据载荷。`;
  return `${label} 实现该模块中的内部运行时辅助逻辑。`;
}

function tagsFor(name, type, filePath) {
  const text = `${name} ${filePath}`.toLowerCase();
  const tags = [type];
  if (text.includes("stream")) tags.push("streaming");
  else if (text.includes("request") || text.includes("payload") || text.includes("state")) tags.push("request-data");
  else if (text.includes("config")) tags.push("configuration");
  else tags.push("runtime");
  if (text.includes("vocoder") || text.includes("audio") || text.includes("tts")) tags.push("audio");
  else if (text.includes("scheduler")) tags.push("scheduler");
  else if (text.includes("encoder")) tags.push("encoder");
  else if (text.includes("talker")) tags.push("talker");
  else tags.push("data-flow");
  return [...new Set(tags)].slice(0, 5);
}

const notes = {
  "sglang_omni/models/dots_tts/vocoder_slot_pool.py": "以固定 tensor buffer 保存多路 decoder 历史，减少流式推理中的重复分配。",
  "sglang_omni/models/fishaudio_s2_pro/streaming_vocoder.py": "通过 code 重叠和 waveform crossfade 平滑衔接连续音频块。",
  "sglang_omni/models/ming_omni/components/preprocessor.py": "多模态处理器采用延迟初始化，并显式估算各模态的 token 消耗。",
  "sglang_omni/models/ming_omni/config.py": "配置模型通过阶段拓扑和 GPU 集合校验避免 thinker/talker placement 冲突。"
};

const nodes = [];
const edges = [];
const results = new Map(extraction.results.map((r) => [r.path, r]));

for (const batchFile of input.batchFiles) {
  const r = results.get(batchFile.path);
  if (!r) throw new Error(`缺少结构提取结果: ${batchFile.path}`);
  const [summary, tags] = fileInfo[batchFile.path];
  const fileNode = {
    id: `file:${batchFile.path}`,
    type: "file",
    name: path.posix.basename(batchFile.path),
    filePath: batchFile.path,
    summary,
    tags,
    complexity: complexity(r.nonEmptyLines ?? batchFile.sizeLines)
  };
  if (notes[batchFile.path]) fileNode.languageNotes = notes[batchFile.path];
  nodes.push(fileNode);
  for (const target of input.batchImportData[batchFile.path] ?? []) {
    edges.push({source: fileNode.id, target: `file:${target}`, type: "imports", direction: "forward", weight: 0.7});
  }
  const exported = new Set((r.exports ?? []).map((e) => e?.name).filter((n) => typeof n === "string" && n.length));
  const structs = [
    ...(r.functions ?? []).map((s) => ({...s, nodeType: "function"})),
    ...(r.classes ?? []).map((s) => ({...s, nodeType: "class"}))
  ];
  for (const s of structs) {
    if (typeof s.name !== "string" || !s.name.length) continue;
    const span = Math.max(1, (s.endLine ?? s.startLine ?? 1) - (s.startLine ?? 1) + 1);
    const significant = exported.has(s.name) || span >= (s.nodeType === "function" ? 10 : 20) || (s.nodeType === "class" && (s.methods ?? []).length >= 2);
    if (!significant) continue;
    const id = `${s.nodeType}:${batchFile.path}:${s.name}`;
    nodes.push({id, type: s.nodeType, name: s.name, filePath: batchFile.path, lineRange: [s.startLine, s.endLine], summary: symbolSummary(s.name, s.nodeType), tags: tagsFor(s.name, s.nodeType, batchFile.path), complexity: complexity(span)});
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
  const sources = new Set(partNodes.map((n) => n.id));
  const partEdges = edges.filter((e) => sources.has(e.source));
  output.push({name: `batch-5-part-${i + 1}.json`, contentBase64: Buffer.from(JSON.stringify({nodes: partNodes, edges: partEdges}), "utf8").toString("base64")});
}

const expectedImports = Object.values(input.batchImportData).reduce((sum, values) => sum + values.length, 0);
const actualImports = edges.filter((e) => e.type === "imports").length;
if (expectedImports !== actualImports) throw new Error(`import 边数量不匹配: expected=${expectedImports}, actual=${actualImports}`);
const requestedPart = Number.parseInt(process.argv[2] ?? "0", 10);
const selected = requestedPart > 0 ? output.slice(requestedPart - 1, requestedPart) : output;
console.log(JSON.stringify({nodeCount, edgeCount, expectedImports, actualImports, partCount: output.length, files: selected}));

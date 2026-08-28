import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-24.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-24.json`, "utf8"));

const F = {
  "models/qwen3_omni/components/thinker_fused_rope.py": ["为 Qwen3-Omni Thinker 安装融合 QK 归一化与 RoPE 路径，并根据设备、图模式和配置安全门控。", ["qwen3-omni", "fused-rope", "qk-normalization", "cuda-graph"], "complex"],
  "models/qwen3_omni/components/thinker_model.py": ["以 SGLang 原生层实现 Qwen3-Omni Thinker 的 MoE 文本主干、YaRN RoPE、张量并行注意力和融合权重加载。", ["qwen3-omni", "thinker-model", "mixture-of-experts", "tensor-parallel"], "complex"],
  "models/qwen3_omni/components/vision_compat.py": ["提供 Qwen3-Omni 视觉编码器兼容封装，使不同 Transformers 版本的视觉前向保持统一输出。", ["qwen3-omni", "vision-compat", "transformers"], "complex"],
  "models/qwen3_omni/config.py": ["定义 Qwen3-Omni 文本与语音流水线的阶段拓扑、编码器汇合边、共置部署和模型能力约束。", ["qwen3-omni", "pipeline-config", "stage-routing", "colocation"], "complex"],
  "models/qwen3_omni/hf_config.py": ["定义 Qwen3-Omni 音频、视觉、Thinker、Talker 和码本预测器的 Hugging Face 配置适配器。", ["qwen3-omni", "huggingface-config", "component-config"], "complex"],
  "models/qwen3_omni/merge.py": ["合并音频与视觉编码结果，构造 Thinker 多模态输入、裁剪预处理状态并解码最终事件。", ["qwen3-omni", "multimodal-merge", "thinker-input", "event-decoding"], "complex"],
  "models/qwen3_omni/mrope_positions.py": ["计算 Qwen3-Omni 文本、图像、视频和音频混合序列的向量化 MRoPE 位置，并提供线性快路径。", ["qwen3-omni", "mrope", "position-ids", "vectorization"], "complex"],
  "models/qwen3_omni/payload_types.py": ["定义 Qwen3-Omni 的提示输入、预处理数据、Thinker 输出、跨阶段状态和多模态事件。", ["qwen3-omni", "pipeline-state", "payload-schema"], "moderate"],
  "models/qwen3_omni/pending_text_queue.py": ["以设备张量队列保存 Talker 尚未消费的 Thinker 文本隐藏状态，并支持兼容输入转换。", ["qwen3-omni", "pending-text", "tensor-queue"], "moderate"],
  "models/qwen3_omni/placement.py": ["根据 GPU 数量、显存预算和共置策略决定 Qwen3-Omni 各阶段的设备放置。", ["qwen3-omni", "placement-policy", "gpu-memory", "colocation"], "complex"],
  "models/qwen3_omni/request_builders.py": ["实现 Qwen3-Omni 阶段路由、负载投影、编码器与 Thinker/Talker 请求构建、MRoPE 位置计算和流式调度适配。", ["qwen3-omni", "request-building", "payload-projection", "scheduler-adapter", "mrope"], "complex"],
  "models/qwen3_omni/stages.py": ["实现 Qwen3-Omni 编码器批处理与缓存、共置显存契约，以及预处理、聚合、Thinker、Talker 和解码执行器工厂。", ["qwen3-omni", "pipeline-stages", "encoder-batching", "memory-contract", "cache"], "complex"],
  "models/qwen3_omni/talker_model_runner.py": ["驱动 Qwen3-Omni Talker 的预填充、增量码本预测、文本隐藏状态消费和请求资源生命周期。", ["qwen3-omni", "talker-runner", "code-prediction", "request-lifecycle"], "complex"],
  "models/qwen3_omni/talker_scheduler.py": ["配置 Talker 服务参数并扩展调度器以处理 Qwen3-Omni 的文本隐藏状态流和音频码输出。", ["qwen3-omni", "talker-scheduler", "server-args", "streaming"], "complex"],
  "models/qwen3_omni/thinker_model_runner.py": ["扩展 SGLang 模型运行器以注入音视频嵌入、处理多模态预填充并判定缓存或执行路径。", ["qwen3-omni", "thinker-runner", "multimodal-prefill", "embedding-injection"], "complex"],
  "models/qwen3_tts/__init__.py": ["声明 Qwen3-TTS 的参考音频、批量与流式声码器、CUDA 图和 Torch 编译能力，并公开配置。", ["qwen3-tts", "model-capabilities", "streaming-vocoder"], "simple"],
  "models/qwen3_tts/compat.py": ["为不同 Transformers 版本修补 Qwen3-TTS 的 RoPE 参数与注意力掩码工厂兼容行为。", ["qwen3-tts", "transformers-compat", "rope", "attention-mask"], "moderate"],
  "models/qwen3_tts/config.py": ["定义 Qwen3-TTS 的预处理、自回归引擎和声码器三阶段流水线，并识别 Base 模型变体。", ["qwen3-tts", "pipeline-config", "voice-cloning", "vocoder"], "complex"],
  "models/qwen3_tts/engine_builder.py": ["构建 Qwen3-TTS SGLang 引擎，配置模型、上下文、运行器、适配器和并发请求参数。", ["qwen3-tts", "engine-builder", "sglang-runtime"], "complex"],
  "models/qwen3_tts/model_runner.py": ["协调 Qwen3-TTS Talker 与码本预测器的预填充、解码、请求状态、反馈码和资源清理。", ["qwen3-tts", "model-runner", "code-predictor", "decode-loop"], "complex"],
  "models/qwen3_tts/payload_types.py": ["定义 Qwen3-TTS 请求在预处理、生成和声码器阶段之间传递的状态。", ["qwen3-tts", "pipeline-state", "stage-contract"], "simple"],
  "models/qwen3_tts/request_builders.py": ["规范化 Qwen3-TTS Base、自定义音色和音色设计请求，缓存参考编码，构建 SGLang 请求并应用结果。", ["qwen3-tts", "request-building", "reference-cache", "voice-design", "scheduler-adapter"], "complex"],
  "models/qwen3_tts/sampling_kernels.py": ["提供面向小 Top-K 集合的种子确定性 Triton 采样内核。", ["qwen3-tts", "sampling-kernel", "triton", "deterministic"], "moderate"],
  "models/qwen3_tts/sglang_model.py": ["以 SGLang 原生层实现 Qwen3-TTS Talker、码本预测器和解码 CUDA 图，支持确定性采样与增量缓存。", ["qwen3-tts", "sglang-model", "talker", "code-predictor", "cuda-graph"], "complex"],
  "models/qwen3_tts/stages.py": ["加载 Qwen3-TTS 分词器与配置，按需编译主干，并创建预处理、自回归生成和声码器执行器。", ["qwen3-tts", "pipeline-stages", "executor-factory", "torch-compile"], "complex"]
};

const T = Object.fromEntries(Object.entries(F).map(([path, info]) => [path, info[1].slice(0, 2).join("、")]));
const explicit = {
  "models/qwen3_omni/components/thinker_fused_rope.py:ThinkerFusedRopeGate": "记录融合 RoPE 是否可用、被禁用的原因及运行时命中统计。",
  "models/qwen3_omni/components/thinker_model.py:Qwen3OmniMoeThinkerTextAttention": "实现带 QK 归一化、MRoPE、分页 KV 缓存和张量并行的 Thinker 注意力。",
  "models/qwen3_omni/components/thinker_model.py:Qwen3OmniMoeThinkerTextSparseMoeBlock": "路由词元到稀疏专家，并使用融合 MoE 聚合专家输出。",
  "models/qwen3_omni/components/thinker_model.py:Qwen3OmniMoeThinkerTextDecoderLayer": "组合 Thinker 自注意力、稀疏 MoE 和残差归一化。",
  "models/qwen3_omni/components/thinker_model.py:Qwen3OmniMoeThinkerTextModel": "堆叠 Thinker 解码层，执行文本主干前向并加载融合或分片权重。",
  "models/qwen3_omni/components/vision_compat.py:Qwen3OmniMoeVisionEncoderCompat": "统一不同 Transformers 版本视觉编码器的构造、前向参数和多尺度输出。",
  "models/qwen3_omni/config.py:_Qwen3OmniBasePipelineConfig": "提供 Qwen3-Omni 文本与语音流水线共享的模型路径和能力约束。",
  "models/qwen3_omni/config.py:Qwen3OmniPipelineConfig": "定义只输出文本的 Qwen3-Omni 默认流水线。",
  "models/qwen3_omni/config.py:Qwen3OmniSpeechPipelineConfig": "定义包含 Talker 与 Code2Wav 的语音输出流水线。",
  "models/qwen3_omni/config.py:Qwen3OmniSpeechColocatedPipelineConfig": "定义 Thinker、Talker 与编码器共置的语音流水线布局。",
  "models/qwen3_omni/payload_types.py:Qwen3OmniPipelineState": "保存 Qwen3-Omni 从原始输入、模态特征到 Thinker、Talker 和最终事件的完整状态。",
  "models/qwen3_omni/pending_text_queue.py:PendingTextTensorQueue": "以二维设备张量保存待 Talker 消费的文本隐藏行，并支持追加、弹出和裁剪。",
  "models/qwen3_omni/placement.py:Qwen3OmniPlacementPolicy": "依据阶段需求和设备资源选择进程、GPU 与共置策略。",
  "models/qwen3_omni/request_builders.py:EncoderRequestData": "封装音频或图像编码器请求张量及其元数据。",
  "models/qwen3_omni/stages.py:_ArMemoryContract": "记录共置自回归引擎的静态显存比例和编码器预留预算。",
  "models/qwen3_omni/talker_model_runner.py:QwenTalkerModelRunner": "维护 Talker 请求的预填充和解码状态，消费文本隐藏队列并产生音频码。",
  "models/qwen3_omni/talker_scheduler.py:QwenTalkerScheduler": "在通用调度循环中接入 Talker 专用请求构建、流输出和中止逻辑。",
  "models/qwen3_omni/thinker_model_runner.py:_PrefillDisposition": "表示多模态预填充应执行、复用缓存或跳过的判定。",
  "models/qwen3_omni/thinker_model_runner.py:Qwen3OmniThinkerModelRunner": "准备模态嵌入并控制 Qwen3-Omni Thinker 的预填充与解码执行。",
  "models/qwen3_tts/config.py:Qwen3TTSPipelineConfig": "定义 Qwen3-TTS 三阶段拓扑、参考音频能力和声码器流边。",
  "models/qwen3_tts/engine_builder.py:Qwen3TtsEngineBuilder": "组装 Qwen3-TTS SGLang 模型、运行器、请求适配器和调度参数。",
  "models/qwen3_tts/model_runner.py:Qwen3TTSModelRunner": "协调 Talker 主干与多码本预测器的逐步生成、反馈和请求资源生命周期。",
  "models/qwen3_tts/payload_types.py:Qwen3TTSState": "保存任务类型、文本、音色、参考编码、生成码和输出波形等跨阶段数据。",
  "models/qwen3_tts/request_builders.py:Qwen3TTSSGLangRequestData": "封装 Qwen3-TTS 发送给调度器的输入词元、采样参数和请求状态。",
  "models/qwen3_tts/request_builders.py:Qwen3TTSPreparedRequest": "缓存已经完成参考编码和提示构造的 TTS 请求。",
  "models/qwen3_tts/request_builders.py:Qwen3TTSPreprocessingContext": "保存当前预处理任务的模型、设备和参考编码上下文。",
  "models/qwen3_tts/request_builders.py:_Qwen3TTSRefCodeBatcher": "在线程和独立 CUDA 流中批量编码参考音频码，并隔离单项失败。",
  "models/qwen3_tts/request_builders.py:_Qwen3TTSAdhocReferenceHook": "为临时参考音频服务提供缓存键、批处理和结果写回策略。",
  "models/qwen3_tts/sglang_model.py:_PredictorDecodeGraph": "捕获并回放 Qwen3-TTS 码本预测器的单步解码 CUDA 图。",
  "models/qwen3_tts/sglang_model.py:Qwen3TTSTalkerDecoderLayer": "组合 Talker 注意力与前馈网络形成单层解码器。",
  "models/qwen3_tts/sglang_model.py:Qwen3TTSTalkerTextModel": "执行 Qwen3-TTS Talker 文本主干并维护 KV 缓存。",
  "models/qwen3_tts/sglang_model.py:Qwen3TTSCodePredictor": "根据 Talker 隐藏状态逐级预测剩余音频码本。",
  "models/qwen3_tts/sglang_model.py:Qwen3TTSTalker": "协调文本主干、码本预测器、采样缓冲与 CUDA 图生成完整音频码。"
};

const wordMap = {
  ar: "自回归", audio: "音频", image: "图像", encoder: "编码器", thinker: "Thinker", talker: "Talker", vocoder: "声码器", code2wav: "Code2Wav", preprocessing: "预处理", aggregate: "聚合", decode: "解码", stage: "阶段", stages: "阶段", stream: "流式", streaming: "流式", output: "输出", input: "输入", request: "请求", result: "结果", state: "状态", payload: "负载", cache: "缓存", key: "键", seed: "种子", sampling: "采样", voice: "音色", reference: "参考", model: "模型", config: "配置", rope: "RoPE", mrope: "MRoPE", position: "位置", positions: "位置", tensor: "张量", feature: "特征", features: "特征", prompt: "提示", modality: "模态", multimodal: "多模态", memory: "显存", contract: "契约", batch: "批次", batched: "批量", scheduler: "调度器", adapter: "适配器", context: "上下文", text: "文本", token: "词元", tokens: "词元", embedding: "嵌入", embeddings: "嵌入", graph: "图", cuda: "CUDA", predictor: "预测器", code: "码", codes: "码", queue: "队列", runner: "运行器", factory: "工厂", kernel: "内核", placement: "放置", fused: "融合", qkv: "QKV", moe: "MoE", proj: "投影", projection: "投影", mask: "掩码", language: "语言", instruct: "指令", uploaded: "上传", custom: "自定义", design: "设计", clone: "克隆", terminal: "终端", source: "来源", targets: "目标", wait: "等待", active: "活跃", single: "单一", grid: "网格", visual: "视觉", hidden: "隐藏", size: "大小", revision: "版本", hash: "哈希", task: "任务", type: "类型", prepared: "已准备", finish: "结束", reason: "原因", backbone: "主干", tokenizer: "分词器", defaults: "默认值", compat: "兼容", compatibility: "兼容", linear: "线性", normalize: "规范化", local: "本地", optional: "可选", child: "子", consumer: "消费者", consumerstream: "消费流", server: "服务", args: "参数", next: "后继", branches: "分支", fields: "字段", present: "存在", lightweight: "轻量", merge: "合并", pad: "填充", fast: "快速", path: "路径", top: "Top", sorted: "排序", logprobs: "对数概率"
};

function words(name) {
  return name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1_$2").split("_").filter(Boolean).map((x) => wordMap[x.toLowerCase()] || x).join(" ");
}

function summaryFor(path, kind, name) {
  const key = `${path}:${name}`;
  if (explicit[key]) return explicit[key];
  const label = words(name), topic = T[path];
  if (kind === "class") {
    if (/(Config|Args)$/.test(name)) return `定义${label}，保存${topic}所需的配置字段。`;
    if (/(State|Data|Context|Result|Key|Input|Contract|Gate)$/.test(name)) return `定义${label}数据结构，用于${topic}中的状态传递与校验。`;
    if (/Runner$/.test(name)) return `实现${label}，负责${topic}的执行、缓存和生命周期管理。`;
    if (/Scheduler$/.test(name)) return `实现${label}，协调${topic}的请求调度与结果输出。`;
    return `实现${label}，封装${topic}中的核心状态与处理流程。`;
  }
  const rules = [
    [/^create_/, "创建"], [/^build_/, "构建"], [/^make_/, "组装"], [/^resolve_/, "解析"], [/^validate_/, "校验"], [/^normalize_/, "规范化"], [/^apply_/, "应用"], [/^install_/, "安装"], [/^configure_/, "配置"], [/^load_/, "加载"], [/^store_/, "写回"], [/^project_/, "投影"], [/^merge_/, "合并"], [/^compute_/, "计算"], [/^extract_/, "提取"], [/^derive_/, "派生"], [/^set_/, "设置"], [/^clear_/, "清除"], [/^cleanup_/, "清理"], [/^pop_/, "取出"], [/^has_/, "判断"], [/^should_/, "判断"], [/^references_/, "检查"], [/^output_/, "确定"], [/^coerce_/, "转换"], [/^sample_/, "采样"], [/^preprocess_/, "预处理"], [/^linear_/, "计算"], [/^talker_can_/, "判断"], [/^get_/, "获取"], [/^_is_/, "判断"], [/^_has_/, "判断"], [/^_validate_/, "校验"], [/^_normalize_/, "规范化"], [/^_resolve_/, "解析"], [/^_build_/, "构建"], [/^_make_/, "创建"], [/^_load_/, "加载"], [/^_store_/, "保存"], [/^_apply_/, "应用"], [/^_compute_/, "计算"], [/^_extract_/, "提取"], [/^_project_/, "投影"], [/^_select_/, "选择"], [/^_copy_/, "复制"], [/^_split_/, "拆分"], [/^_batch_/, "批量处理"], [/^_pad_/, "填充"], [/^_trace_/, "记录"], [/^_lookup_/, "查询"], [/^_grid_/, "计算"], [/^_new_/, "创建"], [/^_record_/, "记录"], [/^_register_/, "注册"], [/^_compile_/, "编译"], [/^_prune_/, "裁剪"], [/^_cast_/, "转换"], [/^_non_empty/, "判断"]
  ];
  const action = (rules.find(([re]) => re.test(name)) || [null, "执行"])[1];
  return `${action}${label}逻辑，服务于${topic}的阶段协作与运行时处理。`;
}

const id = (kind, path, name) => `${kind}:${path}${name ? `:${name}` : ""}`;
const slug = (name) => name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
const complexity = (start, end, kind) => { const span = end - start + 1; return span > 150 ? "complex" : span > 45 || (kind === "class" && span > 20) ? "moderate" : "simple"; };

const nodes = [], edges = [], localSymbols = new Map();
for (const result of extracted.results) {
  const path = result.path, info = F[path];
  if (!info) throw new Error(`缺少文件说明: ${path}`);
  const fileType = result.fileCategory === "code" ? "file" : "document", fileId = id(fileType, path);
  nodes.push({ id: fileId, type: fileType, name: path.split("/").at(-1), filePath: path, summary: info[0], tags: info[1], complexity: info[2] });
  const exported = new Set((result.exports || []).map((x) => x.name)), map = new Map();
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) {
    for (const item of list) {
      const sid = id(kind, path, item.name), tags = [...new Set([info[1][0], info[1][1], slug(item.name), kind])].slice(0, 5);
      nodes.push({ id: sid, type: kind, name: item.name, filePath: path, lineRange: [item.startLine, item.endLine], summary: summaryFor(path, kind, item.name), tags, complexity: complexity(item.startLine, item.endLine, kind) });
      map.set(item.name, sid);
      edges.push({ source: fileId, target: sid, type: "contains", direction: "forward", weight: 1 });
      if (exported.has(item.name)) edges.push({ source: fileId, target: sid, type: "exports", direction: "forward", weight: 0.8 });
    }
  }
  localSymbols.set(path, map);
}
for (const [sourcePath, targets] of Object.entries(input.batchImportData)) for (const targetPath of targets) edges.push({ source: id("file", sourcePath), target: id(targetPath.endsWith(".md") ? "document" : "file", targetPath), type: "imports", direction: "forward", weight: 0.7 });

const edgeKeys = new Set(edges.map((e) => `${e.source}|${e.target}|${e.type}`));
let callEdgesAdded = 0;
for (const result of extracted.results) {
  const map = localSymbols.get(result.path);
  for (const call of result.callGraph || []) {
    const source = map.get(call.caller), target = map.get(call.callee), key = `${source}|${target}|calls`;
    if (source && target && source !== target && !edgeKeys.has(key) && callEdgesAdded < 80) {
      edges.push({ source, target, type: "calls", direction: "forward", weight: 0.8 });
      edgeKeys.add(key);
      callEdgesAdded += 1;
    }
  }
}

const D = [
  ["function", "models/qwen3_omni/components/thinker_fused_rope.py", "install_thinker_fused_rope", "class", "models/qwen3_omni/components/thinker_fused_rope.py", "ThinkerFusedRopeGate"],
  ["class", "models/qwen3_omni/components/thinker_model.py", "Qwen3OmniMoeThinkerTextDecoderLayer", "class", "models/qwen3_omni/components/thinker_model.py", "Qwen3OmniMoeThinkerTextAttention"],
  ["class", "models/qwen3_omni/components/thinker_model.py", "Qwen3OmniMoeThinkerTextDecoderLayer", "class", "models/qwen3_omni/components/thinker_model.py", "Qwen3OmniMoeThinkerTextSparseMoeBlock"],
  ["function", "models/qwen3_omni/merge.py", "build_thinker_inputs", "function", "models/qwen3_omni/mrope_positions.py", "get_rope_index_qwen3_omni_vectorized"],
  ["function", "models/qwen3_omni/request_builders.py", "build_sglang_thinker_request", "function", "models/qwen3_omni/request_builders.py", "_compute_mrope_positions"],
  ["function", "models/qwen3_omni/request_builders.py", "build_sglang_talker_request", "class", "models/qwen3_omni/pending_text_queue.py", "PendingTextTensorQueue"],
  ["function", "models/qwen3_omni/stages.py", "create_sglang_thinker_executor_from_config", "class", "models/qwen3_omni/thinker_model_runner.py", "Qwen3OmniThinkerModelRunner"],
  ["function", "models/qwen3_omni/stages.py", "create_talker_ar_executor_from_config", "class", "models/qwen3_omni/talker_model_runner.py", "QwenTalkerModelRunner"],
  ["class", "models/qwen3_omni/talker_scheduler.py", "QwenTalkerScheduler", "class", "models/qwen3_omni/talker_model_runner.py", "QwenTalkerModelRunner"],
  ["class", "models/qwen3_tts/engine_builder.py", "Qwen3TtsEngineBuilder", "class", "models/qwen3_tts/model_runner.py", "Qwen3TTSModelRunner"],
  ["class", "models/qwen3_tts/model_runner.py", "Qwen3TTSModelRunner", "class", "models/qwen3_tts/sglang_model.py", "Qwen3TTSTalker"],
  ["class", "models/qwen3_tts/request_builders.py", "_Qwen3TTSAdhocReferenceHook", "class", "models/qwen3_tts/request_builders.py", "_Qwen3TTSRefCodeBatcher"],
  ["function", "models/qwen3_tts/request_builders.py", "build_sglang_qwen3_tts_request", "class", "models/qwen3_tts/request_builders.py", "Qwen3TTSSGLangRequestData"],
  ["class", "models/qwen3_tts/sglang_model.py", "Qwen3TTSTalker", "class", "models/qwen3_tts/sglang_model.py", "Qwen3TTSCodePredictor"],
  ["function", "models/qwen3_tts/stages.py", "create_sglang_tts_engine_executor", "class", "models/qwen3_tts/engine_builder.py", "Qwen3TtsEngineBuilder"]
];
for (const [sk, sp, sn, tk, tp, tn] of D) {
  const source = id(sk, sp, sn), target = id(tk, tp, tn), key = `${source}|${target}|depends_on`;
  if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) throw new Error(`语义边端点不存在: ${source} -> ${target}`);
  if (!edgeKeys.has(key)) { edges.push({ source, target, type: "depends_on", direction: "forward", weight: 0.6 }); edgeKeys.add(key); }
}

const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
const paths = extracted.results.map((x) => x.path).sort(), chunkSize = Math.ceil(paths.length / partCount), parts = [];
for (let i = 0; i < partCount; i++) {
  const allowed = new Set(paths.slice(i * chunkSize, (i + 1) * chunkSize)), partNodes = nodes.filter((n) => allowed.has(n.filePath)), local = new Set(partNodes.map((n) => n.id));
  parts.push({ nodes: partNodes, edges: edges.filter((e) => local.has(e.source)) });
}
const selected = Number(process.argv[2] || 0);
for (let i = 0; i < parts.length; i++) {
  if (selected && selected !== i + 1) continue;
  const name = partCount === 1 ? "batch-24.json" : `batch-24-part-${i + 1}.json`, json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}
if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

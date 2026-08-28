import fs from "node:fs";

const root = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${root}/tmp/ua-file-extract-results-16.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${root}/tmp/ua-file-analyzer-input-16.json`, "utf8"));

const fileInfo = {
  "models/audar_tts/__init__.py": ["声明 Audar TTS 模型能力，公开参考音频支持和流水线配置入口。", ["audar-tts", "model-capabilities", "pipeline-config"], "simple"],
  "models/audar_tts/config.py": ["定义 Audar TTS 的四阶段流水线，把预处理、参考音频编码、语言模型生成和声码器解码串联起来。", ["audar-tts", "pipeline-config", "stage-routing"], "moderate"],
  "models/audar_tts/payload_types.py": ["定义 Audar TTS 在各流水线阶段之间传递的文本、参考音频、提示词、音频码和生成参数状态。", ["audar-tts", "payload-state", "stage-contract"], "simple"],
  "models/audar_tts/protocol.py": ["实现 Audar 模型的提示词协议，组装参考语音码与目标文本，并从模型输出中解析离散语音码。", ["audar-tts", "prompt-protocol", "speech-codes"], "simple"],
  "models/audar_tts/request_builders.py": ["校验并规范化 Audar TTS 请求，解析单个带转写的参考音频，并生成模型推理参数和跨阶段状态。", ["audar-tts", "request-building", "input-validation"], "moderate"],
  "models/audar_tts/stages.py": ["实现 Audar TTS 各阶段执行器，包括参考音频加载与缓存、NeuCodec 编码、llama.cpp 文本到语音码生成及声码器解码。", ["audar-tts", "pipeline-stages", "reference-encoding", "vocoder"], "complex"],
  "models/dots_tts/__init__.py": ["声明 Dots TTS 的参考音频、批量与流式声码器以及 Torch 编译能力，并公开流水线配置。", ["dots-tts", "model-capabilities", "streaming-vocoder"], "simple"],
  "models/dots_tts/codec.py": ["加载并缓存 Dots 音频编解码器，按等长音频分组提取说话人嵌入和提示潜变量，并提供可缓存的参考音频编码服务。", ["dots-tts", "audio-codec", "speaker-embedding", "reference-cache"], "complex"],
  "models/dots_tts/config.py": ["定义 Dots TTS 的预处理、参考编码、潜变量生成和声码器四阶段流水线及其并发和步数约束。", ["dots-tts", "pipeline-config", "flow-generation", "vocoder"], "moderate"],
  "models/dots_tts/engine_builder.py": ["构建 Dots TTS 的 SGLang 潜变量生成引擎，配置模型架构、上下文预算、运行请求数和运行时适配器。", ["dots-tts", "engine-builder", "sglang-runtime"], "moderate"],
  "models/dots_tts/flow_head.py": ["实现 Dots TTS 的 Patch 编码器、Flow/MeanFlow DiT 与结束判定头，并维护按请求推进的声学潜变量生成状态。", ["dots-tts", "flow-matching", "dit", "latent-generation"], "complex"],
  "models/dots_tts/hf_config.py": ["提供 Dots TTS 的 Hugging Face 配置兼容层，并将其注册到 Transformers 自动配置系统。", ["dots-tts", "huggingface-config", "model-registration"], "simple"],
  "models/dots_tts/model_runner.py": ["把 Dots Flow 声学生成接入 SGLang 的预填充与解码循环，处理反馈潜变量、请求挂起回收、结束判定和资源清理。", ["dots-tts", "model-runner", "decode-loop", "request-lifecycle"], "complex"],
  "models/dots_tts/payload_types.py": ["定义 Dots TTS 跨阶段状态及其从调度请求中读取和写回的辅助函数。", ["dots-tts", "payload-state", "scheduler-contract"], "simple"],
  "models/dots_tts/request_builders.py": ["把 Dots 生成计划转换为 SGLang 请求，控制预填充与音频跨度，并把流式潜变量和最终统计写回流水线状态。", ["dots-tts", "request-building", "streaming-output", "generation-state"], "moderate"],
  "models/dots_tts/sglang_model.py": ["实现可由 SGLang 加载的 Dots TTS 模型封装，将 Qwen2 主干与 Flow 声学头组合并支持分片权重加载和图反馈缓冲区。", ["dots-tts", "sglang-model", "qwen2", "weight-loading"], "moderate"],
  "models/dots_tts/stages.py": ["实现 Dots TTS 的输入计划构建和四阶段执行器工厂，并按运行设备配置优化内核、参考编码、潜变量引擎与流式声码器。", ["dots-tts", "pipeline-stages", "kernel-optimization", "streaming-vocoder"], "complex"],
  "models/dots_tts/tail.py": ["实现面向槽位池的 Dots 声学尾部，融合 Patch 编码和 MeanFlow DiT，管理显存预算、因果掩码、旋转位置编码及 CUDA 图执行。", ["dots-tts", "acoustic-tail", "slot-pool", "cuda-graph", "memory-planning"], "complex"],
  "models/dots_tts/vocoder.py": ["提供 Dots 音频 VAE 的批量和流式声码器，合并等时间步请求并维护每个流的槽位与待解码潜变量。", ["dots-tts", "vocoder", "streaming-audio", "batching"], "complex"],
  "models/dots_tts/vocoder_slot_pool.py": ["管理流式声码器的固定槽位、因果解码缓存和逐请求帧计数，使不同长度的流可在等时间步批次中共同解码。", ["dots-tts", "vocoder-slot-pool", "streaming-state", "batching"], "complex"],
  "models/fishaudio_s2_pro/README.md": ["介绍 FishAudio S2-Pro 在 SGLang Omni 中的三阶段 TTS 架构、Dual-AR 集成、性能优化、GPU 注意力后端策略和精度注意事项。", ["fishaudio-s2", "architecture", "dual-ar", "performance"], "moderate"],
  "models/fishaudio_s2_pro/__init__.py": ["声明 FishAudio S2-Pro 的参考音频、批量与流式声码器、CUDA 图和 Torch 编译能力，并公开配置模块。", ["fishaudio-s2", "model-capabilities", "cuda-graph"], "simple"],
  "models/fishaudio_s2_pro/bootstrap.py": ["准备 FishAudio S2-Pro 解码运行时，修补配置兼容字段、加载 Fast-AR 音频解码器、修正缓存精度并分配持久解码缓冲区。", ["fishaudio-s2", "runtime-bootstrap", "fast-ar", "checkpoint-loading"], "moderate"],
  "models/fishaudio_s2_pro/config.py": ["定义 FishAudio S2-Pro 的预处理、SGLang Dual-AR 生成和声码器三阶段流式流水线。", ["fishaudio-s2", "pipeline-config", "dual-ar"], "simple"],
  "models/fishaudio_s2_pro/engine_builder.py": ["构建 FishAudio S2-Pro 的 SGLang 引擎，按 GPU 架构选择 Fast-AR 注意力后端，并完成模型引导、编译、运行器和调度适配器配置。", ["fishaudio-s2", "engine-builder", "attention-backend", "sglang-runtime"], "moderate"]
};

const symbolSummary = {
  "models/audar_tts/config.py:_stages": "创建 Audar TTS 的四个阶段配置，并连接参考编码、语音码生成和声码器的数据流。",
  "models/audar_tts/config.py:AudarTTSPipelineConfig": "描述 Audar TTS 模型路径、参考语音约束、语言能力和默认阶段拓扑。",
  "models/audar_tts/payload_types.py:AudarTTSState": "承载 Audar 请求从输入规范化到最终音频解码所需的全部中间数据。",
  "models/audar_tts/protocol.py:build_prompt": "把参考转写、离散语音码和目标文本编码为 Audar 模型要求的带标签提示词。",
  "models/audar_tts/protocol.py:parse_speech_codes": "从生成文本的语音标签中提取整数音频码序列。",
  "models/audar_tts/request_builders.py:build_audar_state": "规范化请求输入与参考音频，构造提示词并生成完整的 Audar 跨阶段状态。",
  "models/audar_tts/request_builders.py:build_generation_kwargs": "合并 Audar 默认生成参数与请求覆盖项，并执行参数合法性检查。",
  "models/audar_tts/request_builders.py:_normalize_inputs": "统一读取请求的文本和可选字段，拒绝不符合 Audar 接口契约的输入。",
  "models/audar_tts/request_builders.py:_reference_from_value": "把路径、字节或数据 URI 等单个值转换为标准参考音频对象。",
  "models/audar_tts/request_builders.py:_normalize_reference_audio": "确认请求仅包含一个带转写的参考音频，并将其规范化为统一表示。",
  "models/audar_tts/request_builders.py:_validate_generation_kwargs": "检查采样温度、概率阈值和最大生成长度等参数范围。",
  "models/audar_tts/stages.py:_ReferenceInput": "封装规范化后的参考音频内容及其转写文本。",
  "models/audar_tts/stages.py:_load_codec": "按模型和设备加载或复用 NeuCodec 实例。",
  "models/audar_tts/stages.py:_codec_lock": "为共享编解码器返回串行化推理访问的互斥锁。",
  "models/audar_tts/stages.py:_device": "把阶段设备配置规范化为 Torch 设备对象。",
  "models/audar_tts/stages.py:_normalize_reference": "解析并校验参考音频对象，生成内部参考输入。",
  "models/audar_tts/stages.py:_reference_key": "根据参考音频内容和转写生成稳定缓存键。",
  "models/audar_tts/stages.py:_load_reference_waveform": "加载参考波形、转为目标采样率并验证允许的时长范围。",
  "models/audar_tts/stages.py:_encode_reference": "调用 NeuCodec 将参考波形编码为 Audar 提示词所用的离散语音码。",
  "models/audar_tts/stages.py:_AudarReferenceEncodeHook": "为参考编码服务提供缓存键、批处理策略和结果写回钩子。",
  "models/audar_tts/stages.py:create_preprocessing_executor": "创建把原始请求转换为 AudarTTSState 的 CPU 预处理执行器。",
  "models/audar_tts/stages.py:create_reference_encoder_executor": "创建带缓存的参考语音编码执行器并加载共享 NeuCodec。",
  "models/audar_tts/stages.py:_resolve_gguf": "解析本地或模型仓库中的 GGUF 权重文件路径。",
  "models/audar_tts/stages.py:create_tts_engine_executor": "创建基于 llama.cpp 的 Audar 语音码生成执行器。",
  "models/audar_tts/stages.py:create_vocoder_executor": "创建将 Audar 离散语音码解码为波形的终端执行器。",
  "models/audar_tts/stages.py:_load_state": "从阶段负载中读取并验证 AudarTTSState。",
  "models/audar_tts/stages.py:_store_state": "把更新后的 AudarTTSState 写回阶段负载。",
  "models/dots_tts/codec.py:_load_module": "从安全张量权重中严格加载指定前缀的 Dots 子模块并报告不匹配项。",
  "models/dots_tts/codec.py:DotsAudioCodec": "组合 AudioVAE 与说话人编码器，批量提取参考音频的说话人嵌入和提示潜变量。",
  "models/dots_tts/codec.py:load_dots_audio_codec": "按检查点与设备缓存并返回共享的 DotsAudioCodec。",
  "models/dots_tts/codec.py:_DotsReferenceHook": "定义参考音频缓存、等长分组批处理和编码结果写回策略。",
  "models/dots_tts/codec.py:DotsReferenceEncoder": "封装 Dots 参考音频编码服务，为请求生成并保存说话人嵌入和提示潜变量。",
  "models/dots_tts/config.py:DotsVocoderFactoryArgs": "保存流式声码器最大槽位数等工厂参数。",
  "models/dots_tts/config.py:DotsVocoderStageConfig": "扩展阶段配置以携带 Dots 声码器专用工厂参数。",
  "models/dots_tts/config.py:DotsTTSPipelineConfig": "定义 Dots 四阶段流水线、模型约束、生成步数和最大音频长度等配置。",
  "models/dots_tts/engine_builder.py:DotsTTSEngineBuilder": "根据流水线参数组装 Dots 潜变量引擎、模型运行器和调度适配器。",
  "models/dots_tts/flow_head.py:DotsFlowState": "维护单个请求的 Flow/MeanFlow 采样进度、随机状态、提示块和槽位信息。",
  "models/dots_tts/flow_head.py:DotsFlowStep": "表示一次声学生成步产生的潜变量块、反馈、结束状态和输出标志。",
  "models/dots_tts/flow_head.py:DotsTTSFlowHead": "执行 Patch 编码、Flow/MeanFlow DiT 去噪和结束预测，支持分桶批处理与增量状态推进。",
  "models/dots_tts/hf_config.py:DotsTTSConfig": "把 Dots 模型配置映射为 Transformers 可识别的预训练配置。",
  "models/dots_tts/hf_config.py:register_dots_tts_hf_config": "将 Dots 配置类注册到 Hugging Face 自动配置注册表。",
  "models/dots_tts/model_runner.py:_DotsFlowLaunchBuf": "暂存一次批量 Flow 启动所需的请求索引和隐藏状态。",
  "models/dots_tts/model_runner.py:DotsTTSModelRunner": "协调 SGLang 文本主干与 Dots Flow 头的增量解码、反馈注入和请求资源生命周期。",
  "models/dots_tts/payload_types.py:DotsTTSState": "保存 Dots 请求的生成计划、提示潜变量、说话人嵌入、输出潜变量和统计信息。",
  "models/dots_tts/payload_types.py:load_dots_tts_state": "从调度请求数据中读取并校验 DotsTTSState。",
  "models/dots_tts/payload_types.py:store_dots_tts_state": "把 DotsTTSState 写回调度请求数据。",
  "models/dots_tts/request_builders.py:DotsFlowResume": "描述 Flow 解码恢复点及其待反馈潜变量。",
  "models/dots_tts/request_builders.py:DotsTTSSGLangRequestData": "封装 Dots 发送给 SGLang 调度器的请求字段和 Flow 恢复信息。",
  "models/dots_tts/request_builders.py:build_sglang_dots_tts_request": "依据音频跨度和生成计划构建预填充或续跑的 SGLang 请求。",
  "models/dots_tts/request_builders.py:build_stream_output": "把新生成的潜变量块包装为可发送给下游声码器的流式输出。",
  "models/dots_tts/request_builders.py:apply_latent_result": "合并潜变量生成结果，更新状态、用量统计和结束信息。",
  "models/dots_tts/sglang_model.py:DotsTTSSGLangModel": "组合 Qwen2 主干和 Dots Flow 头，接收图反馈并按 SGLang 权重格式加载模型。",
  "models/dots_tts/stages.py:_device": "从阶段工厂参数解析 Torch 设备。",
  "models/dots_tts/stages.py:_configure_optimized_kernels": "按设备和编译选项配置 Dots DiT 的融合与优化内核。",
  "models/dots_tts/stages.py:_first_not_none": "从候选值中返回第一个非空项。",
  "models/dots_tts/stages.py:_dict": "把可选映射值规范化为普通字典。",
  "models/dots_tts/stages.py:_inputs": "提取并校验流水线负载中的请求输入映射。",
  "models/dots_tts/stages.py:_reference_path": "从多种参考音频表示中解析可供编码器读取的路径或内容。",
  "models/dots_tts/stages.py:preprocess_dots_tts_payload": "解析文本与参考输入，构造模板、音频跨度、采样调度和 DotsTTSState。",
  "models/dots_tts/stages.py:_load_model_metadata": "从模型配置加载 Dots 生成所需的标记和声学维度元数据。",
  "models/dots_tts/stages.py:create_preprocessing_executor": "创建 Dots 请求预处理执行器。",
  "models/dots_tts/stages.py:create_reference_encode_executor": "创建共享编解码器与缓存服务驱动的参考音频编码执行器。",
  "models/dots_tts/stages.py:create_sglang_latent_engine_executor": "创建生成声学潜变量的 SGLang 引擎执行器。",
  "models/dots_tts/stages.py:create_vocoder_executor": "按配置创建批量或槽位池流式 Dots 声码器执行器。",
  "models/dots_tts/tail.py:_project_attention": "投影查询、键和值并把键值写入当前批次的注意力缓存。",
  "models/dots_tts/tail.py:_AutocastFusedDiT": "在自动混合精度环境中封装融合后的 DiT 推理路径。",
  "models/dots_tts/tail.py:fuse_dit_for_inference": "将 DiT 模块替换为面向推理的融合实现。",
  "models/dots_tts/tail.py:_SemanticEncoderDecodeStep": "执行语义编码器的单步增量解码并更新缓存。",
  "models/dots_tts/tail.py:DotsTtsTailSpec": "定义声学尾部的维度、步数、槽位容量和显存约束。",
  "models/dots_tts/tail.py:_dtype_nbytes": "返回 Torch 数据类型的单元素字节数。",
  "models/dots_tts/tail.py:_gib": "把字节数换算为 GiB。",
  "models/dots_tts/tail.py:AcousticPoolMemoryEstimate": "记录声学槽位池各组成部分和峰值的显存估算。",
  "models/dots_tts/tail.py:estimate_acoustic_pool_bytes": "按模型规格估算声学槽位池、缓存和工作区显存。",
  "models/dots_tts/tail.py:validate_acoustic_pool_memory": "将显存估算与可用预算比较，并在超限时给出可操作错误。",
  "models/dots_tts/tail.py:_CapturedTailGraph": "保存一次声学尾部 CUDA 图及其静态输入输出缓冲区。",
  "models/dots_tts/tail.py:batched_causal_update_mask": "为不同有效长度的槽位批量构造增量因果注意力掩码。",
  "models/dots_tts/tail.py:_rotary_cos_sin": "计算指定位置的旋转位置编码余弦和正弦值。",
  "models/dots_tts/tail.py:DotsTtsAcousticTail": "以固定槽位池批量推进 Patch 编码和 MeanFlow DiT，支持缓存、显存保护和 CUDA 图复用。",
  "models/dots_tts/vocoder.py:DotsTTSBatchVocoder": "把完成请求的潜变量批量送入 AudioVAE 并返回完整音频。",
  "models/dots_tts/vocoder.py:_DotsStreamState": "记录单个流式请求的声码器槽位、待处理潜变量和接收进度。",
  "models/dots_tts/vocoder.py:_DotsCoalescedStepPlan": "描述一次合并声码器步中的请求集合和共同解码长度。",
  "models/dots_tts/vocoder.py:DotsTTSStreamingVocoder": "管理请求槽位并合并等时间步潜变量，以批量方式增量解码和输出音频块。",
  "models/dots_tts/vocoder_slot_pool.py:append_decoder_input_per_row": "按行有效帧数把新潜变量追加到各槽位的解码器输入窗口。",
  "models/dots_tts/vocoder_slot_pool.py:DotsVocoderSlotPool": "维护独立流的因果解码状态和计数器，并组织等时间步批量 AudioVAE 推理。",
  "models/fishaudio_s2_pro/bootstrap.py:_rematerialize_audio_decoder_buffers": "在真实设备上重建检查点未持久化的码本偏移和 RoPE 频率缓冲区。",
  "models/fishaudio_s2_pro/bootstrap.py:patch_fish_config_for_sglang": "为 Fish 配置类注入 SGLang 所需的标准字段别名和架构名称。",
  "models/fishaudio_s2_pro/bootstrap.py:truncate_rope_to_bf16": "原地模拟训练时 BF16 RoPE 缓存精度，避免推理 logits 偏离。",
  "models/fishaudio_s2_pro/bootstrap.py:load_audio_decoder": "严格加载 Fast-AR 音频解码器、重建缓冲区并返回码本元数据和分词器。",
  "models/fishaudio_s2_pro/bootstrap.py:bootstrap_text_model_for_decode": "把 Fast-AR 码本头挂接到文本模型并分配固定批量解码缓存。",
  "models/fishaudio_s2_pro/config.py:S2ProPipelineConfig": "配置 FishAudio S2-Pro 的预处理、流式 Dual-AR 引擎和声码器阶段。",
  "models/fishaudio_s2_pro/engine_builder.py:_resolve_fast_ar_attention_backend": "按 GPU 计算能力选择已验证的 FA3 或 FlashInfer 后端并检查依赖可用性。",
  "models/fishaudio_s2_pro/engine_builder.py:FishS2ProEngineBuilder": "配置并启动 Fish S2-Pro 的 Slow-AR 与 Fast-AR 模型、运行器和调度接口。"
};

function nodeId(kind, path, name) {
  return `${kind}:${path}${name ? `:${name}` : ""}`;
}

function slug(name) {
  return name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}

function complexity(start, end, kind) {
  const span = end - start + 1;
  if (span > 150) return "complex";
  if (span > 45 || (kind === "class" && span > 20)) return "moderate";
  return "simple";
}

const nodes = [];
const edges = [];
const symbols = new Map();

for (const result of extracted.results) {
  const path = result.path;
  const info = fileInfo[path];
  if (!info) throw new Error(`缺少文件说明: ${path}`);
  const isDoc = result.fileCategory !== "code";
  const fileKind = isDoc ? "document" : "file";
  const fid = nodeId(fileKind, path);
  nodes.push({
    id: fid,
    type: fileKind,
    name: path.split("/").at(-1),
    filePath: path,
    summary: info[0],
    tags: info[1],
    complexity: info[2]
  });
  const exports = new Set((result.exports || []).map((x) => x.name));
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) {
    for (const item of list) {
      const key = `${path}:${item.name}`;
      const summary = symbolSummary[key];
      if (!summary) throw new Error(`缺少符号说明: ${key}`);
      const sid = nodeId(kind, path, item.name);
      const tags = [...new Set([info[1][0], info[1][1], slug(item.name)])].slice(0, 5);
      nodes.push({
        id: sid,
        type: kind,
        name: item.name,
        filePath: path,
        lineRange: [item.startLine, item.endLine],
        summary,
        tags,
        complexity: complexity(item.startLine, item.endLine, kind)
      });
      symbols.set(key, sid);
      edges.push({ source: fid, target: sid, type: "contains", direction: "forward", weight: 1 });
      if (exports.has(item.name)) {
        edges.push({ source: fid, target: sid, type: "exports", direction: "forward", weight: 0.8 });
      }
    }
  }
}

for (const [sourcePath, targets] of Object.entries(input.batchImportData)) {
  for (const targetPath of targets) {
    edges.push({
      source: nodeId("file", sourcePath),
      target: nodeId(targetPath.endsWith(".md") ? "document" : "file", targetPath),
      type: "imports",
      direction: "forward",
      weight: 0.7
    });
  }
}

const semantic = [
  ["function", "models/audar_tts/request_builders.py:build_audar_state", "function", "models/audar_tts/request_builders.py:_normalize_inputs", "calls", 0.8],
  ["function", "models/audar_tts/request_builders.py:build_audar_state", "function", "models/audar_tts/request_builders.py:_normalize_reference_audio", "calls", 0.8],
  ["function", "models/audar_tts/request_builders.py:build_audar_state", "function", "models/audar_tts/request_builders.py:build_generation_kwargs", "calls", 0.8],
  ["function", "models/audar_tts/request_builders.py:build_generation_kwargs", "function", "models/audar_tts/request_builders.py:_validate_generation_kwargs", "calls", 0.8],
  ["function", "models/audar_tts/stages.py:create_preprocessing_executor", "function", "models/audar_tts/request_builders.py:build_audar_state", "depends_on", 0.6],
  ["function", "models/audar_tts/stages.py:create_reference_encoder_executor", "class", "models/audar_tts/stages.py:_AudarReferenceEncodeHook", "depends_on", 0.6],
  ["function", "models/audar_tts/stages.py:create_reference_encoder_executor", "function", "models/audar_tts/stages.py:_load_codec", "calls", 0.8],
  ["function", "models/audar_tts/stages.py:create_tts_engine_executor", "function", "models/audar_tts/stages.py:_resolve_gguf", "calls", 0.8],
  ["function", "models/dots_tts/codec.py:load_dots_audio_codec", "class", "models/dots_tts/codec.py:DotsAudioCodec", "depends_on", 0.6],
  ["class", "models/dots_tts/codec.py:DotsReferenceEncoder", "class", "models/dots_tts/codec.py:_DotsReferenceHook", "depends_on", 0.6],
  ["class", "models/dots_tts/model_runner.py:DotsTTSModelRunner", "class", "models/dots_tts/flow_head.py:DotsTTSFlowHead", "depends_on", 0.6],
  ["function", "models/dots_tts/payload_types.py:load_dots_tts_state", "class", "models/dots_tts/payload_types.py:DotsTTSState", "depends_on", 0.6],
  ["function", "models/dots_tts/payload_types.py:store_dots_tts_state", "class", "models/dots_tts/payload_types.py:DotsTTSState", "depends_on", 0.6],
  ["function", "models/dots_tts/request_builders.py:build_sglang_dots_tts_request", "class", "models/dots_tts/request_builders.py:DotsTTSSGLangRequestData", "depends_on", 0.6],
  ["function", "models/dots_tts/request_builders.py:apply_latent_result", "function", "models/dots_tts/payload_types.py:store_dots_tts_state", "calls", 0.8],
  ["class", "models/dots_tts/sglang_model.py:DotsTTSSGLangModel", "class", "models/dots_tts/flow_head.py:DotsTTSFlowHead", "depends_on", 0.6],
  ["function", "models/dots_tts/stages.py:create_reference_encode_executor", "class", "models/dots_tts/codec.py:DotsReferenceEncoder", "depends_on", 0.6],
  ["function", "models/dots_tts/stages.py:create_vocoder_executor", "class", "models/dots_tts/vocoder.py:DotsTTSStreamingVocoder", "depends_on", 0.6],
  ["class", "models/dots_tts/vocoder.py:DotsTTSStreamingVocoder", "class", "models/dots_tts/vocoder_slot_pool.py:DotsVocoderSlotPool", "depends_on", 0.6],
  ["function", "models/dots_tts/tail.py:validate_acoustic_pool_memory", "function", "models/dots_tts/tail.py:estimate_acoustic_pool_bytes", "calls", 0.8],
  ["class", "models/dots_tts/tail.py:DotsTtsAcousticTail", "class", "models/dots_tts/tail.py:DotsTtsTailSpec", "depends_on", 0.6],
  ["function", "models/fishaudio_s2_pro/bootstrap.py:load_audio_decoder", "function", "models/fishaudio_s2_pro/bootstrap.py:_rematerialize_audio_decoder_buffers", "calls", 0.8],
  ["class", "models/fishaudio_s2_pro/engine_builder.py:FishS2ProEngineBuilder", "function", "models/fishaudio_s2_pro/engine_builder.py:_resolve_fast_ar_attention_backend", "calls", 0.8],
  ["class", "models/fishaudio_s2_pro/engine_builder.py:FishS2ProEngineBuilder", "function", "models/fishaudio_s2_pro/bootstrap.py:bootstrap_text_model_for_decode", "depends_on", 0.6]
];

for (const [sk, s, tk, t, type, weight] of semantic) {
  const source = nodeId(sk, ...s.split(":"));
  const target = nodeId(tk, ...t.split(":"));
  if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) {
    throw new Error(`语义边端点不存在: ${source} -> ${target}`);
  }
  edges.push({ source, target, type, direction: "forward", weight });
}

const paths = extracted.results.map((x) => x.path).sort();
const chunkSize = Math.ceil(paths.length / 2);
const chunks = [paths.slice(0, chunkSize), paths.slice(chunkSize)];
const nodePath = new Map(nodes.map((n) => [n.id, n.filePath]));
const parts = chunks.map((chunk) => {
  const allowed = new Set(chunk);
  const partNodes = nodes.filter((n) => allowed.has(n.filePath));
  const ids = new Set(partNodes.map((n) => n.id));
  return {
    nodes: partNodes,
    edges: edges.filter((e) => ids.has(e.source))
  };
});

const selectedPart = Number(process.argv[2] || 0);
for (let i = 0; i < parts.length; i++) {
  if (selectedPart && selectedPart !== i + 1) continue;
  const file = `sglang_omni/.ua/intermediate/batch-16-part-${i + 1}.json`;
  const json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: ${file}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}

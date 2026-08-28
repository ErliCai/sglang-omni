import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-20.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-20.json`, "utf8"));

const F = {
  "models/ming_omni/pipeline/__init__.py": ["标记 Ming-Omni 核心流水线辅助模块包。", ["ming-omni", "pipeline", "package"], "simple"],
  "models/ming_omni/pipeline/engine_io.py": ["在 Ming-Omni 流水线状态与编码器、Thinker 引擎请求之间转换，并把各引擎结果写回状态。", ["ming-omni", "engine-io", "request-adapter", "pipeline-state"], "complex"],
  "models/ming_omni/pipeline/merge.py": ["合并音频与图像编码结果，构建多模态 Thinker 输入，并把最终文本或语音结果解码为统一事件。", ["ming-omni", "multimodal-merge", "thinker-input", "event-decoding"], "complex"],
  "models/ming_omni/pipeline/next_stage.py": ["根据 Ming-Omni 状态中的模态输入和输出需求选择各阶段的后继路由。", ["ming-omni", "stage-routing", "pipeline-state"], "moderate"],
  "models/ming_omni/pipeline/sampling.py": ["把 Ming-Omni 请求参数规范化为 Thinker 使用的采样关键字和 SGLang 采样对象。", ["ming-omni", "sampling", "generation-params"], "simple"],
  "models/ming_omni/pipeline/stages.py": ["实现 Ming-Omni 预处理、模态聚合、音频与图像编码、SGLang Thinker、Talker 和解码执行器工厂。", ["ming-omni", "pipeline-stages", "executor-factory", "sglang-runtime"], "complex"],
  "models/ming_omni/pipeline/state_io.py": ["在 StagePayload 数据与 MingOmniPipelineState 之间进行加载和写回。", ["ming-omni", "state-io", "stage-payload"], "simple"],
  "models/ming_omni/pipeline/usage.py": ["从不同形态的请求与结果中统计提示词元和完成词元，构造文本生成用量。", ["ming-omni", "usage-accounting", "token-count"], "simple"],
  "models/ming_omni/stages.py": ["提供轻量导入的 Ming-Omni 阶段工厂与阶段间负载投影，裁剪状态并隔离编码器、Thinker、Talker 和流式阶段数据。", ["ming-omni", "stage-factories", "payload-projection", "streaming"], "complex"],
  "models/ming_omni/talker/audio_vae/__init__.py": ["标记 Ming Talker 的 AudioVAE 实现包。", ["ming-omni", "audio-vae", "talker"], "simple"],
  "models/ming_omni/talker/front/__init__.py": ["公开从 Ming 引入的文本前处理工具包。", ["ming-omni", "text-processing", "talker"], "simple"],
  "models/ming_omni/talker/talker_module/__init__.py": ["标记 Ming Talker 的声学生成模块包。", ["ming-omni", "talker", "acoustic-model"], "simple"],
  "models/ming_omni/thinker.py": ["以原生 SGLang 层实现 Ming-Omni BailingMoeV2 Thinker，支持分页 KV 缓存、RadixAttention、融合 MoE 和张量并行。", ["ming-omni", "thinker", "mixture-of-experts", "sglang-model"], "complex"],
  "models/ming_omni/tp_utils.py": ["在构造 Ming 模型前校验注意力头的张量并行可分性及各阶段支持范围。", ["ming-omni", "tensor-parallel", "config-validation"], "moderate"],
  "models/ming_tts/__init__.py": ["声明 Ming-Omni-TTS 16B 的参考音频、流式声码器和 CUDA 图能力。", ["ming-tts", "model-capabilities", "streaming-vocoder"], "simple"],
  "models/ming_tts/audio_config.py": ["把 Ming-Omni-TTS 检查点中的 AudioVAE 配置适配为本地解码器配置，并规范化采样率等字段。", ["ming-tts", "audio-vae", "config-adapter"], "moderate"],
  "models/ming_tts/audio_decode.py": ["加载 Ming AudioVAE 并维护流式解码缓存，把声学潜变量块增量或一次性解码为 44.1kHz 波形。", ["ming-tts", "audio-decoder", "audio-vae", "streaming"], "complex"],
  "models/ming_tts/config.py": ["定义 Ming-Omni-TTS 的预处理、SGLang 声学生成和流式音频解码流水线，以及批量、节奏和拓扑约束。", ["ming-tts", "pipeline-config", "contract-validation", "audio-decode"], "complex"],
  "models/ming_tts/engine_builder.py": ["构建 Ming-Omni-TTS 的 SGLang 引擎，配置张量并行、CUDA 图、模型尾部、运行器、适配器与中止回调。", ["ming-tts", "engine-builder", "cuda-graph", "tensor-parallel"], "complex"],
  "models/ming_tts/engine_io.py": ["在 Ming TTS 状态与 SGLang 调度请求间转换，应用潜变量反馈并构建面向音频解码器的流式输出。", ["ming-tts", "engine-io", "latent-patches", "scheduler-adapter"], "complex"],
  "models/ming_tts/flow_matching.py": ["实现 Ming TTS 的条件流匹配时间步、随机微分输入、ODE 求解、采样和训练损失。", ["ming-tts", "flow-matching", "ode-solver", "diffusion"], "complex"],
  "models/ming_tts/hf_config.py": ["把 Ming-Omni-TTS 语言和多模态配置适配为 Hugging Face 配置，暴露声学维度并注册模型架构。", ["ming-tts", "huggingface-config", "model-registration"], "complex"],
  "models/ming_tts/model_runner.py": ["协调 Ming TTS SGLang 主干与声学尾部的预填充、逐步潜变量生成、张量并行反馈广播、请求清理和错误传播。", ["ming-tts", "model-runner", "tensor-parallel", "latent-generation"], "complex"],
  "models/ming_tts/payload_types.py": ["定义 Ming TTS 跨阶段声明式状态、固定音频参数以及从 StagePayload 加载和写回的助手。", ["ming-tts", "pipeline-state", "stage-payload"], "moderate"],
  "models/ming_tts/prompt_builder.py": ["把目标文本和可选参考音频、参考转写、音色描述组合为 Ming TTS 多模态提示计划。", ["ming-tts", "prompt-building", "reference-audio", "voice-cloning"], "moderate"]
};

const S = {
  "models/ming_omni/pipeline/engine_io.py:build_encoder_request": "从流水线状态构造音频或图像编码器请求，并携带输入元数据。",
  "models/ming_omni/pipeline/engine_io.py:apply_encoder_result": "把编码器特征和长度写入对应模态的流水线状态字段。",
  "models/ming_omni/pipeline/engine_io.py:build_thinker_request": "合并多模态输入并构造与后端无关的 Thinker 请求。",
  "models/ming_omni/pipeline/engine_io.py:build_sglang_thinker_request": "把 Thinker 输入和采样配置转换为 SGLang 自回归请求数据。",
  "models/ming_omni/pipeline/engine_io.py:apply_thinker_result": "归一化 SGLang Thinker 输出并写回文本、词元、隐藏状态和结束信息。",
  "models/ming_omni/pipeline/merge.py:_as_tensor": "把可选数组或张量转换为指定设备上的 Torch 张量。",
  "models/ming_omni/pipeline/merge.py:_non_empty": "判断可选序列或张量是否包含至少一个元素。",
  "models/ming_omni/pipeline/merge.py:merge_for_thinker": "合并各编码器结果并更新可供 Thinker 消费的多模态状态。",
  "models/ming_omni/pipeline/merge.py:build_thinker_inputs": "把文本词元、音频特征和图像特征插入统一序列，构造 Thinker 输入张量。",
  "models/ming_omni/pipeline/merge.py:decode_events": "根据请求输出模态把 Thinker 文本、Talker 音频或错误转换为终端事件。",
  "models/ming_omni/pipeline/next_stage.py:preprocessing_next": "按实际存在的音频和图像输入选择预处理后的编码器或聚合阶段。",
  "models/ming_omni/pipeline/next_stage.py:encoder_next": "将任一模态编码器结果路由到多模态聚合阶段。",
  "models/ming_omni/pipeline/next_stage.py:aggregate_next": "将聚合完成的多模态状态路由到 Thinker。",
  "models/ming_omni/pipeline/next_stage.py:thinker_next": "将 Thinker 结果路由到普通解码阶段。",
  "models/ming_omni/pipeline/next_stage.py:thinker_next_speech": "将需要语音输出的 Thinker 结果路由到 Talker。",
  "models/ming_omni/pipeline/next_stage.py:decode_next": "标记解码阶段为终端，不再选择后继阶段。",
  "models/ming_omni/pipeline/next_stage.py:talker_next": "将 Talker 结果路由到最终解码合并阶段。",
  "models/ming_omni/pipeline/sampling.py:build_ming_sampling_kwargs": "从请求参数提取 Ming Thinker 支持的采样字段和默认值。",
  "models/ming_omni/pipeline/sampling.py:build_ming_sampling_params": "把规范化采样关键字构造为 SGLang 采样参数对象。",
  "models/ming_omni/pipeline/stages.py:_event_to_dict": "把 MingOmniEvent 转换为可序列化输出字典。",
  "models/ming_omni/pipeline/stages.py:create_preprocessing_executor": "创建 Ming 多模态预处理执行器。",
  "models/ming_omni/pipeline/stages.py:create_aggregate_executor": "创建合并音频、图像特征和提示序列的聚合执行器。",
  "models/ming_omni/pipeline/stages.py:create_audio_encoder_executor": "加载 MingAudioEncoder 并创建单遍音频编码执行器。",
  "models/ming_omni/pipeline/stages.py:create_image_encoder_executor": "加载 MingImageEncoder 并创建单遍图像编码执行器。",
  "models/ming_omni/pipeline/stages.py:create_sglang_thinker_executor": "配置 SGLang 服务参数并创建 Ming Thinker 自回归引擎执行器。",
  "models/ming_omni/pipeline/stages.py:_ensure_ming_config_registered": "确保 Ming Hugging Face 配置和 SGLang 模型架构已注册。",
  "models/ming_omni/pipeline/stages.py:_resolve_local_model_path": "解析本地模型目录或从模型仓库获取所需配置与权重。",
  "models/ming_omni/pipeline/stages.py:create_sglang_thinker_executor_from_config": "从阶段工厂配置解析参数并创建 Thinker 执行器。",
  "models/ming_omni/pipeline/stages.py:create_talker_executor": "创建负责独立语音合成的 Ming Talker 执行器。",
  "models/ming_omni/pipeline/stages.py:create_decode_executor": "创建把最终状态转换为多模态事件列表的解码执行器。",
  "models/ming_omni/pipeline/state_io.py:load_state": "从 StagePayload 数据构造 MingOmniPipelineState。",
  "models/ming_omni/pipeline/state_io.py:store_state": "把 MingOmniPipelineState 序列化回 StagePayload。",
  "models/ming_omni/pipeline/usage.py:_mapping_get": "以统一方式从映射或对象属性读取用量字段。",
  "models/ming_omni/pipeline/usage.py:_count_ids": "统计列表、张量或嵌套词元 ID 的元素数量。",
  "models/ming_omni/pipeline/usage.py:build_text_usage": "根据提示和完成词元构造标准文本生成用量字典。",
  "models/ming_omni/stages.py:project_preprocessing_to_audio_encoder": "把预处理负载裁剪为音频编码器所需字段。",
  "models/ming_omni/stages.py:project_preprocessing_to_image_encoder": "把预处理负载裁剪为图像编码器所需字段。",
  "models/ming_omni/stages.py:project_preprocessing_to_mm_aggregate": "把预处理主状态投影到多模态聚合阶段。",
  "models/ming_omni/stages.py:project_encoder_to_mm_aggregate": "把音频或图像编码结果投影到多模态聚合阶段。",
  "models/ming_omni/stages.py:project_thinker_to_decode": "把 Thinker 输出裁剪为最终解码所需负载。",
  "models/ming_omni/stages.py:project_thinker_to_talker": "把 Thinker 文本和请求语音配置投影给非流式 Talker。",
  "models/ming_omni/stages.py:project_thinker_to_segmenter": "把 Thinker 流式文本配置投影给文本分段器。",
  "models/ming_omni/stages.py:_project_thinker_output": "按目标阶段复制并精简 Thinker 输出状态。",
  "models/ming_omni/stages.py:_project_preprocessing_to_encoder": "按编码器类型提取预处理输入、特征元数据和状态。",
  "models/ming_omni/stages.py:_payload_with_state": "用指定状态和流式元数据创建新的 StagePayload。",
  "models/ming_omni/stages.py:_project_encoder_input_metadata": "复制编码器输入的形状、长度和模态标识元数据。",
  "models/ming_omni/stages.py:_project_prompt_for_usage": "保留 Thinker 用量统计所需的提示词元信息。",
  "models/ming_omni/stages.py:_slim_thinker_out": "移除下游阶段不需要的大型 Thinker 张量。",
  "models/ming_omni/stages.py:_copy_mutable_containers": "复制状态中的可变容器，避免并行分支共享修改。",
  "models/ming_omni/stages.py:_single_encoder_stage_name": "从负载中解析唯一的来源编码器阶段名称。",
  "models/ming_omni/stages.py:create_preprocessing_executor": "延迟导入并创建 Ming 预处理阶段执行器。",
  "models/ming_omni/stages.py:create_aggregate_executor": "延迟导入并创建多模态聚合阶段执行器。",
  "models/ming_omni/stages.py:create_streaming_segmenter_executor": "创建把 Thinker 文本增量切分并路由给 Talker 的调度器。",
  "models/ming_omni/stages.py:create_audio_encoder_executor": "校验张量并行支持后创建音频编码执行器。",
  "models/ming_omni/stages.py:create_image_encoder_executor": "校验张量并行配置后创建图像编码执行器。",
  "models/ming_omni/stages.py:create_sglang_thinker_executor_from_config": "校验 Thinker 张量并行参数并创建 SGLang 引擎执行器。",
  "models/ming_omni/stages.py:create_talker_executor": "创建 Ming 非流式 Talker TTS 执行器。",
  "models/ming_omni/stages.py:create_streaming_talker_executor": "创建消费文本片段并输出音频块的流式 Talker 调度器。",
  "models/ming_omni/stages.py:create_decode_executor": "创建 Ming 最终事件解码执行器。",
  "models/ming_omni/thinker.py:BailingMoeV2Attention": "实现带部分 RoPE、QK 归一化、GQA 和 RadixAttention 的 Bailing 注意力。",
  "models/ming_omni/thinker.py:BailingMoeV2MLP": "实现 Bailing 稠密或专家门控前馈网络。",
  "models/ming_omni/thinker.py:BailingMoeV2SparseMoeBlock": "执行多路由 Top-K 专家选择、融合专家计算和共享专家输出。",
  "models/ming_omni/thinker.py:BailingMoeV2DecoderLayer": "组合注意力、稠密或稀疏 MoE 前馈层以及残差归一化。",
  "models/ming_omni/thinker.py:BailingMoeV2TextModel": "堆叠 Bailing 解码层，执行嵌入、分页缓存前向并加载张量并行权重。",
  "models/ming_omni/thinker.py:BailingMoeV2ForCausalLM": "在 Bailing 文本主干上添加词表头并修补多模态特殊词元 ID。",
  "models/ming_omni/tp_utils.py:validate_attention_tp_config": "验证查询头和 KV 头能否按给定张量并行规模合法切分。",
  "models/ming_omni/tp_utils.py:validate_stage_tp_support": "拒绝在 Ming 不支持张量并行的阶段使用大于一的 TP 规模。",
  "models/ming_tts/audio_config.py:resolve_ming_tts_audio_vae_config": "从顶层 TTS 配置提取 AudioVAE 字段，应用兼容默认值并构造解码器配置。",
  "models/ming_tts/audio_decode.py:decode_ming_tts_audio_payload": "读取 MingTTSState，调用解码器处理新潜变量并把波形结果写回负载。",
  "models/ming_tts/audio_decode.py:MingAudioDecoderState": "保存单个流式音频请求的 AudioVAE 缓存和已解码步数。",
  "models/ming_tts/audio_decode.py:MingAudioDecoder": "加载 AudioVAE，维护每请求缓存并支持增量和非流式潜变量解码。",
  "models/ming_tts/config.py:_validate_ming_tts_pipeline_contract": "校验 Ming TTS 阶段名称、顺序、流边、终端节点和工厂参数的一致性。",
  "models/ming_tts/config.py:validate_ming_tts_audio_decode_batch_config": "验证音频解码最大批量与调度并发配置相容。",
  "models/ming_tts/config.py:validate_ming_tts_audio_decode_cadence_config": "验证潜变量发送与音频解码步长、历史窗口的节奏配置。",
  "models/ming_tts/config.py:MingTTSPreprocessingFactoryArgs": "保存 Ming TTS 预处理器使用的模型与提示配置。",
  "models/ming_tts/config.py:MingTTSPreprocessingStageConfig": "扩展阶段配置以携带 Ming TTS 预处理工厂参数。",
  "models/ming_tts/config.py:MingTTSAudioDecodeFactoryArgs": "保存流式音频解码器的批量、步长和缓存参数。",
  "models/ming_tts/config.py:MingTTSAudioDecodeStageConfig": "扩展阶段配置以携带 Ming TTS 音频解码工厂参数。",
  "models/ming_tts/config.py:MingTTSPipelineConfig": "定义 Ming TTS 三阶段流水线，并在模型校验后检查本地边与运行契约。",
  "models/ming_tts/engine_builder.py:_is_truthy": "把布尔值和常见字符串表示统一解析为真假。",
  "models/ming_tts/engine_builder.py:MingTtsEngineBuilder": "配置 Ming TTS SGLang 引擎、声学尾部、CUDA 图批次、模型运行器和调度适配器。",
  "models/ming_tts/engine_io.py:make_ming_tts_scheduler_adapters": "创建 Ming TTS 请求构建、结果应用和请求中止适配器。",
  "models/ming_tts/engine_io.py:build_ming_tts_stream_output": "把新生成的潜变量块与完成信号包装为下游音频解码流输出。",
  "models/ming_tts/engine_io.py:MingTTSLatentPatch": "表示声学尾部单步生成的潜变量块和历史位置。",
  "models/ming_tts/engine_io.py:MingTTSSGLangRequestData": "封装发给 SGLang 调度器的 Ming TTS 请求及其续跑状态。",
  "models/ming_tts/flow_matching.py:build_cfm_timesteps": "按条件流匹配采样步数构造单调时间网格。",
  "models/ming_tts/flow_matching.py:build_cfm_sde_random": "为随机微分采样生成与批量和设备匹配的噪声张量。",
  "models/ming_tts/flow_matching.py:_expand_batch_param": "把标量或短参数扩展到目标批量维度。",
  "models/ming_tts/flow_matching.py:Solver": "使用指定时间步对条件流匹配速度场执行数值积分。",
  "models/ming_tts/flow_matching.py:CFM": "封装 DiT 条件流匹配模型，准备条件输入并执行训练前向和采样。",
  "models/ming_tts/flow_matching.py:FlowLoss": "构造流匹配训练目标、噪声样本并计算速度预测损失。",
  "models/ming_tts/hf_config.py:register_ming_tts_hf_config": "将 Ming TTS 配置和架构注册到 Transformers 与 SGLang 模型注册表。",
  "models/ming_tts/hf_config.py:BailingMoeTTSConfig": "适配 Ming TTS 的 Bailing MoE 语言与声学尾部参数。",
  "models/ming_tts/hf_config.py:BailingMMTTSConfig": "聚合文本模型与 AudioVAE 配置并暴露采样率和声学块尺寸属性。",
  "models/ming_tts/model_runner.py:MingTTSTPStepUpdate": "封装入口 TP rank 生成的词元、反馈掩码、潜变量和尾部错误以供广播。",
  "models/ming_tts/model_runner.py:_MingTTSRequestState": "维护单个请求的声学历史、尾部状态和生成进度。",
  "models/ming_tts/model_runner.py:MingTTSModelRunner": "协调预填充、解码和声学尾部步骤，并在 TP ranks 间同步词元与潜变量反馈。",
  "models/ming_tts/payload_types.py:load_ming_tts_state": "从 StagePayload 读取并校验 MingTTSState。",
  "models/ming_tts/payload_types.py:store_ming_tts_state": "把 MingTTSState 写回 StagePayload。",
  "models/ming_tts/payload_types.py:MingTTSState": "保存提示计划、参考音频、SGLang 请求、潜变量流、波形和用量状态。",
  "models/ming_tts/prompt_builder.py:build_ming_tts_prompt": "根据目标文本、参考语音与转写和音色描述构造词元序列及音频块计划。",
  "models/ming_tts/prompt_builder.py:MingTTSPromptPlan": "封装 Ming TTS 提示词元、参考音频与声学块位置规划。"
};

const id = (kind, path, name) => `${kind}:${path}${name ? `:${name}` : ""}`;
const slug = (name) => name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
const complexity = (start, end, kind) => {
  const span = end - start + 1;
  if (span > 150) return "complex";
  if (span > 45 || (kind === "class" && span > 20)) return "moderate";
  return "simple";
};

const nodes = [];
const edges = [];
const localSymbols = new Map();
for (const result of extracted.results) {
  const path = result.path;
  const info = F[path];
  if (!info) throw new Error(`缺少文件说明: ${path}`);
  const fileType = result.fileCategory === "code" ? "file" : "document";
  const fileId = id(fileType, path);
  nodes.push({ id: fileId, type: fileType, name: path.split("/").at(-1), filePath: path, summary: info[0], tags: info[1], complexity: info[2] });
  const exported = new Set((result.exports || []).map((x) => x.name));
  const map = new Map();
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) {
    for (const item of list) {
      const key = `${path}:${item.name}`;
      if (!S[key]) throw new Error(`缺少符号说明: ${key}`);
      const sid = id(kind, path, item.name);
      const tags = [...new Set([info[1][0], info[1][1], slug(item.name), kind])].slice(0, 5);
      nodes.push({ id: sid, type: kind, name: item.name, filePath: path, lineRange: [item.startLine, item.endLine], summary: S[key], tags, complexity: complexity(item.startLine, item.endLine, kind) });
      map.set(item.name, sid);
      edges.push({ source: fileId, target: sid, type: "contains", direction: "forward", weight: 1 });
      if (exported.has(item.name)) edges.push({ source: fileId, target: sid, type: "exports", direction: "forward", weight: 0.8 });
    }
  }
  localSymbols.set(path, map);
}

for (const [sourcePath, targets] of Object.entries(input.batchImportData)) {
  for (const targetPath of targets) edges.push({ source: id("file", sourcePath), target: id(targetPath.endsWith(".md") ? "document" : "file", targetPath), type: "imports", direction: "forward", weight: 0.7 });
}

const edgeKeys = new Set(edges.map((e) => `${e.source}|${e.target}|${e.type}`));
for (const result of extracted.results) {
  const map = localSymbols.get(result.path);
  for (const call of result.callGraph || []) {
    const source = map.get(call.caller);
    const target = map.get(call.callee);
    const key = `${source}|${target}|calls`;
    if (source && target && source !== target && !edgeKeys.has(key)) {
      edges.push({ source, target, type: "calls", direction: "forward", weight: 0.8 });
      edgeKeys.add(key);
    }
  }
}

const D = [
  ["function", "models/ming_omni/pipeline/engine_io.py", "build_thinker_request", "function", "models/ming_omni/pipeline/merge.py", "build_thinker_inputs"],
  ["function", "models/ming_omni/pipeline/engine_io.py", "build_sglang_thinker_request", "function", "models/ming_omni/pipeline/sampling.py", "build_ming_sampling_params"],
  ["function", "models/ming_omni/pipeline/stages.py", "create_decode_executor", "function", "models/ming_omni/pipeline/merge.py", "decode_events"],
  ["function", "models/ming_omni/stages.py", "project_thinker_to_decode", "function", "models/ming_omni/stages.py", "_project_thinker_output"],
  ["function", "models/ming_omni/stages.py", "project_thinker_to_talker", "function", "models/ming_omni/stages.py", "_project_thinker_output"],
  ["function", "models/ming_omni/stages.py", "project_preprocessing_to_audio_encoder", "function", "models/ming_omni/stages.py", "_project_preprocessing_to_encoder"],
  ["function", "models/ming_omni/stages.py", "project_preprocessing_to_image_encoder", "function", "models/ming_omni/stages.py", "_project_preprocessing_to_encoder"],
  ["class", "models/ming_omni/thinker.py", "BailingMoeV2SparseMoeBlock", "class", "models/ming_omni/thinker.py", "BailingMoeV2MLP"],
  ["class", "models/ming_omni/thinker.py", "BailingMoeV2DecoderLayer", "class", "models/ming_omni/thinker.py", "BailingMoeV2Attention"],
  ["class", "models/ming_omni/thinker.py", "BailingMoeV2DecoderLayer", "class", "models/ming_omni/thinker.py", "BailingMoeV2SparseMoeBlock"],
  ["class", "models/ming_omni/thinker.py", "BailingMoeV2ForCausalLM", "class", "models/ming_omni/thinker.py", "BailingMoeV2TextModel"],
  ["function", "models/ming_tts/audio_decode.py", "decode_ming_tts_audio_payload", "class", "models/ming_tts/audio_decode.py", "MingAudioDecoder"],
  ["class", "models/ming_tts/config.py", "MingTTSPipelineConfig", "function", "models/ming_tts/config.py", "_validate_ming_tts_pipeline_contract"],
  ["class", "models/ming_tts/engine_builder.py", "MingTtsEngineBuilder", "class", "models/ming_tts/model_runner.py", "MingTTSModelRunner"],
  ["function", "models/ming_tts/engine_io.py", "build_ming_tts_stream_output", "class", "models/ming_tts/engine_io.py", "MingTTSLatentPatch"],
  ["class", "models/ming_tts/flow_matching.py", "CFM", "class", "models/ming_tts/flow_matching.py", "Solver"],
  ["class", "models/ming_tts/flow_matching.py", "FlowLoss", "class", "models/ming_tts/flow_matching.py", "CFM"],
  ["class", "models/ming_tts/hf_config.py", "BailingMMTTSConfig", "class", "models/ming_tts/hf_config.py", "BailingMoeTTSConfig"],
  ["class", "models/ming_tts/model_runner.py", "MingTTSModelRunner", "class", "models/ming_tts/model_runner.py", "MingTTSTPStepUpdate"],
  ["function", "models/ming_tts/prompt_builder.py", "build_ming_tts_prompt", "class", "models/ming_tts/prompt_builder.py", "MingTTSPromptPlan"]
];
for (const [sk, sp, sn, tk, tp, tn] of D) {
  const source = id(sk, sp, sn), target = id(tk, tp, tn), key = `${source}|${target}|depends_on`;
  if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) throw new Error(`语义边端点不存在: ${source} -> ${target}`);
  if (!edgeKeys.has(key)) {
    edges.push({ source, target, type: "depends_on", direction: "forward", weight: 0.6 });
    edgeKeys.add(key);
  }
}

const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
const paths = extracted.results.map((x) => x.path).sort();
const chunkSize = Math.ceil(paths.length / partCount);
const parts = [];
for (let i = 0; i < partCount; i++) {
  const allowed = new Set(paths.slice(i * chunkSize, (i + 1) * chunkSize));
  const partNodes = nodes.filter((n) => allowed.has(n.filePath));
  const local = new Set(partNodes.map((n) => n.id));
  parts.push({ nodes: partNodes, edges: edges.filter((e) => local.has(e.source)) });
}

const selected = Number(process.argv[2] || 0);
for (let i = 0; i < parts.length; i++) {
  if (selected && selected !== i + 1) continue;
  const name = partCount === 1 ? "batch-20.json" : `batch-20-part-${i + 1}.json`;
  const json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}
if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

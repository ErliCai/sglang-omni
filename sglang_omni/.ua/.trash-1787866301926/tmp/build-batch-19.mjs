import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-19.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-19.json`, "utf8"));

const F = {
  "models/llada2_uni/components/common.py": ["提供 LLaDA2-Uni 组件共享的模型目录解析和分词器加载逻辑，兼容本地路径与模型仓库缓存。", ["llada2-uni", "model-loading", "tokenizer"], "simple"],
  "models/llada2_uni/components/image_encoder.py": ["实现 LLaDA2-Uni 的 ViT 与 VQ-VAE 图像编码器，把规范化图像转换为可注入扩散语言模型的离散视觉码。", ["llada2-uni", "image-encoder", "vision-transformer", "vq-vae"], "complex"],
  "models/llada2_uni/components/preprocessor.py": ["校验 LLaDA2-Uni 多模态消息，分词文本、调整图像尺寸并插入与视觉码数量匹配的占位标记。", ["llada2-uni", "multimodal-preprocessing", "image-resize", "prompt-building"], "complex"],
  "models/llada2_uni/components/thinker.py": ["实现 LLaDA2-Uni 的统一扩散语言模型 MoE 主干，包括注意力、专家路由、稀疏专家块、张量并行权重加载和语言模型封装。", ["llada2-uni", "diffusion-llm", "mixture-of-experts", "tensor-parallel"], "complex"],
  "models/llada2_uni/config.py": ["定义 LLaDA2-Uni 的预处理、图像编码、扩散 Thinker 和解码阶段拓扑及默认生成参数。", ["llada2-uni", "pipeline-config", "diffusion-generation"], "moderate"],
  "models/llada2_uni/merge.py": ["把 LLaDA2-Uni Thinker 的最终词元输出解码为统一的文本完成事件。", ["llada2-uni", "result-merge", "event-decoding"], "simple"],
  "models/llada2_uni/payload_types.py": ["定义 LLaDA2-Uni 各阶段共享的 Thinker 输出、流水线状态和终端事件数据结构。", ["llada2-uni", "payload-state", "event-schema"], "moderate"],
  "models/llada2_uni/request_builders.py": ["构建图像编码与扩散 Thinker 请求，合并离散视觉码、应用阶段结果，并提供 SGLang 调度适配器。", ["llada2-uni", "request-building", "image-tokens", "scheduler-adapter"], "complex"],
  "models/llada2_uni/stages.py": ["创建 LLaDA2-Uni 的预处理、图像编码、SGLang 扩散 Thinker 和最终解码执行器。", ["llada2-uni", "pipeline-stages", "executor-factory"], "complex"],
  "models/ming_omni/bootstrap.py": ["组装 Ming-Omni Thinker 调度器及请求、结果和流式输出适配器，统一文本、音频和完成信号的输出处理。", ["ming-omni", "scheduler-bootstrap", "streaming-output", "adapter"], "complex"],
  "models/ming_omni/components/__init__.py": ["标记 Ming-Omni 可复用模型组件包。", ["ming-omni", "components", "package"], "simple"],
  "models/ming_omni/components/audio_encoder.py": ["加载并执行 Ming-Omni 的 Whisper 风格音频编码器，完成声学特征变换、长度计算和批量特征封装。", ["ming-omni", "audio-encoder", "whisper", "feature-encoding"], "complex"],
  "models/ming_omni/components/common.py": ["提供 Ming-Omni 的分词器兼容补丁、模型配置加载和统一组件规格解析。", ["ming-omni", "model-config", "tokenizer", "component-spec"], "moderate"],
  "models/ming_omni/components/image_encoder.py": ["独立加载 Ming-Omni 视觉编码器和投影器，处理张量并行上下文并输出 L2 归一化的图像特征。", ["ming-omni", "image-encoder", "vision-projector", "tensor-parallel"], "complex"],
  "models/ming_omni/components/preprocessor.py": ["处理 Ming-Omni 文本、图像、视频与音频输入，提取 Mel 特征、估算多模态词元并构造 Thinker 提示状态。", ["ming-omni", "multimodal-preprocessing", "mel-spectrogram", "prompt-building"], "complex"],
  "models/ming_omni/components/projectors.py": ["实现张量并行视觉投影 MLP，把视觉编码维度映射到语言模型隐藏空间并加载对应权重。", ["ming-omni", "vision-projector", "tensor-parallel"], "moderate"],
  "models/ming_omni/components/streaming_detokenizer.py": ["实现 Ming-Omni 流式反分词调度器，以 UTF-8 安全方式增量解码词元、发送文本增量并合并最终元数据。", ["ming-omni", "streaming-detokenizer", "utf8", "scheduler"], "complex"],
  "models/ming_omni/components/streaming_segmenter.py": ["把 Thinker 的流式文本增量切分为可朗读片段，管理首段超时、结束同步和到 Talker 的流式路由。", ["ming-omni", "text-segmentation", "streaming-scheduler", "talker-routing"], "complex"],
  "models/ming_omni/components/streaming_talker.py": ["消费流式文本片段并驱动 Ming-Omni Talker 生成音频块，管理每请求线程、模型加载、波形序列化和完成事件。", ["ming-omni", "streaming-talker", "speech-generation", "audio-chunks"], "complex"],
  "models/ming_omni/components/streaming_text.py": ["定义流式文本完成结果、分段配置与状态机，按标点、词元窗口和刷新信号产生语音片段。", ["ming-omni", "streaming-text", "segmenter-state", "text-protocol"], "complex"],
  "models/ming_omni/components/talker_executor.py": ["把自包含的 Ming Talker TTS 系统包装成异步流水线执行器，负责模型加载、请求管理、语音生成和用量统计。", ["ming-omni", "talker-executor", "tts", "async-runtime"], "complex"],
  "models/ming_omni/components/vision_encoder.py": ["以 SGLang 原生 ViT 子模块构建 Ming-Omni 视觉编码器，支持张量并行、FlashAttention、位置插值和多尺度特征。", ["ming-omni", "vision-encoder", "vision-transformer", "tensor-parallel"], "complex"],
  "models/ming_omni/configuration.py": ["提供把 Ming 配置映射到 SGLang 期望字段的轻量 Hugging Face MoE 与多模态配置类。", ["ming-omni", "huggingface-config", "moe-config"], "moderate"],
  "models/ming_omni/hf_config.py": ["定义 Ming-Omni 音频、视觉、语言模型和顶层组件配置，并支持从模型配置字典递归构造。", ["ming-omni", "component-config", "huggingface"], "moderate"],
  "models/ming_omni/io.py": ["定义 Ming-Omni 的分词输入、预处理数据、Thinker 输出、流水线状态和多模态事件协议。", ["ming-omni", "payload-state", "multimodal-events"], "moderate"]
};

const S = {
  "models/llada2_uni/components/common.py:resolve_local_model_dir": "解析本地目录或最小化下载所需模型文件，并返回可供组件读取的模型目录。",
  "models/llada2_uni/components/common.py:load_llada2_tokenizer": "从解析后的模型目录加载 LLaDA2-Uni 分词器。",
  "models/llada2_uni/components/image_encoder.py:_load_image_tokenizer_config": "从模型目录读取图像分词器的 JSON 配置。",
  "models/llada2_uni/components/image_encoder.py:_make_vision_config": "把图像分词器配置转换为 ViT 编码器所需的视觉配置对象。",
  "models/llada2_uni/components/image_encoder.py:_make_vq_config": "构造 VQ-VAE 量化器和解码器所需的配置对象。",
  "models/llada2_uni/components/image_encoder.py:VisionMLP": "实现视觉 Transformer 块中的前馈 MLP。",
  "models/llada2_uni/components/image_encoder.py:VisionAttention": "实现视觉词元的多头自注意力计算。",
  "models/llada2_uni/components/image_encoder.py:VisionPatchEmbed": "使用卷积把输入图像切分并投影为视觉块嵌入。",
  "models/llada2_uni/components/image_encoder.py:VisionEmbeddings": "组合图像块、位置和条件信息形成视觉编码器输入。",
  "models/llada2_uni/components/image_encoder.py:VisionBlock": "串联视觉自注意力与 MLP 残差子层。",
  "models/llada2_uni/components/image_encoder.py:VisionEncoder": "运行多层视觉 Transformer，并为图像块生成旋转位置编码。",
  "models/llada2_uni/components/image_encoder.py:VQVAEVectorQuantizer": "将连续视觉特征映射到最近的 VQ 码本向量和离散索引。",
  "models/llada2_uni/components/image_encoder.py:VQVAE": "封装 VQ-VAE 编码路径，将视觉特征转换为量化码。",
  "models/llada2_uni/components/image_encoder.py:LLaDA2ImageEncoder": "加载 ViT 与 VQ-VAE 权重，并把一批图像转换为离散视觉词元 ID。",
  "models/llada2_uni/components/preprocessor.py:validate_prompt_seq_len": "检查文本和图像占位词元总长度是否满足模型序列长度约束。",
  "models/llada2_uni/components/preprocessor.py:_compute_target_dims": "按原始宽高和块大小计算保持比例的目标缩放尺寸。",
  "models/llada2_uni/components/preprocessor.py:_resize_and_center_crop": "缩放单张图像并执行中心裁剪以匹配模型输入尺寸。",
  "models/llada2_uni/components/preprocessor.py:_resize_images": "批量调整输入图像并返回统一张量及各图像网格信息。",
  "models/llada2_uni/components/preprocessor.py:LLaDA2Preprocessor": "解析对话消息和原始图像，构造提示词、图像占位符、输入 ID 与视觉编码输入。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeAttention": "实现支持张量并行和 SGLang KV 缓存的 LLaDA2 多头注意力层。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeMLP": "实现单个 LLaDA2 专家的门控前馈网络。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeGate": "为每个词元计算专家路由分数和 Top-K 选择。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeSparseMoeBlock": "根据路由结果把词元分派给稀疏专家并聚合加权输出。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeBlock": "组合注意力、稀疏 MoE 前馈层和残差归一化。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeTextModel": "堆叠 LLaDA2 MoE 块，执行扩散语言模型主干前向并加载分片权重。",
  "models/llada2_uni/components/thinker.py:LLaDA2MoeModelLM": "在 MoE 文本主干上添加词表输出头，提供 SGLang 可调用的语言模型接口。",
  "models/llada2_uni/config.py:LLaDA2UniPipelineConfig": "定义 LLaDA2-Uni 四阶段流水线、模型架构、最大新词元数和阶段工厂参数。",
  "models/llada2_uni/merge.py:decode_events": "解码 Thinker 的输出词元并创建单个 text_final 事件。",
  "models/llada2_uni/payload_types.py:ThinkerOutput": "描述规范化 Thinker 输出中的词元、结束标志和停止原因。",
  "models/llada2_uni/payload_types.py:LLaDA2UniPipelineState": "保存提示词、图像输入、视觉词元、Thinker 结果和最终事件，并支持字典序列化。",
  "models/llada2_uni/payload_types.py:LLaDA2UniEvent": "表示 LLaDA2-Uni 流水线产生的模态事件及其负载。",
  "models/llada2_uni/request_builders.py:build_encoder_request": "从流水线状态构造图像编码阶段请求。",
  "models/llada2_uni/request_builders.py:apply_encoder_result": "把图像编码器返回的离散视觉码写回流水线状态。",
  "models/llada2_uni/request_builders.py:merge_image_tokens_for_thinker": "用真实视觉码替换提示序列中的图像占位词元并校验数量。",
  "models/llada2_uni/request_builders.py:build_dllm_thinker_request": "构造扩散 Thinker 的 SGLang 请求、采样参数和序列预算。",
  "models/llada2_uni/request_builders.py:apply_dllm_thinker_result": "把扩散 Thinker 输出和结束信息归一化后写回状态。",
  "models/llada2_uni/request_builders.py:make_dllm_thinker_scheduler_adapters": "创建扩散 Thinker 的请求构建、结果应用与调度适配函数。",
  "models/llada2_uni/stages.py:_event_to_dict": "把 LLaDA2-Uni 事件对象转换为可传输字典。",
  "models/llada2_uni/stages.py:create_preprocessing_executor": "创建调用 LLaDA2Preprocessor 的输入预处理执行器。",
  "models/llada2_uni/stages.py:create_image_encoder_executor": "创建加载 LLaDA2ImageEncoder 并编码图像的执行器。",
  "models/llada2_uni/stages.py:create_sglang_dllm_thinker_executor_from_config": "根据阶段配置创建 SGLang 扩散 Thinker 执行器。",
  "models/llada2_uni/stages.py:create_decode_executor": "创建将 Thinker 结果解码为终端文本事件的执行器。",
  "models/ming_omni/bootstrap.py:create_thinker_scheduler": "应用 Ming 运行参数并实例化 Thinker 的 SGLang 调度器。",
  "models/ming_omni/bootstrap.py:make_thinker_scheduler_adapters": "创建 Ming Thinker 请求构建器、结果适配器和选定的流式输出构建器。",
  "models/ming_omni/bootstrap.py:make_combined_stream_output_builder": "组合文本和 Talker 所需的 Thinker 流式输出。",
  "models/ming_omni/bootstrap.py:_select_stream_output_builder": "按请求输出模态选择文本、语音或组合流式输出策略。",
  "models/ming_omni/bootstrap.py:make_text_stream_output_builder": "构造把增量词元转换为文本流消息的输出函数。",
  "models/ming_omni/bootstrap.py:make_thinker_stream_output_builder": "构造处理 Thinker 多模态增量结果和结束信号的输出函数。",
  "models/ming_omni/bootstrap.py:_torch_long": "把词元数据转换为 Torch 长整型张量。",
  "models/ming_omni/bootstrap.py:_collect_eos_token_ids": "从采样参数收集标准化的结束词元 ID 集合。",
  "models/ming_omni/bootstrap.py:_stop_hits": "判断当前词元是否命中任一停止条件。",
  "models/ming_omni/components/audio_encoder.py:Transpose": "提供可插入顺序网络的张量维度转置层。",
  "models/ming_omni/components/audio_encoder.py:MingAudioEncoder": "构建并加载 Whisper 编码器，处理 Mel 特征、有效长度和批量输出包装。",
  "models/ming_omni/components/common.py:load_ming_tokenizer": "加载 Ming 分词器并补齐多模态兼容属性。",
  "models/ming_omni/components/common.py:_attach_ming_tokenizer_compat": "为分词器附加 Ming 预处理器依赖的特殊词元和兼容接口。",
  "models/ming_omni/components/common.py:load_ming_config": "从模型路径读取并解析顶层 MingOmniConfig。",
  "models/ming_omni/components/common.py:load_llm_config": "加载 Ming 语言模型子配置。",
  "models/ming_omni/components/common.py:load_audio_config": "加载 Ming 音频编码器子配置。",
  "models/ming_omni/components/common.py:MingOmniSpec": "汇总语言、音频、视觉等关键模型规格，并可由顶层配置构造。",
  "models/ming_omni/components/image_encoder.py:_iter_weights_by_prefix": "遍历检查点中指定前缀的视觉编码器或投影器权重。",
  "models/ming_omni/components/image_encoder.py:_resolve_dtype": "把配置中的数据类型名称解析为 Torch dtype。",
  "models/ming_omni/components/image_encoder.py:MingImageEncoder": "加载视觉主干与投影器，管理张量并行环境并输出归一化图像嵌入。",
  "models/ming_omni/components/preprocessor.py:compute_mel_spectrogram": "把音频波形转换为 Ming Whisper 编码器所需的对数 Mel 频谱。",
  "models/ming_omni/components/preprocessor.py:_compute_mel_features_for_waveform": "规范化单条波形并生成带长度信息的 Mel 特征。",
  "models/ming_omni/components/preprocessor.py:estimate_audio_feature_length": "根据音频样本数估算经过编码器下采样后的特征词元长度。",
  "models/ming_omni/components/preprocessor.py:_estimate_image_tokens": "根据图像尺寸估算视觉编码器产生的图像词元数。",
  "models/ming_omni/components/preprocessor.py:_inject_top_level_images": "把请求顶层图像输入注入标准多模态消息内容。",
  "models/ming_omni/components/preprocessor.py:_inject_top_level_audios": "把请求顶层音频输入注入标准多模态消息内容。",
  "models/ming_omni/components/preprocessor.py:_inject_top_level_videos": "把请求顶层视频输入注入标准多模态消息内容。",
  "models/ming_omni/components/preprocessor.py:MingPreprocessor": "统一处理消息中的文本、图像、视频和音频，构建多模态提示与流水线状态。",
  "models/ming_omni/components/projectors.py:VisionProjector": "用列并行与行并行线性层把视觉特征投影到 LLM 隐藏维度。",
  "models/ming_omni/components/streaming_detokenizer.py:_event_to_dict": "把 Ming 多模态事件对象转换为输出字典。",
  "models/ming_omni/components/streaming_detokenizer.py:text_output_requested": "判断请求的输出模态是否包含文本。",
  "models/ming_omni/components/streaming_detokenizer.py:_attach_decode_final_metadata": "把完成原因、用量等解码终态元数据附加到最终结果。",
  "models/ming_omni/components/streaming_detokenizer.py:create_ming_streaming_detokenize_scheduler": "根据工厂参数创建并返回 Ming 流式反分词调度器。",
  "models/ming_omni/components/streaming_detokenizer.py:_RequestState": "保存单个反分词请求的待处理词元、已发送文本和终态信息。",
  "models/ming_omni/components/streaming_detokenizer.py:MingStreamingDetokenizeScheduler": "消费增量词元，安全解码 UTF-8 文本增量，并协调主负载、流结束与最终结果。",
  "models/ming_omni/components/streaming_segmenter.py:_default_token_count": "使用空白分词提供默认文本词元数量估算。",
  "models/ming_omni/components/streaming_segmenter.py:_RequestState": "保存单个分段请求的 SegmenterState、主负载和流完成状态。",
  "models/ming_omni/components/streaming_segmenter.py:MingStreamingSegmenterScheduler": "把文本流推入分段状态机，按标点、窗口或超时发送片段并同步结束。",
  "models/ming_omni/components/streaming_talker.py:_RequestState": "跟踪单个语音流请求的预设声音、生成线程、队列和完成状态。",
  "models/ming_omni/components/streaming_talker.py:MingStreamingTalkerScheduler": "为文本片段启动 Talker 流式语音生成，发送音频块并管理请求终止与模型资源。",
  "models/ming_omni/components/streaming_text.py:is_done_signal": "判断流式队列值是否表示正常或异常完成。",
  "models/ming_omni/components/streaming_text.py:text_to_uint8_tensor": "把 UTF-8 文本编码为无符号字节张量。",
  "models/ming_omni/components/streaming_text.py:uint8_tensor_to_text": "把无符号字节张量解码回 UTF-8 文本。",
  "models/ming_omni/components/streaming_text.py:split_whitespace_tokens": "按空白边界拆分文本并保留适合累计计数的片段。",
  "models/ming_omni/components/streaming_text.py:CompletedResult": "封装流式处理完成后的主结果和可选错误。",
  "models/ming_omni/components/streaming_text.py:SegmenterConfig": "定义首段阈值、后续阈值、最大窗口和超时等分段策略。",
  "models/ming_omni/components/streaming_text.py:TextSegment": "表示带序号和终态标志的可朗读文本片段。",
  "models/ming_omni/components/streaming_text.py:SegmenterState": "累计文本增量并按标点、词元预算或刷新请求发出有序片段。",
  "models/ming_omni/components/talker_executor.py:_build_talker_usage": "根据输入和输出长度构造 Talker 用量统计。",
  "models/ming_omni/components/talker_executor.py:MingTalkerExecutor": "异步管理 Ming Talker 请求，选择语音输出、运行 TTS 并返回音频事件。",
  "models/ming_omni/components/vision_encoder.py:_extract_vision_dict": "从顶层模型配置中提取视觉编码器配置字典。",
  "models/ming_omni/components/vision_encoder.py:_remap_ming_vision_weight": "把 Ming 检查点视觉权重名称映射到 SGLang ViT 模块名称。",
  "models/ming_omni/components/vision_encoder.py:_build_qwen3_vision_block_kwargs": "把 Ming 视觉配置转换为 Qwen3 视觉块构造参数。",
  "models/ming_omni/components/vision_encoder.py:_linear_patch_embed": "以线性矩阵形式执行视觉块嵌入投影。",
  "models/ming_omni/components/vision_encoder.py:MingOmniVisionEncoder": "构建原生 SGLang ViT，执行位置编码插值、多尺度前向和检查点权重加载。",
  "models/ming_omni/configuration.py:BailingMoeV2Config": "将 Ming 的 Bailing MoE 语言模型字段适配为 SGLang 可识别配置。",
  "models/ming_omni/configuration.py:BailingMM2Config": "组合 Bailing 语言、视觉与音频子配置形成多模态 Hugging Face 配置。",
  "models/ming_omni/hf_config.py:WhisperEncoderConfig": "保存 Whisper 音频编码器的 Mel、上下文、维度和层数配置。",
  "models/ming_omni/hf_config.py:AudioConfig": "描述 Ming 音频组件并支持从字典构造。",
  "models/ming_omni/hf_config.py:VisionConfig": "描述 Ming 视觉主干和投影器参数并支持从字典构造。",
  "models/ming_omni/hf_config.py:BailingMoeV2LLMConfig": "描述 Ming Bailing MoE 语言模型结构并支持从字典构造。",
  "models/ming_omni/hf_config.py:MingOmniConfig": "聚合音频、视觉和语言模型子配置形成顶层 Ming-Omni 配置。",
  "models/ming_omni/io.py:PromptInputs": "描述 Thinker 的输入 ID、注意力掩码和原始提示文本。",
  "models/ming_omni/io.py:PreprocessingData": "描述预处理阶段产生的多模态特征、长度和提示数据。",
  "models/ming_omni/io.py:ThinkerOutput": "描述 Ming Thinker 的文本、词元、隐藏状态和结束信息。",
  "models/ming_omni/io.py:MingOmniPipelineState": "保存 Ming 请求从预处理到 Thinker、Talker 和最终事件的完整跨阶段状态。",
  "models/ming_omni/io.py:MingOmniEvent": "表示带类型、模态和负载的 Ming-Omni 输出事件。"
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
      nodes.push({
        id: sid,
        type: kind,
        name: item.name,
        filePath: path,
        lineRange: [item.startLine, item.endLine],
        summary: S[key],
        tags,
        complexity: complexity(item.startLine, item.endLine, kind)
      });
      map.set(item.name, sid);
      edges.push({ source: fileId, target: sid, type: "contains", direction: "forward", weight: 1 });
      if (exported.has(item.name)) edges.push({ source: fileId, target: sid, type: "exports", direction: "forward", weight: 0.8 });
    }
  }
  localSymbols.set(path, map);
}

for (const [sourcePath, targets] of Object.entries(input.batchImportData)) {
  for (const targetPath of targets) {
    edges.push({ source: id("file", sourcePath), target: id(targetPath.endsWith(".md") ? "document" : "file", targetPath), type: "imports", direction: "forward", weight: 0.7 });
  }
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

const semantic = [
  ["class", "models/llada2_uni/components/image_encoder.py", "LLaDA2ImageEncoder", "class", "models/llada2_uni/components/image_encoder.py", "VisionEncoder"],
  ["class", "models/llada2_uni/components/image_encoder.py", "LLaDA2ImageEncoder", "class", "models/llada2_uni/components/image_encoder.py", "VQVAE"],
  ["class", "models/llada2_uni/components/preprocessor.py", "LLaDA2Preprocessor", "function", "models/llada2_uni/components/preprocessor.py", "validate_prompt_seq_len"],
  ["class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeSparseMoeBlock", "class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeGate"],
  ["class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeBlock", "class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeAttention"],
  ["class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeBlock", "class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeSparseMoeBlock"],
  ["class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeModelLM", "class", "models/llada2_uni/components/thinker.py", "LLaDA2MoeTextModel"],
  ["function", "models/llada2_uni/request_builders.py", "build_dllm_thinker_request", "function", "models/llada2_uni/request_builders.py", "merge_image_tokens_for_thinker"],
  ["function", "models/llada2_uni/stages.py", "create_decode_executor", "function", "models/llada2_uni/merge.py", "decode_events"],
  ["class", "models/ming_omni/components/audio_encoder.py", "MingAudioEncoder", "class", "models/ming_omni/components/audio_encoder.py", "Transpose"],
  ["class", "models/ming_omni/components/image_encoder.py", "MingImageEncoder", "class", "models/ming_omni/components/vision_encoder.py", "MingOmniVisionEncoder"],
  ["class", "models/ming_omni/components/image_encoder.py", "MingImageEncoder", "class", "models/ming_omni/components/projectors.py", "VisionProjector"],
  ["class", "models/ming_omni/components/preprocessor.py", "MingPreprocessor", "function", "models/ming_omni/components/preprocessor.py", "compute_mel_spectrogram"],
  ["class", "models/ming_omni/components/streaming_detokenizer.py", "MingStreamingDetokenizeScheduler", "function", "models/ming_omni/components/streaming_detokenizer.py", "text_output_requested"],
  ["class", "models/ming_omni/components/streaming_segmenter.py", "MingStreamingSegmenterScheduler", "class", "models/ming_omni/components/streaming_text.py", "SegmenterState"],
  ["class", "models/ming_omni/components/streaming_talker.py", "MingStreamingTalkerScheduler", "class", "models/ming_omni/components/streaming_text.py", "TextSegment"],
  ["class", "models/ming_omni/components/talker_executor.py", "MingTalkerExecutor", "function", "models/ming_omni/components/talker_executor.py", "_build_talker_usage"],
  ["class", "models/ming_omni/components/vision_encoder.py", "MingOmniVisionEncoder", "function", "models/ming_omni/components/vision_encoder.py", "_remap_ming_vision_weight"],
  ["class", "models/ming_omni/hf_config.py", "MingOmniConfig", "class", "models/ming_omni/hf_config.py", "AudioConfig"],
  ["class", "models/ming_omni/hf_config.py", "MingOmniConfig", "class", "models/ming_omni/hf_config.py", "VisionConfig"],
  ["class", "models/ming_omni/hf_config.py", "MingOmniConfig", "class", "models/ming_omni/hf_config.py", "BailingMoeV2LLMConfig"]
];

for (const [sk, sp, sn, tk, tp, tn] of semantic) {
  const source = id(sk, sp, sn);
  const target = id(tk, tp, tn);
  const key = `${source}|${target}|depends_on`;
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
  const ids = new Set(partNodes.map((n) => n.id));
  parts.push({ nodes: partNodes, edges: edges.filter((e) => ids.has(e.source)) });
}

const selected = Number(process.argv[2] || 0);
for (let i = 0; i < parts.length; i++) {
  if (selected && selected !== i + 1) continue;
  const name = partCount === 1 ? "batch-19.json" : `batch-19-part-${i + 1}.json`;
  const json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}

if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

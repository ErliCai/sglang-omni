import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-23.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-23.json`, "utf8"));

const F = {
  "models/moss_tts_local/stages.py": ["创建 MOSS-TTS Local 的预处理、参考编码、SGLang 自回归生成和声码器阶段，并控制线程与共置显存预算。", ["moss-tts", "pipeline-stages", "reference-encoding", "memory-budget"], "complex"],
  "models/moss_tts_local/state_pool.py": ["以固定 GPU 行缓冲区保存 MOSS-TTS 请求的解码关键状态，并用独立日志收集逐步输出帧。", ["moss-tts", "decode-state", "gpu-buffer", "state-pool"], "complex"],
  "models/moss_tts_local/streaming_vocoder.py": ["实现 MOSS-TTS Local 流式声码器调度器，共享持久编解码会话、合并等步请求并支持 CUDA 图和离线回退。", ["moss-tts", "streaming-vocoder", "batching", "cuda-graph"], "complex"],
  "models/moss_tts_local/vocoder_cuda_graph.py": ["为 MOSS 流式编解码器按帧数捕获和复用 CUDA 图，并修补注意力缓存以保持静态地址。", ["moss-tts", "vocoder", "cuda-graph", "static-cache"], "complex"],
  "models/qwen3_asr/__init__.py": ["公开 Qwen3-ASR 模型支持及其流水线配置模块。", ["qwen3-asr", "model-package", "pipeline-config"], "simple"],
  "models/qwen3_asr/config.py": ["定义 Qwen3-ASR 单阶段 SGLang 流水线、音频分块策略、预编码服务批量与缓存参数。", ["qwen3-asr", "pipeline-config", "audio-chunking", "encoder-service"], "moderate"],
  "models/qwen3_asr/encoder_service.py": ["在线程与独立 CUDA 流中批量预计算 Qwen3-ASR 的 LM 就绪音频嵌入，提供缓存、失败隔离、重试和统计。", ["qwen3-asr", "audio-encoder", "batch-service", "embedding-cache"], "complex"],
  "models/qwen3_asr/engine_builder.py": ["构建 Qwen3-ASR SGLang 引擎，校验显存与设备能力，装配音频编码服务、请求适配器、回调和清理逻辑。", ["qwen3-asr", "engine-builder", "memory-validation", "encoder-service"], "complex"],
  "models/qwen3_asr/stages.py": ["创建由 SGLang 驱动的 Qwen3-ASR 单阶段执行器，并保留兼容工厂别名。", ["qwen3-asr", "stage-factory", "sglang-runtime"], "moderate"],
  "models/qwen3_omni/__init__.py": ["通过惰性属性加载公开 Qwen3-Omni 配置、组件和能力，避免导入时初始化重型依赖。", ["qwen3-omni", "lazy-import", "public-api"], "moderate"],
  "models/qwen3_omni/bootstrap.py": ["分别构建 Qwen3-Omni Thinker 与 Talker 的 SGLang 调度器并应用模型专用服务器参数。", ["qwen3-omni", "scheduler-bootstrap", "thinker", "talker"], "complex"],
  "models/qwen3_omni/components/__init__.py": ["标记 Qwen3-Omni 模型组件包。", ["qwen3-omni", "components", "package"], "simple"],
  "models/qwen3_omni/components/audio_encoder.py": ["封装 Qwen3-Omni 音频塔，打包变长特征、共享重复片段并可用 CUDA 图执行编码层栈。", ["qwen3-omni", "audio-encoder", "variable-length", "cuda-graph"], "complex"],
  "models/qwen3_omni/components/audio_layer_graph.py": ["为 Qwen3-Omni 音频编码器层栈按分段形状捕获 CUDA 图，并在运行时选择图回放或即时执行。", ["qwen3-omni", "audio-layers", "cuda-graph", "graph-replay"], "complex"],
  "models/qwen3_omni/components/code2wav_cuda_graph.py": ["管理 Qwen3-Omni Code2Wav 精确形状 CUDA 图的构建、显存预算、数值等价校验、回滚和运行时降级。", ["qwen3-omni", "code2wav", "cuda-graph", "memory-safety"], "complex"],
  "models/qwen3_omni/components/code2wav_scheduler.py": ["调度流式 Code2Wav 解码，维护请求窗口与固定槽位，合并批次、选择 CUDA 图并输出增量或最终音频。", ["qwen3-omni", "code2wav", "streaming-scheduler", "batching"], "complex"],
  "models/qwen3_omni/components/common.py": ["加载 Qwen3-Omni Thinker 配置并汇总音频、视觉和语言模型关键规格。", ["qwen3-omni", "model-config", "component-spec"], "simple"],
  "models/qwen3_omni/components/image_encoder.py": ["构建 Qwen3-Omni 视觉编码器，优化块嵌入并规范化视觉输出供多模态流水线使用。", ["qwen3-omni", "image-encoder", "vision-transformer", "patch-embedding"], "complex"],
  "models/qwen3_omni/components/preprocessor.py": ["解析 Qwen3-Omni 文本、图像、视频和音频输入，构建聊天模板、缓存键、多模态特征和流水线状态。", ["qwen3-omni", "multimodal-preprocessing", "cache-key", "prompt-building"], "complex"],
  "models/qwen3_omni/components/sglang_thinker.py": ["实现仅保留文本主干和 LM 头的 SGLang Qwen3-Omni Thinker，复用独立阶段注入的音视频嵌入。", ["qwen3-omni", "sglang-thinker", "text-model", "weight-loading"], "complex"],
  "models/qwen3_omni/components/streaming_detokenizer.py": ["增量解码 Qwen3-Omni Thinker 词元并以 UTF-8 安全方式发送文本增量，同时合并终态主负载。", ["qwen3-omni", "streaming-detokenizer", "utf8", "scheduler"], "complex"],
  "models/qwen3_omni/components/talker.py": ["以 SGLang 原生层实现 Qwen3-Omni MoE Talker 与码本预测器，支持增量缓存、静态采样缓冲和预测器 CUDA 图。", ["qwen3-omni", "talker", "mixture-of-experts", "code-predictor", "cuda-graph"], "complex"],
  "models/qwen3_omni/components/talker_input.py": ["按 Hugging Face 兼容布局切分聊天模板并组合系统、用户、助手和多模态嵌入，构造 Talker 预填充输入。", ["qwen3-omni", "talker-input", "chat-template", "prefill"], "complex"],
  "models/qwen3_omni/components/talker_prefill.py": ["构建提示感知的 Talker 预填充状态，合并模态特征、说话人嵌入并维护未来文本隐藏状态队列。", ["qwen3-omni", "talker-prefill", "speaker-embedding", "multimodal-merge"], "complex"],
  "models/qwen3_omni/components/thinker.py": ["封装 Hugging Face Qwen3-Omni Thinker 的音频、视觉和文本子模块，分开加载后合并多模态嵌入。", ["qwen3-omni", "thinker", "multimodal-embedding", "model-loading"], "complex"]
};

const S = {
  "models/moss_tts_local/stages.py:_configure_pipeline_threads": "按部署参数设置 MOSS 流水线各阶段和底层库的线程数量。",
  "models/moss_tts_local/stages.py:_apply_colocated_ar_memory_budget": "为与声码器共置的自回归引擎计算并应用静态显存占比预算。",
  "models/moss_tts_local/stages.py:_validate_loaded_process_memory_budget": "在模型加载后检查进程实际显存使用是否仍满足共置预算。",
  "models/moss_tts_local/stages.py:_normalize_processor_config": "规范化 MOSS 处理器配置中的兼容字段。",
  "models/moss_tts_local/stages.py:_resolve_codec_device": "根据阶段和 CUDA 可用性选择音频编解码器设备。",
  "models/moss_tts_local/stages.py:_load_moss_tts_local_processor": "加载 MOSS-TTS Local 处理器并应用运行时兼容配置。",
  "models/moss_tts_local/stages.py:_resolve_audio_tokenizer_model_path": "解析音频分词器的本地模型或仓库路径。",
  "models/moss_tts_local/stages.py:create_preprocessing_executor": "创建输入规范化、提示构建和参考音频编码的预处理执行器。",
  "models/moss_tts_local/stages.py:create_sglang_tts_engine_executor": "创建 MOSS 自回归音频码生成的 SGLang 引擎执行器。",
  "models/moss_tts_local/stages.py:create_vocoder_executor": "创建支持批量、流式和 CUDA 图的 MOSS 声码器执行器。",
  "models/moss_tts_local/stages.py:_ArMemoryBudget": "记录共置自回归引擎的显存预算与校验阈值。",
  "models/moss_tts_local/stages.py:_PathReferenceJob": "表示从本地路径读取并编码的参考音频任务。",
  "models/moss_tts_local/stages.py:_WaveformReferenceJob": "表示已解码波形及采样率的参考音频任务。",
  "models/moss_tts_local/stages.py:_BatchedReferenceEncoder": "在线程中合并参考音频编码任务，校验时长并批量调用音频分词器。",
  "models/moss_tts_local/stages.py:_MossLocalReferenceInput": "封装规范化后的参考音频内容和关联元数据。",
  "models/moss_tts_local/stages.py:_MossLocalReferenceEncodeHook": "为参考编码缓存服务提供输入规范化、编码、复验和缓存键策略。",
  "models/moss_tts_local/stages.py:_MossLocalReferenceEncoder": "封装批量参考编码器并暴露路径、数据 URI 编码和统计接口。",
  "models/moss_tts_local/state_pool.py:MossTTSLocalDecodeStatePool": "以稳定行索引管理反馈嵌入、采样参数、生成步和重复惩罚历史等 GPU 解码状态。",
  "models/moss_tts_local/state_pool.py:MossTTSLocalDecodeJournal": "收集每个生成步骤产生的输出帧而不占用下一步关键状态缓冲区。",
  "models/moss_tts_local/streaming_vocoder.py:_CodecStreamSession": "管理共享流式编解码会话、槽位生命周期、CUDA 图预热和批量解码。",
  "models/moss_tts_local/streaming_vocoder.py:_LocalStreamState": "保存单个 MOSS 流式请求的槽位、缓存码和解码进度。",
  "models/moss_tts_local/streaming_vocoder.py:_CoalescedStepPlan": "描述一次合并声码器步骤的参与请求和共同帧窗口。",
  "models/moss_tts_local/streaming_vocoder.py:MossTTSLocalStreamingVocoderScheduler": "调度流式码块摄取、合并解码、会话和槽位管理，并提供完整解码回退。",
  "models/moss_tts_local/vocoder_cuda_graph.py:_decoder_attention_modules": "遍历编解码器中需要静态缓存补丁的注意力模块。",
  "models/moss_tts_local/vocoder_cuda_graph.py:_cuda_graph_update_streaming_cache": "以原地写入方式更新流式注意力缓存，保持 CUDA 图地址稳定。",
  "models/moss_tts_local/vocoder_cuda_graph.py:patch_codec_attention_cache_for_cuda_graph": "为编解码器注意力安装适合 CUDA 图的缓存更新方法。",
  "models/moss_tts_local/vocoder_cuda_graph.py:_CapturedVocoderGraph": "保存特定帧数的声码器 CUDA 图及静态输入输出。",
  "models/moss_tts_local/vocoder_cuda_graph.py:MossVocoderCudaGraphRunner": "按支持帧数和显存预算捕获声码器图，并在解码步骤中选择图回放。",
  "models/qwen3_asr/config.py:Qwen3ASRFactoryArgs": "保存 Qwen3-ASR 引擎与音频预编码服务的工厂参数。",
  "models/qwen3_asr/config.py:Qwen3ASRStageConfig": "扩展引擎阶段配置以携带 ASR 专用工厂参数。",
  "models/qwen3_asr/config.py:Qwen3ASRPipelineConfig": "定义 Qwen3-ASR 单阶段流水线、音频分块和模型能力要求。",
  "models/qwen3_asr/encoder_service.py:build_cache_namespace": "根据模型、特征提取器和编码配置构造稳定的嵌入缓存命名空间。",
  "models/qwen3_asr/encoder_service.py:_expected_audio_tokens": "根据音频帧长度估算编码后对应的语言模型词元数。",
  "models/qwen3_asr/encoder_service.py:_text_hidden_size": "从模型配置解析文本主干隐藏维度。",
  "models/qwen3_asr/encoder_service.py:_DetachedFailure": "记录从批次中隔离出的失败音频项及其异常。",
  "models/qwen3_asr/encoder_service.py:Qwen3ASRPreLMEncoderService": "在专用工作线程和 CUDA 流中批量编码音频，缓存嵌入并隔离、重试失败项。",
  "models/qwen3_asr/engine_builder.py:Qwen3ASREngineBuilder": "完成 Qwen3-ASR 引擎资源校验、音频塔移交、编码服务接入和调度回调组装。",
  "models/qwen3_asr/stages.py:create_sglang_qwen3_asr_executor": "根据设备、并行和音频分块配置创建 Qwen3-ASR SGLang 执行器。",
  "models/qwen3_asr/stages.py:create_qwen3_asr_executor": "作为兼容别名转发到 SGLang Qwen3-ASR 执行器工厂。",
  "models/qwen3_omni/__init__.py:__getattr__": "按属性名称惰性导入 Qwen3-Omni 配置、规格与编码组件。",
  "models/qwen3_omni/bootstrap.py:create_thinker_scheduler": "配置并创建 Qwen3-Omni Thinker 的 SGLang 调度器。",
  "models/qwen3_omni/bootstrap.py:create_talker_scheduler": "配置 Talker 模型、码本预测和流式输出适配器并创建调度器。",
  "models/qwen3_omni/components/audio_encoder.py:_build_audio_tower": "从 Thinker 配置构建并加载 Qwen3-Omni 音频塔。",
  "models/qwen3_omni/components/audio_encoder.py:pack_padded_audio_features": "按有效长度去除批量音频特征填充并拼接为变长序列。",
  "models/qwen3_omni/components/audio_encoder.py:_forward_with_shared_segments": "只编码唯一音频片段并按共享映射恢复重复片段输出。",
  "models/qwen3_omni/components/audio_encoder.py:_share_segment_splits": "识别相同音频分段并生成唯一段与还原索引。",
  "models/qwen3_omni/components/audio_encoder.py:_SegmentSplits": "保存音频片段边界、唯一段和还原映射。",
  "models/qwen3_omni/components/audio_encoder.py:_GraphedLayerStack": "把音频编码层包装为可由 AudioLayerGraphRunner 回放的顺序栈。",
  "models/qwen3_omni/components/audio_encoder.py:Qwen3OmniAudioEncoder": "加载音频塔、启用层栈 CUDA 图并输出打包后的音频嵌入。",
  "models/qwen3_omni/components/audio_layer_graph.py:_varlen_attention_forward": "执行适合变长音频片段和静态图捕获的注意力前向。",
  "models/qwen3_omni/components/audio_layer_graph.py:_Captured": "保存一种分段形状对应的音频层 CUDA 图和静态张量。",
  "models/qwen3_omni/components/audio_layer_graph.py:AudioLayerGraphRunner": "按片段窗口捕获音频层栈图，并在匹配形状时回放否则即时执行。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:GraphKey": "以批量大小和码帧数标识一个 Code2Wav CUDA 图。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:Code2WavRunResult": "返回 Code2Wav 输出及是否命中 CUDA 图等运行元数据。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:_CapturedGraph": "保存单个精确形状图及其静态码输入和音频输出。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:_BuildFailure": "记录图捕获失败的键、阶段和异常原因。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:_TorchCudaApi": "封装 CUDA 设备、流、内存统计、捕获和同步操作以便测试与替换。",
  "models/qwen3_omni/components/code2wav_cuda_graph.py:Code2WavCudaGraphRunner": "按优先级和显存预算构建图，验证与即时结果等价，并在运行失败时安全降级。",
  "models/qwen3_omni/components/code2wav_scheduler.py:_serial_threshold_graph_keys": "生成适用于串行低延迟阈值的 Code2Wav 图键集合。",
  "models/qwen3_omni/components/code2wav_scheduler.py:_batched_graph_keys": "生成批量 Code2Wav 调度需要预捕获的图键集合。",
  "models/qwen3_omni/components/code2wav_scheduler.py:load_code2wav_model": "加载 Code2Wav 模型、设备和精度配置并切换到推理模式。",
  "models/qwen3_omni/components/code2wav_scheduler.py:create_code2wav_scheduler": "根据阶段参数加载模型、预热 CUDA 图并创建流式调度器。",
  "models/qwen3_omni/components/code2wav_scheduler.py:_PinnedSlot": "保存固定主机与设备缓冲区及其异步事件状态。",
  "models/qwen3_omni/components/code2wav_scheduler.py:_PendingWindow": "表示等待满足解码步长的码帧窗口和截止时间。",
  "models/qwen3_omni/components/code2wav_scheduler.py:Code2WavStreamState": "维护单个 Code2Wav 流的缓存码、解码位置和槽位状态。",
  "models/qwen3_omni/components/code2wav_scheduler.py:Code2WavScheduler": "消费码流、按期限与帧数组批，管理固定槽位并运行增量 Code2Wav 解码。",
  "models/qwen3_omni/components/common.py:load_thinker_config": "从本地模型配置读取 Qwen3-Omni Thinker 子配置。",
  "models/qwen3_omni/components/common.py:Qwen3OmniSpec": "汇总 Qwen3-Omni 音频、视觉、文本隐藏维度和特殊词元规格。",
  "models/qwen3_omni/components/image_encoder.py:_patch_embed_forward": "以优化的线性路径执行视觉块嵌入前向。",
  "models/qwen3_omni/components/image_encoder.py:_optimize_patch_embed": "把视觉编码器块嵌入替换为等价的推理优化实现。",
  "models/qwen3_omni/components/image_encoder.py:_unpack_visual_output": "从不同视觉模型返回形态中提取主特征张量。",
  "models/qwen3_omni/components/image_encoder.py:_build_visual": "根据 Thinker 配置构建并加载视觉编码器。",
  "models/qwen3_omni/components/image_encoder.py:Qwen3OmniImageEncoder": "封装视觉模型和块嵌入优化，输出供 Thinker 注入的图像特征。",
  "models/qwen3_omni/components/preprocessor.py:_resolve_local_model_dir": "解析本地 Qwen3-Omni 模型目录或获取所需仓库文件。",
  "models/qwen3_omni/components/preprocessor.py:_combine_cache_keys": "把多个模态缓存键合成为稳定请求键。",
  "models/qwen3_omni/components/preprocessor.py:_extra_special_tokens_compat": "为不同 Transformers 版本补齐额外特殊词元映射。",
  "models/qwen3_omni/components/preprocessor.py:_contextualize_cache_key": "把处理器与提示上下文加入原始媒体缓存键。",
  "models/qwen3_omni/components/preprocessor.py:validate_prompt_seq_len": "校验文本与多模态占位词元总长度不超过模型上下文。",
  "models/qwen3_omni/components/preprocessor.py:_is_pretokenized_prompt": "判断请求是否已经提供可直接使用的词元化提示。",
  "models/qwen3_omni/components/preprocessor.py:Qwen3OmniPreprocessor": "规范化多模态消息、运行处理器、提取媒体特征并构建完整流水线状态。",
  "models/qwen3_omni/components/sglang_thinker.py:_config_uses_mrope": "判断 Thinker 配置是否启用多模态旋转位置编码。",
  "models/qwen3_omni/components/sglang_thinker.py:Qwen3OmniThinkerForCausalLM": "组合 Qwen3 文本主干与 LM 头，接受外部模态嵌入并按 SGLang 格式加载权重。",
  "models/qwen3_omni/components/streaming_detokenizer.py:_event_to_dict": "把 Qwen3-Omni 事件转换为可传输字典。",
  "models/qwen3_omni/components/streaming_detokenizer.py:create_streaming_detokenize_scheduler": "加载分词器并创建流式反分词调度器。",
  "models/qwen3_omni/components/streaming_detokenizer.py:_RequestState": "保存单个流式解码请求的待处理词元、文本和终态。",
  "models/qwen3_omni/components/streaming_detokenizer.py:StreamingDetokenizeScheduler": "增量解码词元、发送文本增量并协调流结束与最终负载。",
  "models/qwen3_omni/components/talker.py:_bind_default_weight_loaders": "为 Talker 参数绑定默认的 SGLang 权重加载器。",
  "models/qwen3_omni/components/talker.py:_PredictorDecodeGraph": "捕获并回放单词元码本预测器解码 CUDA 图。",
  "models/qwen3_omni/components/talker.py:ResizeMLP": "把 Thinker 隐藏状态投影到 Talker 隐藏维度。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerDenseMLP": "实现 Talker 解码层的稠密门控前馈网络。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerSharedExpertMLP": "实现 Talker MoE 中始终参与计算的共享专家。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerSparseMoeBlock": "路由词元到稀疏专家并合并共享专家输出。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerDecoderLayer": "组合自注意力、MoE 前馈和残差归一化形成 Talker 解码层。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerTextModel": "堆叠 Talker 解码层并维护输入嵌入和 KV 缓存。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniMoeTalkerCodePredictor": "逐级预测多个音频码本，并支持直接注意力和增量缓存路径。",
  "models/qwen3_omni/components/talker.py:Qwen3OmniTalker": "协调 Talker 文本主干、码本预测器、采样缓冲和增量 CUDA 图，生成音频码序列。",
  "models/qwen3_omni/components/talker_input.py:segment_chat_template": "定位聊天模板中的系统、用户和助手片段边界。",
  "models/qwen3_omni/components/talker_input.py:build_user_part": "构造 Talker 用户段的词元和嵌入布局。",
  "models/qwen3_omni/components/talker_input.py:build_assistant_part": "组合助手文本、Thinker 隐藏状态和语音标记形成助手段。",
  "models/qwen3_omni/components/talker_input.py:build_prefill_input": "拼接系统、用户与助手段，生成 HF 兼容的 Talker 预填充输入。",
  "models/qwen3_omni/components/talker_prefill.py:_resolve_embed_source": "解析 Talker 预填充所用的词嵌入权重来源。",
  "models/qwen3_omni/components/talker_prefill.py:load_thinker_embedding_rows": "从检查点加载指定 Thinker 词元的嵌入行。",
  "models/qwen3_omni/components/talker_prefill.py:coerce_feature_tensor": "把模态特征转换为指定设备、精度和二维形态。",
  "models/qwen3_omni/components/talker_prefill.py:merge_prompt_modality": "把一种模态特征写入提示占位位置并校验行数。",
  "models/qwen3_omni/components/talker_prefill.py:resolve_speaker_id": "根据请求或默认配置解析说话人 ID。",
  "models/qwen3_omni/components/talker_prefill.py:TalkerPrefillBuilder": "重建提示隐藏状态、合并音视频和说话人嵌入，并维护增量文本行队列。",
  "models/qwen3_omni/components/thinker.py:_concat_features": "把可选模态特征列表拼接为统一张量。",
  "models/qwen3_omni/components/thinker.py:_should_tie_embeddings": "判断 Thinker 输入嵌入与语言模型头是否应共享权重。",
  "models/qwen3_omni/components/thinker.py:_maybe_tie_weights": "按配置把语言模型输出头绑定到输入嵌入权重。",
  "models/qwen3_omni/components/thinker.py:_build_text_model": "根据配置构建并加载 Thinker 文本模型。",
  "models/qwen3_omni/components/thinker.py:_build_lm_head": "构建并加载 Thinker 词表输出头。",
  "models/qwen3_omni/components/thinker.py:_build_thinker_shell": "在空权重上下文中创建 Hugging Face Thinker 外壳。",
  "models/qwen3_omni/components/thinker.py:Qwen3OmniSplitThinker": "分别加载音频、视觉和文本组件，合并模态嵌入并执行 Thinker 前向。"
};

const id = (kind, path, name) => `${kind}:${path}${name ? `:${name}` : ""}`;
const slug = (name) => name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
const complexity = (start, end, kind) => {
  const span = end - start + 1;
  if (span > 150) return "complex";
  if (span > 45 || (kind === "class" && span > 20)) return "moderate";
  return "simple";
};

const nodes = [], edges = [], localSymbols = new Map();
for (const result of extracted.results) {
  const path = result.path, info = F[path];
  if (!info) throw new Error(`缺少文件说明: ${path}`);
  const fileType = result.fileCategory === "code" ? "file" : "document", fileId = id(fileType, path);
  nodes.push({ id: fileId, type: fileType, name: path.split("/").at(-1), filePath: path, summary: info[0], tags: info[1], complexity: info[2] });
  const exported = new Set((result.exports || []).map((x) => x.name)), map = new Map();
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) {
    for (const item of list) {
      const key = `${path}:${item.name}`;
      if (!S[key]) throw new Error(`缺少符号说明: ${key}`);
      const sid = id(kind, path, item.name), tags = [...new Set([info[1][0], info[1][1], slug(item.name), kind])].slice(0, 5);
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
    const source = map.get(call.caller), target = map.get(call.callee), key = `${source}|${target}|calls`;
    if (source && target && source !== target && !edgeKeys.has(key)) {
      edges.push({ source, target, type: "calls", direction: "forward", weight: 0.8 });
      edgeKeys.add(key);
    }
  }
}

const D = [
  ["function", "models/moss_tts_local/stages.py", "create_preprocessing_executor", "class", "models/moss_tts_local/stages.py", "_MossLocalReferenceEncoder"],
  ["function", "models/moss_tts_local/stages.py", "create_vocoder_executor", "class", "models/moss_tts_local/streaming_vocoder.py", "MossTTSLocalStreamingVocoderScheduler"],
  ["class", "models/moss_tts_local/streaming_vocoder.py", "MossTTSLocalStreamingVocoderScheduler", "class", "models/moss_tts_local/streaming_vocoder.py", "_CodecStreamSession"],
  ["class", "models/moss_tts_local/vocoder_cuda_graph.py", "MossVocoderCudaGraphRunner", "function", "models/moss_tts_local/vocoder_cuda_graph.py", "patch_codec_attention_cache_for_cuda_graph"],
  ["class", "models/qwen3_asr/encoder_service.py", "Qwen3ASRPreLMEncoderService", "function", "models/qwen3_asr/encoder_service.py", "build_cache_namespace"],
  ["function", "models/qwen3_asr/stages.py", "create_sglang_qwen3_asr_executor", "class", "models/qwen3_asr/engine_builder.py", "Qwen3ASREngineBuilder"],
  ["class", "models/qwen3_omni/components/audio_encoder.py", "Qwen3OmniAudioEncoder", "class", "models/qwen3_omni/components/audio_layer_graph.py", "AudioLayerGraphRunner"],
  ["class", "models/qwen3_omni/components/code2wav_scheduler.py", "Code2WavScheduler", "class", "models/qwen3_omni/components/code2wav_cuda_graph.py", "Code2WavCudaGraphRunner"],
  ["class", "models/qwen3_omni/components/image_encoder.py", "Qwen3OmniImageEncoder", "function", "models/qwen3_omni/components/image_encoder.py", "_build_visual"],
  ["class", "models/qwen3_omni/components/preprocessor.py", "Qwen3OmniPreprocessor", "function", "models/qwen3_omni/components/preprocessor.py", "validate_prompt_seq_len"],
  ["class", "models/qwen3_omni/components/sglang_thinker.py", "Qwen3OmniThinkerForCausalLM", "function", "models/qwen3_omni/components/sglang_thinker.py", "_config_uses_mrope"],
  ["class", "models/qwen3_omni/components/talker.py", "Qwen3OmniMoeTalkerSparseMoeBlock", "class", "models/qwen3_omni/components/talker.py", "Qwen3OmniMoeTalkerSharedExpertMLP"],
  ["class", "models/qwen3_omni/components/talker.py", "Qwen3OmniMoeTalkerDecoderLayer", "class", "models/qwen3_omni/components/talker.py", "Qwen3OmniMoeTalkerSparseMoeBlock"],
  ["class", "models/qwen3_omni/components/talker.py", "Qwen3OmniTalker", "class", "models/qwen3_omni/components/talker.py", "Qwen3OmniMoeTalkerCodePredictor"],
  ["function", "models/qwen3_omni/components/talker_input.py", "build_prefill_input", "function", "models/qwen3_omni/components/talker_input.py", "segment_chat_template"],
  ["class", "models/qwen3_omni/components/talker_prefill.py", "TalkerPrefillBuilder", "function", "models/qwen3_omni/components/talker_prefill.py", "merge_prompt_modality"],
  ["class", "models/qwen3_omni/components/thinker.py", "Qwen3OmniSplitThinker", "function", "models/qwen3_omni/components/thinker.py", "_build_text_model"]
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
const paths = extracted.results.map((x) => x.path).sort(), chunkSize = Math.ceil(paths.length / partCount), parts = [];
for (let i = 0; i < partCount; i++) {
  const allowed = new Set(paths.slice(i * chunkSize, (i + 1) * chunkSize));
  const partNodes = nodes.filter((n) => allowed.has(n.filePath)), local = new Set(partNodes.map((n) => n.id));
  parts.push({ nodes: partNodes, edges: edges.filter((e) => local.has(e.source)) });
}
const selected = Number(process.argv[2] || 0);
for (let i = 0; i < parts.length; i++) {
  if (selected && selected !== i + 1) continue;
  const name = partCount === 1 ? "batch-23.json" : `batch-23-part-${i + 1}.json`, json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}
if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

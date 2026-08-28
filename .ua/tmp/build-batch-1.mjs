import fs from "node:fs";
import path from "node:path";

const projectRoot = "C:/Users/erlic/Documents/sgl-omni/sglang-omni";
const uaDir = path.join(projectRoot, ".ua");
const extractPath = path.join(uaDir, "tmp", "ua-file-extract-results-1.json");
const batchesPath = path.join(uaDir, "intermediate", "batches.json");
const extract = JSON.parse(fs.readFileSync(extractPath, "utf8"));
const batchContainer = JSON.parse(fs.readFileSync(batchesPath, "utf8"));
const batches = Array.isArray(batchContainer) ? batchContainer : batchContainer.batches;
const batch = batches.find((entry) => entry.batchIndex === 1);

if (!extract.scriptCompleted || extract.results.length !== batch.files.length) {
  throw new Error("批次 1 的结构提取结果不完整");
}

const fileSummaries = {
  "sglang_omni/comm/__init__.py": "汇总通信子系统的公共接口，向调用方统一暴露数据引用、通信引擎、KV 传输对象与路由器。",
  "sglang_omni/comm/data_ref.py": "定义跨阶段传输所用的数据引用协议，包括张量元数据、后端句柄与布局信息，并提供严格的字典序列化和反序列化。",
  "sglang_omni/comm/engine.py": "实现多阶段推理的核心通信引擎，统一协调 payload、流式分块、relay 与 KV page 的异步发送、确认、失败恢复和资源清理。",
  "sglang_omni/comm/kv_transfer.py": "定义 KV cache 页传输的内存区域、池、目标、接收器和租约抽象，负责校验布局及页索引并约束提交/回滚生命周期。",
  "sglang_omni/comm/router.py": "根据对象位置、设备类型与节点拓扑选择通信 relay 和传输方式，并在 direct CUDA IPC 不可用时执行可观测的回退。",
  "sglang_omni/comm/stage_io.py": "提供阶段间 payload、张量和流式分块的编解码管线，支持 inline 数据、relay buffer 与 direct CUDA IPC，并保留嵌套张量元数据。",
  "sglang_omni/model_runner/model_worker.py": "封装 SGLang 模型 worker 的配置、runner 初始化与推理入口，集中应用平台后端策略、量化适配、CUDA graph 统计和在线权重更新。",
  "sglang_omni/models/qwen3_omni/components/sglang_thinker.py": "将 Qwen3-Omni Thinker 文本模型接入 SGLang 的 CausalLM 接口，处理 mRoPE/fused RoPE 安装、前向计算与 checkpoint 权重装载。",
  "sglang_omni/models/qwen3_omni/components/talker.py": "实现 Qwen3-Omni Talker 的 MoE 解码器、code predictor 和增量生成路径，并用 CUDA graph 与静态 buffer 优化单 token 解码。",
  "sglang_omni/models/qwen3_omni/components/thinker_fused_rope.py": "为 Thinker 注意力层安装可门控的 fused QK normalization 与 RoPE 路径，并依据设备能力和 prefill graph 状态安全回退。",
  "sglang_omni/models/qwen3_omni/components/thinker_model.py": "实现 Qwen3-Omni Thinker 的注意力、稀疏 MoE、decoder layer 和文本主干，同时处理 YaRN RoPE 参数及融合权重映射。",
  "sglang_omni/models/qwen3_omni/hf_config.py": "定义 Qwen3-Omni 音频、视觉、Thinker、Talker 与 code predictor 的 Hugging Face 配置对象，并规范化复合模型的 RoPE 参数。",
  "sglang_omni/models/qwen3_tts/compat.py": "封装 Qwen3-TTS 对不同 Transformers 版本的兼容补丁，补齐 RoPE 参数和 mask factory API 差异。",
  "sglang_omni/models/qwen3_tts/sampling_kernels.py": "提供面向小 top-k 的确定性有种子分类采样入口，基于排序后的 log-probability 执行高效 token 选择。",
  "sglang_omni/models/qwen3_tts/sglang_model.py": "实现 Qwen3-TTS Talker 与 code predictor 的 SGLang 推理模型，覆盖音色克隆、自定义音色、语音设计、speaker embedding 和图优化增量解码。",
  "sglang_omni/pipeline/__init__.py": "作为 pipeline 包的轻量入口，通过延迟属性解析暴露主要运行时类型，避免导入阶段提前加载重型依赖。",
  "sglang_omni/pipeline/control_plane.py": "封装 ZeroMQ 控制平面的上下文和 Push/Pull/Pub/Sub socket，为阶段与协调器提供提交、事件、流信号、管理命令和中止广播。",
  "sglang_omni/pipeline/local_dispatch.py": "实现同进程阶段之间的低开销分发，将 payload、流式分块和完成信号直接路由到已注册的 Stage 实例。",
  "sglang_omni/pipeline/stage/__init__.py": "作为 stage 子包的延迟导入入口，按需公开输入处理器和 Stage 运行时，减少循环依赖与启动成本。",
  "sglang_omni/pipeline/stage/input.py": "定义阶段输入协议及 direct、aggregated 两种实现，支持多上游结果的等待、规范化、合并与取消。",
  "sglang_omni/pipeline/stage/runtime.py": "实现 pipeline Stage 的完整异步状态机，负责请求接收、依赖排序、执行、流路由、跨阶段传输、管理操作、中止和故障清理。",
  "sglang_omni/pipeline/stage_workers.py": "负责将阶段拓扑构造成独立 worker 进程，配置加速器环境和本地调度，并管理启动握手、分布式资源及异常后的显存回收。",
  "sglang_omni/pipeline/tp_control.py": "实现 tensor-parallel 组内控制协议，由 leader 向 follower 分发工作、中止和管理消息，并聚合管理结果。",
  "sglang_omni/platforms/__init__.py": "检测当前 CPU/CUDA/ROCm/MUSA/NPU/XPU 后端，并将 SGLang 平台对象适配为统一 OmniPlatform 能力接口。",
  "sglang_omni/platforms/cpu.py": "提供 CPU 后端的 Omni 平台能力声明，明确 CPU 路径不启用 code-to-wave CUDA graph。",
  "sglang_omni/platforms/cuda.py": "实现 CUDA 后端的进程环境、IPC、fused RoPE 和模型 backend policy，并针对 H20 与 FP8 CUTLASS MoE 能力做条件选择。",
  "sglang_omni/platforms/interface.py": "定义跨硬件后端的 OmniPlatform 能力协议，为进程环境、传输、fused RoPE、backend policy 与 graph 开关提供默认实现。",
  "sglang_omni/platforms/musa.py": "将 MUSA 设备接入 Omni 平台接口，复用 CUDA 兼容策略并覆盖 fused RoPE 与模型后端配置。",
  "sglang_omni/platforms/npu.py": "提供 NPU 设备对象与 Omni 平台适配，统一设备选择并声明 code-to-wave graph 支持。",
  "sglang_omni/platforms/rocm.py": "实现 ROCm 后端的进程环境、节点内传输、fused RoPE 与保守的模型后端策略。",
  "sglang_omni/platforms/xpu.py": "实现 Intel XPU 的设备管理、进程环境、fused RoPE cache 和模型后端策略。",
  "sglang_omni/profiler/base_profiler.py": "定义 profiler 的统一生命周期和 step context 接口，并提供分布式 rank 查询等默认行为。",
  "sglang_omni/profiler/comm_trace.py": "提供由环境变量控制的轻量通信事件追踪，统一纳秒计时、耗时换算与结构化日志输出。",
  "sglang_omni/profiler/torch_profiler.py": "将 torch.profiler 适配到项目 profiler 接口，管理 run id、trace 文件、step 推进和活跃上下文。",
  "sglang_omni/quantization.py": "解析并规范化模型量化配置，处理阶段前缀、FP8 block 配置和 scale inverse 转换，并为权重加载选择预处理器。"
};

const classDescriptions = {
  TransportKind: "枚举通信后端可采用的传输类型，作为 DataRef 协议中的稳定标识。",
  DataKind: "枚举通信对象的数据语义，用于区分 payload、tensor 与其他传输内容。",
  DataLayout: "枚举传输缓冲区的数据布局，指导接收端重建原始对象。",
  TensorMeta: "记录嵌套张量的路径、shape、dtype、device 与缓冲区切片，并支持协议字典互转。",
  BackendRef: "封装 relay 后端句柄及数据长度，在控制平面消息和实际传输资源之间建立引用。",
  MetadataTensorRef: "关联元数据字段路径与其独立张量引用，支持复杂流式元数据的恢复。",
  DataRef: "表示一次可跨进程传递的数据对象，汇总协议版本、布局、buffer、张量切片和元数据。",
  _InboundKVTransfer: "跟踪入站 KV page 传输的请求、接收器、目标与中止状态。",
  _PendingTransfer: "维护异步传输操作、确认任务、租约及失败后的保留策略。",
  _PayloadSendJob: "描述进入发送队列的 payload 作业，包括 relay、目标 endpoint、transport 与 replica 绑定。",
  _StreamSendJob: "描述流式分块发送作业，携带 chunk、metadata、目标阶段和 replica 绑定。",
  CommEngine: "集中管理 payload、stream 与 KV cache 的异步通信生命周期，并协调控制平面确认和 relay 资源。",
  KVBufferRegion: "把一个 KV tensor 暴露为按页寻址的字节区域，并校验 page size 和连续视图。",
  KVPool: "聚合多个 KV buffer 区域，提供统一设备、布局与页索引校验。",
  KVPageDestination: "描述接收 KV page 的目标 pool 及页索引。",
  KVReceiver: "定义 KV page 接收器协议，约束 reserve、commit 与 abort 三阶段操作。",
  KVPageLease: "表示一次 KV 接收预留的可释放租约。",
  CommRouter: "依据 topology、device 和对象位置选择 local、CUDA IPC 或 relay 传输，并缓存活跃 relay。",
  ModelWorkerConfig: "保存模型 worker 启动所需的架构覆盖、权重前缀、NCCL 端口与显存预算。",
  _PrefillCudaGraphUsage: "累计 prefill 阶段 CUDA graph replay 与 eager fallback 的使用统计。",
  ModelWorker: "包装 SGLang ModelRunner 的初始化、生成、量化后端策略、CUDA graph 观测和在线权重更新。",
  Qwen3OmniThinkerForCausalLM: "把 Qwen3-Omni Thinker 主干包装为 CausalLM，统一 forward、logits 与 checkpoint 权重加载。",
  _PredictorDecodeGraph: "捕获并重放 code predictor 的固定形状单 token CUDA graph，以降低解码调度开销。",
  ResizeMLP: "使用两层投影调整 Talker 隐状态维度，为后续 code predictor 提供输入。",
  Qwen3OmniMoeTalkerDenseMLP: "实现 Talker decoder 中的 dense gated MLP 分支。",
  Qwen3OmniMoeTalkerSharedExpertMLP: "实现 Talker MoE 的共享专家分支并融合门控输出。",
  Qwen3OmniMoeTalkerSparseMoeBlock: "路由 token 到稀疏专家并与共享专家结果组合。",
  Qwen3OmniMoeTalkerDecoderLayer: "组合自注意力、归一化与 MoE 前馈网络形成 Talker decoder layer。",
  Qwen3OmniMoeTalkerTextModel: "堆叠 Talker decoder layers，维护 embedding 与文本隐状态前向路径。",
  Qwen3OmniMoeTalkerCodePredictor: "基于 Talker 隐状态增量预测 codec token，并提供 direct attention 优化路径。",
  Qwen3OmniTalker: "编排 Talker 主模型、code predictor、采样和缓存管理，支持高吞吐流式语音 token 生成。",
  ThinkerFusedRopeGate: "评估当前输入与设备是否满足 fused QK normalization/RoPE kernel 的启用条件。",
  Qwen3OmniMoeThinkerTextAttention: "实现 Thinker 文本注意力，拆分 QKV 准备、QK norm、RoPE 与核心 attention 计算。",
  Qwen3OmniMoeThinkerTextSparseMoeBlock: "实现 Thinker 的稀疏专家路由和普通 fallback 前向路径。",
  Qwen3OmniMoeThinkerTextDecoderLayer: "组合 attention、归一化与 sparse MoE 构成 Thinker decoder layer。",
  Qwen3OmniMoeThinkerTextModel: "实现 Thinker 文本主干、deepstack 多模态特征注入及分片权重加载。",
  Qwen3OmniMoeAudioEncoderConfig: "保存 Qwen3-Omni 音频编码器的结构与特征提取配置。",
  Qwen3OmniMoeVisionEncoderConfig: "保存 Qwen3-Omni 视觉编码器的 patch、hidden size 与注意力配置。",
  Qwen3OmniMoeTextConfig: "描述 Thinker 文本 MoE 主干的层数、专家、attention 和 RoPE 参数。",
  Qwen3OmniMoeThinkerConfig: "组合音频、视觉与文本子配置，定义完整 Thinker 模型。",
  Qwen3OmniMoeTalkerTextConfig: "描述 Talker 文本解码器及 MoE 专家配置。",
  Qwen3OmniMoeTalkerCodePredictorConfig: "描述 Talker code predictor 的层、词表与 codec codebook 参数。",
  Qwen3OmniMoeTalkerConfig: "组合 Talker text model 与 code predictor 配置。",
  Qwen3TTSTalkerDecoderLayer: "实现 Qwen3-TTS Talker 的注意力与前馈 decoder layer。",
  Qwen3TTSTalkerTextModel: "构建 TTS Talker 文本主干并生成条件化文本 embedding 与 hidden states。",
  Qwen3TTSCodePredictor: "将 Talker hidden state 投影到多 codebook 预测空间。",
  Qwen3TTSTalker: "编排 speaker encoder、prompt 构造、Talker 解码与 codec token 采样，支持多种 TTS 任务模式。",
  ControlPlaneContext: "以单例方式管理 ZeroMQ context，供所有控制平面 socket 共享并统一关闭。",
  PushSocket: "封装 ZeroMQ PUSH socket 的连接、发送和关闭操作。",
  PullSocket: "封装可异步接收的 ZeroMQ PULL socket，并提供阻塞与非阻塞读取。",
  PubSocket: "封装 ZeroMQ PUB socket，用于绑定 endpoint 并广播控制消息。",
  SubSocket: "封装 ZeroMQ SUB socket，支持订阅连接、轮询和消息接收。",
  StageControlPlane: "为单个 Stage 提供请求接收、跨阶段发送、流事件、管理结果和 abort 通道。",
  CoordinatorControlPlane: "为 pipeline 协调器提供提交、事件接收、管理广播、abort 与 shutdown 控制。",
  LocalStageDispatcher: "维护同进程 Stage 注册表并直接投递 payload、stream chunk 和完成信号。",
  InputHandler: "定义 Stage 输入的异步 receive 与 cancel 协议。",
  DirectInput: "直接返回单个上游 payload 的最小输入实现。",
  AggregatedInput: "等待多个预期上游，规范化来源后合并结果，并支持取消未完成接收。",
  Stage: "实现 pipeline 阶段的并发运行时状态机，协调执行、数据传输、stream、管理命令与异常恢复。",
  StageLaunchConfig: "完整描述 Stage 的角色、TP 布局、设备、endpoint、路由、stream 和进程间队列。",
  StageWorkerProcessSpec: "把一组 Stage 启动配置绑定到一个命名 worker 进程。",
  StageGroup: "管理同一 Stage 组的进程规格、spawn、就绪等待、死亡检测与关闭。",
  TPWorkMessage: "封装 tensor-parallel follower 接收的请求标识与工作数据。",
  TPLeaderFanout: "由 TP leader 扇出控制、工作和 abort 消息，并收集 follower 管理结果。",
  TPFollowerControlPlane: "将进程队列适配为 follower 控制平面，实现工作、abort 和管理结果通道。",
  CPUOmniPlatform: "声明 CPU 后端的 Omni 能力与 graph 策略。",
  CUDAOmniPlatform: "实现 CUDA 专用的 IPC、fused kernel、进程环境与量化 backend policy。",
  OmniPlatform: "定义所有硬件后端共享的 Omni 扩展能力和保守默认值。",
  MUSAOmniPlatform: "实现 MUSA 后端的 fused kernel 与 backend policy 适配。",
  NPUOmniPlatform: "实现 NPU 设备枚举、选择与 graph 能力声明。",
  ROCMOmniPlatform: "实现 ROCm 的通信、kernel 与模型后端策略。",
  XPUOmniPlatform: "实现 Intel XPU 的设备、kernel cache、进程环境和模型后端策略。",
  ProfilerBase: "定义 profiler start/stop、step context、活跃状态与分布式 rank 的公共接口。",
  TorchProfiler: "包装 torch.profiler 生命周期、trace 模板、run id 与 step context。"
};

const exactFunctionDescriptions = {
  __getattr__: "按符号名延迟导入并返回包的公共对象，降低初始化耦合和循环依赖风险。",
  _required: "读取并校验必填协议字段的类型，在缺失或不匹配时给出明确错误。",
  _optional: "读取可选协议字段，并在存在时执行类型校验。",
  _int_tuple: "把协议中的整数序列校验并规范化为 tuple。",
  relay_device: "返回 relay 当前绑定的设备，用于决定数据恢复位置。",
  extract_tensors: "递归提取嵌套对象中的张量并记录可逆路径。",
  extract_cuda_tensors: "递归分离 CUDA 张量，为 direct IPC 编码建立张量清单。",
  restore_tensors: "依据保存的路径把传输后的张量放回嵌套对象。",
  should_use_direct_cuda_ipc_stream_chunk: "检查流式数据及元数据是否适合 direct CUDA IPC。",
  payload_has_cuda_tensor: "判断 payload 的嵌套结构中是否包含 CUDA 张量。",
  _pack_tensors: "按 alignment 将多个张量打包进同一设备缓冲区并生成切片元数据。",
  _read_transfer_buffer: "通过 relay 读取 DataRef 指向的传输缓冲区。",
  _dtype_alignment: "计算指定 dtype 的缓冲区对齐要求。",
  _pad_offset: "把缓冲区偏移向上填充到目标 alignment。",
  _torch_dtype: "把协议中的 dtype 字符串解析为 torch dtype。",
  _restore_tensor_device: "把重建张量迁移到记录设备或本地目标设备。",
  _inline_cpu_pickle_size: "估算对象内可 inline pickle 的 CPU 数据体积。",
  _ipc_pickle: "使用 IPC 友好的协议序列化 Python 对象。",
  _resolve_nccl_port: "从运行环境解析并校验 model worker 使用的 NCCL 端口。",
  _apply_model_worker_backend_common_policy: "应用跨平台通用的模型 worker backend 配置。",
  _apply_omni_quantization_adapters: "把 Omni 的量化兼容适配写入模型配置。",
  _initialize_model_worker_backend_globals: "依据有效量化方式初始化 SGLang 后端全局状态。",
  _config_uses_mrope: "判断模型配置是否启用了 multimodal RoPE。",
  _bind_default_weight_loaders: "为缺少自定义 loader 的模块参数绑定默认权重加载器。",
  _fused_apply_qk_norm_rope: "在单个 fused 路径中完成 QK normalization 与 RoPE，并由 gate 控制回退。",
  _prefill_graph_enabled: "读取环境配置并判断 prefill CUDA graph 是否启用。",
  install_thinker_fused_rope: "遍历 Thinker attention 层并安装可回退的 fused RoPE 实现。",
  compute_yarn_parameters: "根据模型配置计算 YaRN RoPE 的 inverse frequency 与缩放参数。",
  maybe_update_fused_qkv_proj: "把 checkpoint 中拆分的 Q/K/V 权重写入 fused QKV 参数。",
  maybe_update_fused_moe_proj: "把 checkpoint 中专家投影权重映射到 fused MoE 参数。",
  extract_fused_experts: "从 checkpoint 命名规则中解析并汇总专家 gate/down/up 投影。",
  _normalize_rope_scaling: "兼容不同 Transformers 字段名并规范化 RoPE scaling 配置。",
  _compute_default_rope_parameters: "为缺少新版 API 的 Transformers 版本计算默认 RoPE 参数。",
  _make_mask_factory_compat: "包装 mask factory，使旧版与新版调用签名保持一致。",
  _patch_mask_factories: "定位并替换不兼容的 Transformers mask factory。",
  apply_qwen_tts_transformers_compatibility_patches: "幂等安装 Qwen3-TTS 所需的 Transformers 兼容补丁。",
  _next_power_of_2: "计算不小于输入值的最小 2 次幂。",
  sample_from_sorted_logprobs_with_seed_small_k: "按请求 seed 和 position 从排序后的少量候选中确定性采样 token。",
  _predictor_graph_env_enabled: "读取环境变量并判断 predictor CUDA graph 是否启用。",
  _quantize_predictor_top_k: "把 predictor top-k 约束到词表范围和 kernel 支持的 bucket。",
  _sample_seeded_categorical: "使用每个请求的 seed 与 position 执行可复现分类采样。",
  serialize_message: "将控制平面 protobuf 消息序列化为可通过 socket 发送的字节串。",
  deserialize_message: "从字节串恢复控制平面 protobuf 消息。",
  send_to_endpoint: "复用或创建目标 endpoint 的 PUSH socket 并发送消息。",
  _error_text: "将异常规范化为适合控制平面传播的错误文本。",
  _get_worker_process_env: "计算指定 Stage worker 进程需要注入的环境变量。",
  _patched_spawn_env: "在进程 spawn 期间临时应用并恢复 Stage 专属环境。",
  stage_process_main: "作为 worker 子进程入口执行 Stage 构造、就绪通知和错误上报。",
  _run_process: "启动并监管一组 Stage 的异步运行循环。",
  _cleanup_constructed_stages: "逆序关闭部分构造成功的 Stage，避免启动失败时泄漏资源。",
  _stage_gpu_ids: "从 Stage 配置集合提取需要管理的 GPU id。",
  _destroy_torch_distributed_process_group: "安全销毁当前 torch.distributed process group。",
  _reclaim_process_cuda_memory: "在进程退出或失败后同步设备并回收 CUDA cache。",
  _construct_stage: "根据 launch config 组装控制平面、通信引擎、输入处理器和 Stage 实例。",
  _construct_scheduler: "为 scheduler 角色创建底层 SGLang scheduler。",
  _prepare_accelerator_environment: "按平台和 Stage 规格设置加速器可见性及进程环境。",
  _normalize_spec_gpu_id_to_local_device: "把 placement GPU id 转换为进程内 local device id。",
  _process_name: "生成稳定、可诊断的 Stage worker 进程名。",
  _close_queue: "安全关闭 multiprocessing queue 并终止后台 join。",
  _is_musa_available: "探测 MUSA runtime 是否可用。",
  _is_npu_available: "探测 NPU runtime 是否可用。",
  _is_xpu_available: "探测 Intel XPU runtime 是否可用。",
  _load_platform_class: "按完整限定名动态导入平台类。",
  _as_omni_platform: "把 SGLang 平台对象适配为 OmniPlatform 实例。",
  _resolve_platform: "根据当前硬件探测结果选择 Omni 平台实现。",
  get_platform_spec: "返回指定或当前平台的稳定序列化标识。",
  _is_h20_device: "识别当前 CUDA 设备是否为 H20，以应用匹配的 kernel 策略。",
  _is_fp8_cutlass_moe_supported: "检查当前硬件与 SGLang 版本是否支持 FP8 CUTLASS MoE。",
  enabled: "读取环境开关并判断通信 trace 是否启用。",
  now_ns: "返回用于通信 trace 的单调纳秒时间戳。",
  elapsed_ms: "把起始纳秒时间换算为当前耗时毫秒。",
  emit: "在 trace 开启时输出结构化通信事件。",
  _to_mutable_dict: "把量化配置对象转成可修改字典并保留关键 metadata。",
  _read_metadata: "从配置节点读取指定 metadata 字段。",
  resolve_quant_config: "从模型或嵌套配置中解析有效量化配置。",
  quant_method_name: "提取规范化的量化方法名称。",
  is_fp8_block_quant: "判断配置是否使用 FP8 block quantization。",
  convert_fp8_weight_scale_inv: "按目标参数语义转换 FP8 weight scale inverse。",
  _identity_preprocessor: "作为无需转换时的权重预处理透传函数。",
  get_weight_preprocessor: "根据量化配置选择权重加载预处理器。",
  needs_quant_config_normalization: "判断量化配置是否需要 Stage 本地路径规范化。",
  _strip_stage_prefix: "从量化配置匹配模式中移除 Stage 权重前缀。",
  _normalize_extra_config_keys: "规范化量化 extra_config 内带 Stage 前缀的键。",
  _normalize_block_name_to_quantize: "重写待量化 block 名称，使其匹配当前 Stage 模型命名空间。",
  _load_writable_quant_config: "从 Hugging Face 配置复制一份可安全修改的量化配置。",
  _resolve_stage_prefix: "从模型配置解析当前 Stage 的权重前缀。",
  normalize_quant_config: "对 Stage 本地模型的量化配置执行幂等规范化。"
};

function complexityFromLines(lines) {
  if (lines < 50) return "simple";
  if (lines <= 200) return "moderate";
  return "complex";
}

function areaTags(filePath) {
  if (filePath.includes("/comm/")) return ["通信", "异步传输", "runtime"];
  if (filePath.includes("/pipeline/")) return ["pipeline", "调度", "runtime"];
  if (filePath.includes("/platforms/")) return ["硬件后端", "平台适配", "device"];
  if (filePath.includes("/profiler/")) return ["profiling", "可观测性", "runtime"];
  if (filePath.includes("qwen3_tts")) return ["tts", "模型推理", "语音生成"];
  if (filePath.includes("qwen3_omni")) return ["qwen3-omni", "模型推理", "多模态"];
  if (filePath.includes("model_runner")) return ["model-worker", "推理后端", "sglang"];
  if (filePath.endsWith("quantization.py")) return ["量化", "权重加载", "fp8"];
  return ["python", "核心模块", "runtime"];
}

function normalizeTags(tags) {
  const normalized = [...new Set(tags)];
  for (const fallback of ["python", "代码结构", "runtime"]) {
    if (normalized.length >= 3) break;
    if (!normalized.includes(fallback)) normalized.push(fallback);
  }
  return normalized.slice(0, 5);
}

function fileTags(filePath) {
  const tags = areaTags(filePath);
  if (filePath.endsWith("/__init__.py")) return ["入口点", "延迟导入", "package-api"];
  if (filePath.includes("hf_config.py")) return ["configuration", "hugging-face", "模型配置"];
  if (filePath.includes("compat.py")) return ["兼容层", "transformers", "补丁"];
  if (filePath.includes("sampling_kernels.py")) return ["sampling", "kernel", "确定性"];
  return tags;
}

function languageNotes(filePath) {
  if (filePath.endsWith("engine.py") || filePath.endsWith("stage/runtime.py")) {
    return "大量 async 任务与显式状态清理共同保证跨阶段传输在取消、超时和故障下可收敛。";
  }
  if (filePath.endsWith("talker.py") || filePath.endsWith("qwen3_tts/sglang_model.py")) {
    return "将 PyTorch eager 路径与固定 shape CUDA graph replay 并存，以适配动态请求和高频单 token 解码。";
  }
  if (filePath.includes("hf_config.py")) {
    return "多个 PretrainedConfig 子对象组合成复合多模态模型配置，并兼容 Transformers 的 RoPE 字段演进。";
  }
  if (filePath.endsWith("stage_workers.py")) {
    return "通过 spawn 隔离加速器上下文，并用显式环境补丁避免父进程设备状态污染。";
  }
  return undefined;
}

function functionSummary(name) {
  if (exactFunctionDescriptions[name]) return exactFunctionDescriptions[name];
  if (name.startsWith("serialize_")) return `将 ${name.slice(10).replaceAll("_", " ")} 编码为可跨进程传输的 DataRef 与元数据。`;
  if (name.startsWith("deserialize_")) return `从 DataRef 重建 ${name.slice(12).replaceAll("_", " ")}，并恢复张量与设备信息。`;
  if (name.startsWith("is_") || name.startsWith("_contains_")) return `检查输入是否满足 ${name.replace(/^_?is_|^_?contains_/, "").replaceAll("_", " ")} 条件，供传输或后端策略分支使用。`;
  if (name.startsWith("write_")) return `把 ${name.slice(6).replaceAll("_", " ")} 写入选定 relay，并生成接收端所需的 DataRef。`;
  if (name.startsWith("read_")) return `读取 ${name.slice(5).replaceAll("_", " ")} 对应的 DataRef，并恢复为本地可消费对象。`;
  if (name.startsWith("send_")) return `发送 ${name.slice(5).replaceAll("_", " ")} 相关消息，并附带目标阶段和请求上下文。`;
  if (name.startsWith("_sample") || name.startsWith("sample_")) return `执行 ${name.replace(/^_?sample_?/, "").replaceAll("_", " ")} token 采样，同时保持批内请求的可复现性。`;
  if (name.startsWith("_normalize")) return `规范化 ${name.slice(11).replaceAll("_", " ")}，消除不同调用路径或配置版本的表示差异。`;
  if (name.startsWith("_predictor")) return `计算或解析 predictor 的 ${name.slice(11).replaceAll("_", " ")} 状态，服务于增量解码优化。`;
  if (name.includes("weight")) return `处理 ${name.replaceAll("_", " ")} 相关的 checkpoint 权重映射与加载兼容逻辑。`;
  return `实现模块内的 ${name.replaceAll("_", " ")} 处理步骤，并向上层流程返回规范化结果。`;
}

function functionTags(name, filePath) {
  const tags = ["函数", ...areaTags(filePath).slice(0, 2)];
  if (name.includes("serial") || name.includes("pickle")) tags[0] = "序列化";
  else if (name.includes("sample")) tags[0] = "sampling";
  else if (name.includes("quant") || name.includes("fp8")) tags[0] = "量化";
  else if (name.includes("cuda") || name.includes("ipc")) tags[0] = "cuda-ipc";
  else if (name.includes("weight")) tags[0] = "权重加载";
  else if (name.includes("platform") || name.includes("available")) tags[0] = "平台检测";
  return normalizeTags(tags);
}

function classSummary(name, filePath) {
  if (classDescriptions[name]) return classDescriptions[name];
  if (name.endsWith("Config")) return `封装 ${name.replace(/Config$/, "")} 的模型或运行时配置，并提供稳定的参数边界。`;
  if (name.endsWith("Platform")) return `实现 ${name.replace(/OmniPlatform$|Platform$/, "")} 设备后端的 Omni 平台能力适配。`;
  if (name.includes("Model")) return `实现 ${name} 的模型计算与权重装载路径。`;
  return `封装 ${name} 在 ${path.basename(filePath)} 中承担的状态与行为。`;
}

function classTags(name, filePath) {
  const tags = ["类", ...areaTags(filePath).slice(0, 2)];
  if (name.endsWith("Config")) tags[0] = "configuration";
  else if (name.endsWith("Platform")) tags[0] = "平台适配";
  else if (name.includes("Socket") || name.includes("ControlPlane")) tags[0] = "控制平面";
  else if (name.includes("Talker") || name.includes("Thinker")) tags[0] = "模型组件";
  else if (name.includes("DataRef") || name.includes("Meta")) tags[0] = "数据模型";
  return normalizeTags(tags);
}

const nodes = [];
const edges = [];
const resultByPath = new Map(extract.results.map((entry) => [entry.path, entry]));

for (const file of batch.files) {
  const result = resultByPath.get(file.path);
  if (!result) throw new Error(`缺少结构结果: ${file.path}`);
  const fileId = `file:${file.path}`;
  const fileNode = {
    id: fileId,
    type: "file",
    name: path.posix.basename(file.path),
    filePath: file.path,
    summary: fileSummaries[file.path],
    tags: fileTags(file.path),
    complexity: complexityFromLines(result.nonEmptyLines)
  };
  const note = languageNotes(file.path);
  if (note) fileNode.languageNotes = note;
  nodes.push(fileNode);

  const exports = new Set((result.exports ?? []).map((entry) => entry.name).filter(Boolean));
  const functions = (result.functions ?? []).filter((entry) => entry.name && ((entry.endLine - entry.startLine + 1) >= 10 || exports.has(entry.name)));
  const classes = (result.classes ?? []).filter((entry) => entry.name && ((entry.methods?.length ?? 0) >= 2 || (entry.endLine - entry.startLine + 1) >= 20 || exports.has(entry.name)));

  for (const fn of functions) {
    const id = `function:${file.path}:${fn.name}`;
    nodes.push({
      id,
      type: "function",
      name: fn.name,
      filePath: file.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummary(fn.name),
      tags: functionTags(fn.name, file.path),
      complexity: complexityFromLines(fn.endLine - fn.startLine + 1)
    });
    edges.push({ source: fileId, target: id, type: "contains", direction: "forward", weight: 1.0 });
    if (exports.has(fn.name)) edges.push({ source: fileId, target: id, type: "exports", direction: "forward", weight: 0.8 });
  }

  for (const cls of classes) {
    const id = `class:${file.path}:${cls.name}`;
    nodes.push({
      id,
      type: "class",
      name: cls.name,
      filePath: file.path,
      lineRange: [cls.startLine, cls.endLine],
      summary: classSummary(cls.name, file.path),
      tags: classTags(cls.name, file.path),
      complexity: complexityFromLines(cls.endLine - cls.startLine + 1)
    });
    edges.push({ source: fileId, target: id, type: "contains", direction: "forward", weight: 1.0 });
    if (exports.has(cls.name)) edges.push({ source: fileId, target: id, type: "exports", direction: "forward", weight: 0.8 });
  }

  for (const targetPath of batch.batchImportData[file.path] ?? []) {
    edges.push({ source: fileId, target: `file:${targetPath}`, type: "imports", direction: "forward", weight: 0.7 });
  }
}

const nodeIds = new Set(nodes.map((node) => node.id));
if (nodeIds.size !== nodes.length) throw new Error("批次 1 存在重复节点 ID");
if (nodes.some((node) => !node.summary || node.tags.length < 3)) throw new Error("节点摘要或 tags 不完整");
if (edges.some((edge) => edge.source === edge.target)) throw new Error("发现自引用边");

const expectedImports = Object.values(batch.batchImportData).reduce((sum, targets) => sum + targets.length, 0);
const actualImports = edges.filter((edge) => edge.type === "imports").length;
if (actualImports !== expectedImports) throw new Error(`import 边不匹配: ${actualImports}/${expectedImports}`);

const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
const sortedFiles = batch.files.map((file) => file.path).sort((a, b) => a.localeCompare(b));
const groupSize = Math.ceil(sortedFiles.length / partCount);
const allImportTargets = new Set(Object.values(batch.batchImportData).flat());
const neighborMap = batch.neighborMap ?? {};
const outputs = [];

for (let index = 0; index < partCount; index += 1) {
  const group = new Set(sortedFiles.slice(index * groupSize, (index + 1) * groupSize));
  const partNodes = nodes.filter((node) => group.has(node.filePath));
  const partNodeIds = new Set(partNodes.map((node) => node.id));
  const partEdges = edges.filter((edge) => partNodeIds.has(edge.source));

  for (const edge of partEdges) {
    if (partNodeIds.has(edge.target) || nodeIds.has(edge.target)) continue;
    if (edge.target.startsWith("file:") && (allImportTargets.has(edge.target.slice(5)) || neighborMap[edge.target.slice(5)])) continue;
    throw new Error(`part ${index + 1} 边目标无法验证: ${edge.target}`);
  }

  const fragment = { nodes: partNodes, edges: partEdges };
  const outputPath = path.join(uaDir, "intermediate", `batch-1-part-${index + 1}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(fragment, null, 2)}\n`, "utf8");
  JSON.parse(fs.readFileSync(outputPath, "utf8"));
  outputs.push({ file: path.basename(outputPath), nodes: partNodes.length, edges: partEdges.length });
}

console.log(JSON.stringify({ partCount, totalNodes: nodes.length, totalEdges: edges.length, importEdges: actualImports, outputs }));

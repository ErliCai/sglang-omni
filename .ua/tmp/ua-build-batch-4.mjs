import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uaDir = fs.existsSync(path.join(root, ".understand-anything")) ? path.join(root, ".understand-anything") : path.join(root, ".ua");
const input = JSON.parse(fs.readFileSync(path.join(uaDir, "tmp", "ua-file-analyzer-input-4.json"), "utf8"));
const extraction = JSON.parse(fs.readFileSync(path.join(uaDir, "tmp", "ua-file-extract-results-4.json"), "utf8"));

const fileInfo = {
  "sglang_omni/relay/__init__.py": ["作为 relay 子系统入口，注册并导出 Mooncake、NIXL 等可选数据传输后端及统一创建接口。", ["entry-point", "barrel", "relay", "backend-registry"]],
  "sglang_omni/relay/base.py": ["定义 relay 后端注册表、工厂、异步传输操作抽象、统一 Relay 接口与基于信用的流量控制器。", ["relay", "abstract-interface", "factory", "flow-control"]],
  "sglang_omni/relay/cuda_ipc.py": ["实现同节点 GPU 间的 CUDA IPC relay，管理共享 storage handle、事件同步、连续 slot 分配、ACK 与故障传播。", ["relay", "cuda-ipc", "gpu-communication", "resource-management"]],
  "sglang_omni/relay/mooncake.py": ["通过 Mooncake Transfer Engine 实现跨节点 tensor 传输，封装连接协商、put/get 操作、内存注册与后台清理。", ["relay", "mooncake", "distributed-communication", "rdma"]],
  "sglang_omni/relay/nccl.py": ["基于 NCCL point-to-point 通信实现 GPU tensor relay，负责连接建立、异步发送接收与操作生命周期。", ["relay", "nccl", "gpu-communication", "distributed"]],
  "sglang_omni/relay/nixl.py": ["基于 NIXL 传输库实现跨进程 relay，管理 endpoint 元数据、内存描述符、异步 put/get 与资源释放。", ["relay", "nixl", "distributed-communication", "memory-transfer"]],
  "sglang_omni/relay/shm.py": ["使用 multiprocessing shared memory 实现 CPU tensor relay，并以信用分配限制在途共享内存块。", ["relay", "shared-memory", "ipc", "flow-control"]],
  "sglang_omni/utils/misc.py": ["提供层编号解析、名称前缀、随机种子、GPU 空闲显存、Python 对象广播及量化配置规范化等通用工具。", ["utility", "distributed", "gpu-memory", "quantization"]],
  "tests/unit_test/fixtures/qwen_predictor.py": ["构造使用真实 step predictor 图的轻量 Talker 测试模型，并用可控线性层与 rotary 替身隔离外围依赖。", ["test-fixture", "qwen3-omni", "talker", "test-double"]],
  "tests/unit_test/fixtures/trace_capture.py": ["提供通信 trace 的上下文捕获器和按事件名过滤工具，供 relay 与 pipeline 测试断言传输行为。", ["test-fixture", "trace", "communication", "observability"]],
  "tests/unit_test/model_runner/test_prefill_cuda_graph_usage.py": ["验证 prefill CUDA Graph 使用计数按实例和 bucket 隔离，并由 ModelWorker 准确上报 replay 统计。", ["test", "model-runner", "prefill", "cuda-graph"]],
  "tests/unit_test/pipeline/test_admin_control.py": ["验证 scheduler 与 coordinator 的管理消息、权重更新、活动请求保护、cache flush、暂停恢复及多阶段结果汇聚。", ["test", "pipeline", "admin-control", "weight-update"]],
  "tests/unit_test/pipeline/test_comm_engine_ack.py": ["验证通信引擎的数据 ACK、复用发送语义、陈旧与重复 ACK 防护、DataRef 校验以及流式发送释放。", ["test", "communication", "acknowledgement", "streaming"]],
  "tests/unit_test/pipeline/test_comm_router.py": ["验证通信路由器依据节点、设备与平台能力在 CUDA IPC、shared memory 和 Mooncake 间选择传输后端。", ["test", "communication", "routing", "transport-policy"]],
  "tests/unit_test/pipeline/test_kv_transfer.py": ["验证 KV cache 传输的拓扑约束、TP endpoint 匹配、rank 生命周期、分页传输、超时与错误清理。", ["test", "kv-transfer", "tensor-parallel", "relay"]],
  "tests/unit_test/pipeline/test_payload_device_restore.py": ["验证跨阶段载荷反序列化后按来源设备恢复 tensor，并保持 host-only、resident 与旧格式数据兼容。", ["test", "pipeline", "device-placement", "serialization"]],
  "tests/unit_test/pipeline/test_stage.py": ["全面验证 Stage 输入聚合、动态拓扑约束、调度线程生命周期、结果与流路由、abort、relay 和进程退出行为。", ["test", "pipeline", "stage-runtime", "scheduling"]],
  "tests/unit_test/pipeline/test_stage_process_env.py": ["验证 CUDA、ROCm、XPU 等平台下 stage/TP worker 的可见设备映射、环境变量继承与非法放置校验。", ["test", "pipeline", "process-env", "device-placement"]],
  "tests/unit_test/pipeline/test_stage_streaming.py": ["验证 Stage 流式消息的 inline/relay 选择、outbox drain、公平性、终止与 abort、metadata 及通信 trace。", ["test", "pipeline", "streaming", "relay"]],
  "tests/unit_test/quantization/test_autoround.py": ["验证 AutoRound 量化配置的阶段本地规范化、checkpoint 解析、对象形配置及无副作用转换。", ["test", "quantization", "autoround", "configuration"]],
  "tests/unit_test/quantization/test_fp8.py": ["验证 FP8 block quantization 识别及 weight_scale_inv 转换逻辑。", ["test", "quantization", "fp8"]],
  "tests/unit_test/quantization/test_weight_preprocess.py": ["验证量化配置提取、quant method 命名以及权重预处理器解析策略。", ["test", "quantization", "weight-preprocess"]],
  "tests/unit_test/qwen3_omni/test_fp8_backend_config.py": ["验证 Qwen3-Omni FP8/MoE backend 策略优先级、平台限制、SGLang 版本契约与全局初始化。", ["test", "qwen3-omni", "fp8", "moe-backend"]],
  "tests/unit_test/qwen3_omni/test_sglang_thinker.py": ["验证 SGLang Thinker 的 mRoPE 配置、prefill 位置构造以及 sidecar request identity 透传。", ["test", "qwen3-omni", "thinker", "mrope"]],
  "tests/unit_test/qwen3_omni/test_talker_attention.py": ["验证 Qwen3-Omni Talker 在 direct 与 cached 路径中的 grouped-query attention 与物化 KV 参考实现一致。", ["test", "qwen3-omni", "talker", "attention"]],
  "tests/unit_test/qwen3_omni/test_thinker_fused_rope.py": ["验证 Thinker fused RoPE 对纯文本 mRoPE、multimodal gate、extend/decode batch 与 XPU fallback 的处理。", ["test", "qwen3-omni", "thinker", "fused-rope"]],
  "tests/unit_test/qwen3_omni/test_thinker_platform_gates.py": ["验证 Thinker 与 Talker 的平台能力 gate 使用已解析平台而非直接读取 torch.cuda。", ["test", "qwen3-omni", "platform-gate"]],
  "tests/unit_test/qwen3_tts/test_predictor_cuda_graph.py": ["验证 Qwen3-TTS predictor 的 CUDA Graph 与 eager 逐位一致性、bucket 重放、采样、请求重排和 host readback 防护。", ["test", "qwen3-tts", "predictor", "cuda-graph"]],
  "tests/unit_test/qwen3_tts/test_sampling_kernels.py": ["验证带 seed 的 small-k sampler 与 SGLang multinomial 一致，并在 CPU 上正确 fallback。", ["test", "qwen3-tts", "sampling", "kernel"]],
  "tests/unit_test/relay/test_cuda_ipc_relay.py": ["全面验证 CUDA IPC relay 的 slot 池、连续分配、超时、ACK、故障唤醒、并发传输与资源回收。", ["test", "relay", "cuda-ipc", "resource-management"]],
  "tests/unit_test/relay/test_shm_relay.py": ["验证 shared-memory relay 发送超时后会 unlink 内存块并返还信用额度。", ["test", "relay", "shared-memory"]],
  "tests/unit_test/test_platforms.py": ["验证 CPU、CUDA、ROCm、XPU、NPU 平台探测、能力声明、设备设置及 MoE backend 限制。", ["test", "platform", "hardware-detection", "device-placement"]],
  "tests/unit_test/test_stage_device_contract.py": ["验证不同模型 Stage 对未指定设备的透传或解析契约，确保 factory 与平台共同决定最终设备。", ["test", "stage-runtime", "device-contract"]],
  "tests/unit_test/utils/test_ipc_weights_cuda.py": ["验证 CUDA IPC 权重共享在 stage bootstrap、跨进程 alias、leader/follower 同步、私有副本和失败清理下的行为。", ["test", "cuda-ipc", "weight-sharing", "multiprocessing"]]
};

const functionInfo = {
  register_relay: "创建 relay 后端注册装饰器，将实现类绑定到稳定的类型名称。",
  create_relay: "根据注册名称实例化 relay 后端，并向调用方暴露统一接口。",
  _event_wait_threads_from_env: "从环境变量解析 CUDA 事件等待线程数并执行边界校验。",
  _synchronize_cuda_event: "在独立线程中等待 CUDA IPC event，并记录完成、超时或错误。",
  _wait_for_cuda_event: "协调 CUDA event 等待线程并将超时或底层异常转换为 relay 故障。",
  _cuda_event_elapsed_ms: "计算 CUDA event 的耗时指标，用于通信 trace 与诊断。",
  _parse_device_id: "把 CUDA device 字符串解析为整数设备索引。",
  _ensure_peer_access: "检查并按需开启源 GPU 与目标 GPU 之间的 peer access。",
  _dump_cuda_storage_handle: "把 CUDA tensor storage 序列化为可跨进程传递的 IPC handle 元数据。",
  _load_cuda_storage_handle: "从 IPC handle 重建 CUDA storage 与 tensor view。",
  _slots_for_size: "根据 payload 大小和 slot 大小计算所需的连续 slot 数。",
  shm_create_from_tensor: "创建 shared-memory block 并复制 CPU tensor 字节，供接收端零额外协议地重建。",
  get_layer_id: "从权重名称中提取 transformer layer 编号。",
  add_prefix: "为参数名安全添加可选前缀。",
  set_random_seed: "同步设置 Python、NumPy 与 torch 的随机种子。",
  avail_gpu_mem: "查询指定 GPU 当前可用显存并换算为 GiB。",
  broadcast_pyobj: "通过 torch.distributed 广播可序列化 Python 对象。",
  normalize_quantization: "把多种量化配置表示规范化为稳定字符串或 None。",
  model_config_has_moe: "判断模型配置的有效 text config 是否包含 MoE 结构。"
};

const classInfo = {
  "sglang_omni/relay/base.py:RelayOperation": "定义 relay put/get 操作的异步完成、等待、取消与资源释放契约。",
  "sglang_omni/relay/base.py:Relay": "定义 tensor put/get、连接与关闭等 relay 后端统一抽象接口。",
  "sglang_omni/relay/base.py:CreditAllocator": "以条件变量管理有限信用额度，为在途传输提供背压与超时等待。",
  "sglang_omni/relay/cuda_ipc.py:_CudaEventWaitResult": "保存 CUDA event 等待线程的完成状态、错误与耗时。",
  "sglang_omni/relay/cuda_ipc.py:_SlotLayout": "描述 CUDA IPC 共享池中连续 slot 的偏移和跨度。",
  "sglang_omni/relay/cuda_ipc.py:_SlotAllocation": "表示一次已授予的 slot 分配及其释放状态。",
  "sglang_omni/relay/cuda_ipc.py:_ReceiverAckOperation": "为需要接收端 ACK 的 CUDA IPC 操作实现等待、超时和 relay 故障传播。",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcPutOperation": "跟踪 CUDA IPC 发送侧 copy、event 与接收确认，完成后归还共享 slot。",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcGetOperation": "在接收侧重建 CUDA storage、等待 event，并在消费完成后发送 ACK。",
  "sglang_omni/relay/cuda_ipc.py:_ContiguousSlotAllocator": "并发分配与回收共享 CUDA buffer 的连续 slot 区间。",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcRelay": "协调 CUDA IPC 共享池、连接握手、put/get、ACK 线程及全局故障状态。",
  "sglang_omni/relay/mooncake.py:MooncakeConnection": "封装 Mooncake endpoint 握手、segment 注册与远端元数据。",
  "sglang_omni/relay/mooncake.py:MooncakeOperation": "封装 Mooncake 异步传输句柄的完成轮询与错误检查。",
  "sglang_omni/relay/mooncake.py:PutOperation": "管理 Mooncake 发送操作及其临时内存注册生命周期。",
  "sglang_omni/relay/mooncake.py:GetOperation": "管理 Mooncake 接收操作、目标 tensor 与完成同步。",
  "sglang_omni/relay/mooncake.py:MooncakeRelay": "实现基于 Mooncake Transfer Engine 的跨节点 Relay 接口。",
  "sglang_omni/relay/nccl.py:Connection": "封装 NCCL communicator、rank 信息与连接生命周期。",
  "sglang_omni/relay/nccl.py:NcclOperation": "跟踪 NCCL 异步 work handle 并提供统一 RelayOperation 语义。",
  "sglang_omni/relay/nccl.py:PutOperation": "封装 NCCL 发送 tensor 的异步完成状态。",
  "sglang_omni/relay/nccl.py:GetOperation": "封装 NCCL 接收 tensor 的异步完成状态。",
  "sglang_omni/relay/nccl.py:NcclRelay": "实现基于 NCCL point-to-point 原语的 GPU Relay。",
  "sglang_omni/relay/nixl.py:Connection": "保存 NIXL endpoint 与远端 agent 元数据。",
  "sglang_omni/relay/nixl.py:NixlOperation": "封装 NIXL 异步 request 的状态轮询与错误转换。",
  "sglang_omni/relay/nixl.py:PutOperation": "管理 NIXL 发送 descriptor 与临时资源。",
  "sglang_omni/relay/nixl.py:GetOperation": "管理 NIXL 接收 descriptor、目标 tensor 与资源释放。",
  "sglang_omni/relay/nixl.py:NixlRelay": "实现基于 NIXL agent 的跨进程内存传输 Relay。",
  "sglang_omni/relay/shm.py:ShmOperation": "为 shared-memory relay 操作提供完成等待与资源清理基类。",
  "sglang_omni/relay/shm.py:ShmPutOperation": "持有发送侧 shared-memory block，等待消费确认后 unlink 并返还信用。",
  "sglang_omni/relay/shm.py:ShmGetOperation": "从 shared-memory block 重建 CPU tensor 并在读取后通知发送侧。",
  "sglang_omni/relay/shm.py:ShmRelay": "实现基于进程共享内存和信用背压的 CPU tensor Relay。"
};

const inheritance = {
  "sglang_omni/relay/cuda_ipc.py:_ReceiverAckOperation": "class:sglang_omni/relay/base.py:RelayOperation",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcPutOperation": "class:sglang_omni/relay/cuda_ipc.py:_ReceiverAckOperation",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcGetOperation": "class:sglang_omni/relay/base.py:RelayOperation",
  "sglang_omni/relay/cuda_ipc.py:CudaIpcRelay": "class:sglang_omni/relay/base.py:Relay",
  "sglang_omni/relay/mooncake.py:PutOperation": "class:sglang_omni/relay/mooncake.py:MooncakeOperation",
  "sglang_omni/relay/mooncake.py:GetOperation": "class:sglang_omni/relay/mooncake.py:MooncakeOperation",
  "sglang_omni/relay/nccl.py:PutOperation": "class:sglang_omni/relay/nccl.py:NcclOperation",
  "sglang_omni/relay/nccl.py:GetOperation": "class:sglang_omni/relay/nccl.py:NcclOperation",
  "sglang_omni/relay/nixl.py:PutOperation": "class:sglang_omni/relay/nixl.py:NixlOperation",
  "sglang_omni/relay/nixl.py:GetOperation": "class:sglang_omni/relay/nixl.py:NixlOperation",
  "sglang_omni/relay/shm.py:ShmPutOperation": "class:sglang_omni/relay/shm.py:ShmOperation",
  "sglang_omni/relay/shm.py:ShmGetOperation": "class:sglang_omni/relay/shm.py:ShmOperation",
};

function complexity(lines) { return lines < 50 ? "simple" : lines <= 200 ? "moderate" : "complex"; }
function topic(filePath) {
  if (filePath.includes("cuda_ipc") || filePath.includes("ipc_weights")) return "cuda-ipc";
  if (filePath.includes("relay")) return "relay";
  if (filePath.includes("quantization") || filePath.includes("fp8")) return "quantization";
  if (filePath.includes("talker")) return "talker";
  if (filePath.includes("thinker")) return "thinker";
  if (filePath.includes("qwen3_tts")) return "qwen3-tts";
  if (filePath.includes("stream")) return "streaming";
  if (filePath.includes("comm")) return "communication";
  if (filePath.includes("stage")) return "stage-runtime";
  return "pipeline";
}
function functionSummary(filePath, name) {
  if (filePath.startsWith("sglang_omni/") && functionInfo[name]) return functionInfo[name];
  if (name.startsWith("test_")) return `验证 \`${name}\` 场景所描述的行为、状态变化与边界条件。`;
  return `构造或处理 \`${name}\` 所需的测试数据与运行条件，供同文件场景复用。`;
}
function classSummary(filePath, cls) {
  const key = `${filePath}:${cls.name}`;
  if (classInfo[key]) return classInfo[key];
  if (cls.name.startsWith("Test")) return `组织 \`${cls.name}\` 相关测试场景及其共享断言。`;
  return `为测试提供 \`${cls.name}\` 替身，以可控方式模拟依赖、状态或硬件行为。`;
}

const nodes = [], edges = [], nodeIds = new Set(), edgeKeys = new Set();
function addNode(node) { if (!nodeIds.has(node.id)) { nodeIds.add(node.id); nodes.push(node); } }
function addEdge(edge) { const key = `${edge.source}|${edge.target}|${edge.type}`; if (edge.source !== edge.target && !edgeKeys.has(key)) { edgeKeys.add(key); edges.push(edge); } }

for (const result of extraction.results) {
  const filePath = result.path, fileId = `file:${filePath}`;
  const [summary, tags] = fileInfo[filePath];
  const fileNode = { id: fileId, type: "file", name: path.posix.basename(filePath), filePath, summary, tags, complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0) };
  if (filePath === "sglang_omni/relay/cuda_ipc.py") fileNode.languageNotes = "使用 torch CUDA storage sharing API、跨进程 event 与连续 slot allocator 组合实现低复制 GPU IPC。";
  if (filePath === "sglang_omni/relay/mooncake.py" || filePath === "sglang_omni/relay/nixl.py") fileNode.languageNotes = "将可选原生传输库封装在统一 RelayOperation 生命周期内，并显式管理内存注册。";
  addNode(fileNode);
  const exported = new Set((result.exports ?? []).map((entry) => entry.name));

  for (const fn of result.functions ?? []) {
    const lines = Math.max(1, (fn.endLine ?? fn.startLine) - fn.startLine + 1);
    if (lines < 10 && !exported.has(fn.name)) continue;
    const fnId = `function:${filePath}:${fn.name}`;
    if (nodeIds.has(fnId)) continue;
    addNode({ id: fnId, type: "function", name: fn.name, filePath, lineRange: [fn.startLine, fn.endLine], summary: functionSummary(filePath, fn.name), tags: fn.name.startsWith("test_") ? ["test", "unit-test", topic(filePath)] : [filePath.startsWith("tests/") ? "test-fixture" : "utility", topic(filePath), "python"], complexity: complexity(lines) });
    addEdge({ source: fileId, target: fnId, type: "contains", direction: "forward", weight: 1.0 });
    if (exported.has(fn.name)) addEdge({ source: fileId, target: fnId, type: "exports", direction: "forward", weight: 0.8 });
  }

  for (const cls of result.classes ?? []) {
    const lines = Math.max(1, (cls.endLine ?? cls.startLine) - cls.startLine + 1);
    if ((cls.methods?.length ?? 0) < 2 && lines < 20 && !exported.has(cls.name)) continue;
    const clsId = `class:${filePath}:${cls.name}`;
    if (nodeIds.has(clsId)) continue;
    addNode({ id: clsId, type: "class", name: cls.name, filePath, lineRange: [cls.startLine, cls.endLine], summary: classSummary(filePath, cls), tags: filePath.startsWith("tests/") ? [cls.name.startsWith("Test") ? "test-suite" : "test-double", "test-fixture", topic(filePath)] : ["relay", cls.name.endsWith("Relay") ? "service" : "data-model", "python"], complexity: complexity(lines) });
    addEdge({ source: fileId, target: clsId, type: "contains", direction: "forward", weight: 1.0 });
    if (exported.has(cls.name)) addEdge({ source: fileId, target: clsId, type: "exports", direction: "forward", weight: 0.8 });
    const parent = inheritance[`${filePath}:${cls.name}`];
    if (parent) addEdge({ source: clsId, target: parent, type: "inherits", direction: "forward", weight: 0.9 });
  }

  for (const targetPath of input.batchImportData[filePath] ?? []) {
    addEdge({ source: fileId, target: `file:${targetPath}`, type: "imports", direction: "forward", weight: 0.7 });
    if (filePath.startsWith("tests/") && !targetPath.startsWith("tests/")) addEdge({ source: fileId, target: `file:${targetPath}`, type: "tested_by", direction: "forward", weight: 0.5 });
  }
}

const expectedImports = Object.values(input.batchImportData).reduce((sum, values) => sum + values.length, 0);
const importCount = edges.filter((edge) => edge.type === "imports").length;
if (importCount !== expectedImports) throw new Error(`Import edge mismatch: ${importCount} != ${expectedImports}`);

const partCount = nodes.length <= 60 && edges.length <= 120 ? 1 : Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
const sortedFiles = [...input.batchFiles].sort((a, b) => a.path.localeCompare(b.path));
const intermediate = path.join(uaDir, "intermediate");
for (let i = 0; i < partCount; i += 1) {
  const start = Math.floor((i * sortedFiles.length) / partCount), end = Math.floor(((i + 1) * sortedFiles.length) / partCount);
  const group = new Set(sortedFiles.slice(start, end).map((file) => file.path));
  const partNodes = nodes.filter((node) => group.has(node.filePath));
  const ids = new Set(partNodes.map((node) => node.id));
  const partEdges = edges.filter((edge) => ids.has(edge.source));
  const outputPath = partCount === 1 ? path.join(intermediate, "batch-4.json") : path.join(intermediate, `batch-4-part-${i + 1}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify({ partCount, nodeCount: nodes.length, edgeCount: edges.length, importCount, expectedImports, filesAnalyzed: extraction.filesAnalyzed, filesSkipped: extraction.filesSkipped ?? [] }));

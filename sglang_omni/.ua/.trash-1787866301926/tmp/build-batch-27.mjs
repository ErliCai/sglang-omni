import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-27.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-27.json`, "utf8"));

const F = {
  "pipeline/local_dispatch.py": ["在单进程运行模式下把阶段负载和流式块直接分发给本地 Stage 实例，并传播完成与中止信号。", ["pipeline", "local-dispatch", "streaming"], "moderate"],
  "pipeline/mp_runner.py": ["把流水线配置展开为进程与张量并行阶段组，分配通信端点、GPU 和显存默认值，并管理多进程生命周期。", ["pipeline", "multiprocessing", "stage-groups", "tensor-parallel"], "complex"],
  "pipeline/replicas.py": ["展开阶段副本拓扑，校验设备分配，并通过绑定策略把逻辑阶段副本映射到 GPU。", ["pipeline", "replicas", "device-binding", "topology"], "complex"],
  "pipeline/runtime_config.py": ["准备跨进程流水线运行目录、通信配置和 IPC 端点，并严格校验 Unix 套接字路径预算。", ["pipeline", "runtime-config", "ipc", "endpoints"], "complex"],
  "pipeline/stage/__init__.py": ["通过惰性属性公开 Stage、输入处理器和流式队列类型，避免导入时加载重型运行时。", ["pipeline", "stage-api", "lazy-import"], "simple"],
  "pipeline/stage/input.py": ["定义 Stage 输入处理接口，以及直接输入和多来源聚合输入的缓存、等待与完成规则。", ["pipeline", "stage-input", "aggregation", "request-state"], "complex"],
  "pipeline/stage/runtime.py": ["实现流水线 Stage 核心运行时，管理执行器、收发通道、请求生命周期、流式输入输出、批处理、错误和性能事件。", ["pipeline", "stage-runtime", "request-lifecycle", "streaming", "execution"], "complex"],
  "pipeline/stage/stream_queue.py": ["提供按请求隔离的线程安全流式队列，传递数据块以及完成、错误和中止信号。", ["pipeline", "stream-queue", "thread-safety", "signals"], "complex"],
  "pipeline/stage_workers.py": ["在子进程中准备加速器环境、构造 Stage 与调度器、管理 TP 阶段组，并确保分布式与 CUDA 资源清理。", ["pipeline", "stage-workers", "multiprocessing", "resource-cleanup"], "complex"],
  "pipeline/tp_control.py": ["实现张量并行领导 rank 的工作扇出和跟随 rank 控制平面，协调请求、完成与停止消息。", ["pipeline", "tensor-parallel", "control-plane", "fanout"], "complex"],
  "platforms/__init__.py": ["检测当前硬件后端并动态加载对应 OmniPlatform 适配器，统一导出平台规格。", ["platforms", "hardware-detection", "dynamic-loading"], "moderate"],
  "platforms/cpu.py": ["提供 CPU 后端的 Omni 平台适配器。", ["platforms", "cpu", "backend"], "simple"],
  "platforms/cuda.py": ["扩展 CUDA 平台能力检测，识别 H20 与 FP8 CUTLASS MoE 支持并提供设备专用运行配置。", ["platforms", "cuda", "gpu-capabilities", "fp8"], "complex"],
  "platforms/interface.py": ["定义 SGLang Omni 平台适配器的统一接口和设备、分布式、内存相关能力契约。", ["platforms", "platform-interface", "device-capabilities"], "moderate"],
  "platforms/musa.py": ["提供 Moore Threads MUSA 设备的 Omni 平台适配器和环境配置。", ["platforms", "musa", "accelerator"], "simple"],
  "platforms/npu.py": ["提供华为 NPU 设备的 Omni 平台适配器。", ["platforms", "npu", "accelerator"], "simple"],
  "platforms/rocm.py": ["提供 AMD ROCm 设备的 Omni 平台适配器及 GPU 能力覆写。", ["platforms", "rocm", "gpu-capabilities"], "moderate"],
  "platforms/xpu.py": ["提供 Intel XPU 设备的 Omni 平台适配器、设备计数和环境变量设置。", ["platforms", "xpu", "accelerator", "device-config"], "complex"],
  "preprocessing/__init__.py": ["惰性导出音频、图像、文本、多模态和转写预处理公共 API。", ["preprocessing", "public-api", "lazy-import"], "moderate"],
  "preprocessing/text.py": ["加载和校验聊天模板，规范化消息、追加模态占位符并应用分词器模板。", ["preprocessing", "chat-template", "message-normalization", "multimodal"], "moderate"],
  "preprocessing/transcription.py": ["解析本地、远程或内存音频来源并准备统一波形、采样率和可选临时文件。", ["preprocessing", "transcription", "audio-source", "media-io"], "moderate"],
  "profiler/__main__.py": ["实现性能分析命令行入口，解析配置并启动指定后端的 profiler。", ["profiler", "cli", "profiling-runtime"], "moderate"],
  "profiler/base_profiler.py": ["定义 profiler 生命周期、上下文管理和请求区间记录的抽象基类。", ["profiler", "base-class", "lifecycle"], "moderate"],
  "profiler/comm_trace.py": ["按环境开关记录轻量通信追踪事件，提供纳秒时间戳、耗时计算和事件输出。", ["profiler", "communication-trace", "timing"], "simple"],
  "profiler/event_recorder.py": ["记录请求在各阶段和模型路径上的结构化事件，维护活动阶段上下文并异步写出 JSON 记录。", ["profiler", "event-recorder", "request-tracing", "json"], "complex"]
};

const topic = Object.fromEntries(Object.entries(F).map(([path, info]) => [path, info[1].slice(0, 2).join("、")]));
const explicit = {
  "pipeline/local_dispatch.py:LocalStageDispatcher": "把阶段负载、流式数据和控制信号同步分发到同进程的目标 Stage。",
  "pipeline/mp_runner.py:_NcclPortAllocator": "为同一主机上的张量并行阶段组分配不冲突的 NCCL 端口。",
  "pipeline/mp_runner.py:MultiProcessPipelineRunner": "构建并启动阶段进程组、协调器和通信资源，并负责停止、等待与异常清理。",
  "pipeline/replicas.py:ReplicaTopology": "描述阶段副本数量、每副本 TP 规模和逻辑到物理实例的映射。",
  "pipeline/replicas.py:BindingPolicy": "定义把流水线副本绑定到设备集合的策略接口。",
  "pipeline/replicas.py:RoundRobinBindingPolicy": "以轮询方式把阶段副本均匀绑定到候选 GPU。",
  "pipeline/runtime_config.py:IpcRuntimeDir": "封装 IPC 运行目录路径、命名空间前缀和清理责任。",
  "pipeline/runtime_config.py:PipelineRuntimePrep": "汇总流水线运行目录、端点分配和通信配置准备结果。",
  "pipeline/stage/input.py:InputHandler": "定义 Stage 对新负载、流式块、完成与中止信号的输入处理契约。",
  "pipeline/stage/input.py:DirectInput": "把单一来源负载直接交给 Stage 执行。",
  "pipeline/stage/input.py:AggregatedInput": "缓存多个上游来源的数据，满足等待条件后合并并释放完整请求。",
  "pipeline/stage/runtime.py:Stage": "管理单个流水线阶段的执行器、通信、请求状态、流式队列、批处理和错误恢复。",
  "pipeline/stage/stream_queue.py:StreamItem": "封装流式队列中的数据块、来源和序号。",
  "pipeline/stage/stream_queue.py:StreamSignal": "定义流完成、错误和中止等控制信号。",
  "pipeline/stage/stream_queue.py:StreamQueue": "维护每请求线程安全队列并支持阻塞读取、信号传播和资源释放。",
  "pipeline/stage_workers.py:StageLaunchConfig": "保存 Stage 子进程启动、设备、通信、执行器与调度参数。",
  "pipeline/stage_workers.py:StageWorkerProcessSpec": "描述一个工作进程承载的阶段组和进程级资源。",
  "pipeline/stage_workers.py:StageGroup": "管理同进程或 TP 组内多个 Stage 的构造、启动、等待和停止。",
  "pipeline/tp_control.py:TPWorkMessage": "封装 TP 领导 rank 向跟随 rank 广播的工作与控制消息。",
  "pipeline/tp_control.py:TPLeaderFanout": "由 TP 领导 rank 扇出请求、流式信号和停止命令。",
  "pipeline/tp_control.py:TPFollowerControlPlane": "在跟随 rank 接收领导消息并驱动本地 Stage 执行。",
  "platforms/interface.py:OmniPlatform": "定义各硬件后端必须提供的设备类型、可用性、环境和能力接口。",
  "platforms/cpu.py:CPUOmniPlatform": "实现 CPU 后端平台规格。",
  "platforms/cuda.py:CUDAOmniPlatform": "实现 NVIDIA CUDA 后端能力探测、设备属性和运行参数。",
  "platforms/musa.py:MUSAOmniPlatform": "实现 MUSA 加速器后端平台规格。",
  "platforms/npu.py:NPUOmniPlatform": "实现 NPU 加速器后端平台规格。",
  "platforms/rocm.py:ROCMOmniPlatform": "实现 AMD ROCm 后端平台规格和能力覆写。",
  "platforms/xpu.py:XPUOmniPlatform": "实现 Intel XPU 后端设备探测和运行环境配置。",
  "preprocessing/transcription.py:PreparedAudio": "保存已准备音频的波形、采样率、来源和临时资源清理信息。",
  "profiler/base_profiler.py:ProfilerBase": "定义性能分析器启动、停止、步进和上下文管理接口。",
  "profiler/event_recorder.py:RequestEvent": "表示带请求、阶段、事件类型、时间戳和附加字段的追踪记录。",
  "profiler/event_recorder.py:RequestEventRecorder": "线程安全地收集请求事件并按配置写入结构化追踪文件。"
};

const W = { resolve: "解析", build: "构建", create: "创建", prepare: "准备", allocate: "分配", validate: "校验", assign: "分配", expand: "展开", attach: "附加", truncate: "截断", raise: "抛出", visible: "可见", device: "设备", count: "数量", stage: "阶段", groups: "组", group: "组", process: "进程", memory: "显存", fraction: "比例", defaults: "默认值", same: "同进程", targets: "目标", single: "单一", spec: "规格", specs: "规格", comm: "通信", config: "配置", runtime: "运行时", dir: "目录", endpoints: "端点", endpoint: "端点", ipc: "IPC", namespace: "命名空间", prefix: "前缀", path: "路径", budget: "预算", error: "错误", longest: "最长", suffix: "后缀", len: "长度", replica: "副本", replicas: "副本", gpu: "GPU", binding: "绑定", assignment: "分配", input: "输入", output: "输出", worker: "工作进程", env: "环境", spawn: "派生", run: "运行", cleanup: "清理", constructed: "已构造", stages: "阶段", destroy: "销毁", torch: "Torch", distributed: "分布式", reclaim: "回收", cuda: "CUDA", construct: "构造", scheduler: "调度器", accelerator: "加速器", normalize: "规范化", local: "本地", name: "名称", close: "关闭", queue: "队列", platform: "平台", class: "类", load: "加载", available: "可用", h20: "H20", fp8: "FP8", cutlass: "CUTLASS", moe: "MoE", supported: "支持", messages: "消息", modality: "模态", placeholders: "占位符", chat: "聊天", template: "模板", audio: "音频", source: "来源", profiler: "分析器", enabled: "启用", now: "当前时间", elapsed: "耗时", emit: "输出", active: "活动", event: "事件", recorder: "记录器", host: "主机", boot: "启动", id: "ID", model: "模型", start: "开始", end: "结束", main: "主入口", text: "文本", json: "JSON", default: "默认序列化" };
function label(name) { return name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1_$2").split("_").filter(Boolean).map((x) => W[x.toLowerCase()] || x).join(" "); }
function summaryFor(path, kind, name) {
  const key = `${path}:${name}`;
  if (explicit[key]) return explicit[key];
  const l = label(name), t = topic[path];
  if (kind === "class") return `实现${l}，封装${t}中的状态、配置和运行行为。`;
  const rules = [[/^resolve_/, "解析"], [/^build_/, "构建"], [/^create_/, "创建"], [/^prepare_/, "准备"], [/^allocate_/, "分配"], [/^validate_/, "校验"], [/^assign_/, "分配"], [/^expand_/, "展开"], [/^load_/, "加载"], [/^ensure_/, "确保"], [/^normalize_/, "规范化"], [/^append_/, "追加"], [/^apply_/, "应用"], [/^emit_/, "输出"], [/^set_/, "设置"], [/^reset_/, "重置"], [/^get_/, "获取"], [/^_build_/, "构建"], [/^_attach_/, "附加"], [/^_resolve_/, "解析"], [/^_visible_/, "统计"], [/^_truncate_/, "截断"], [/^_validate_/, "校验"], [/^_longest_/, "计算"], [/^_ipc_/, "计算"], [/^_raise_/, "报告"], [/^_get_/, "获取"], [/^_patched_/, "临时修补"], [/^_run_/, "运行"], [/^_cleanup_/, "清理"], [/^_stage_/, "解析"], [/^_destroy_/, "销毁"], [/^_reclaim_/, "回收"], [/^_construct_/, "构造"], [/^_prepare_/, "准备"], [/^_normalize_/, "规范化"], [/^_process_/, "生成"], [/^_close_/, "关闭"], [/^_is_/, "检测"], [/^_load_/, "加载"], [/^_as_/, "转换"], [/^_resolve_/, "解析"], [/^_json_/, "序列化"], [/^_read_/, "读取"], [/^_emit_/, "输出"], [/^now_/, "获取"], [/^elapsed_/, "计算"]];
  const action = (rules.find(([re]) => re.test(name)) || [null, "执行"])[1];
  return `${action}${l}逻辑，服务于${t}的运行和数据处理。`;
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
  for (const [kind, list] of [["function", result.functions || []], ["class", result.classes || []]]) for (const item of list) {
    const sid = id(kind, path, item.name), tags = [...new Set([info[1][0], info[1][1], slug(item.name), kind])].slice(0, 5);
    nodes.push({ id: sid, type: kind, name: item.name, filePath: path, lineRange: [item.startLine, item.endLine], summary: summaryFor(path, kind, item.name), tags, complexity: complexity(item.startLine, item.endLine, kind) });
    map.set(item.name, sid);
    edges.push({ source: fileId, target: sid, type: "contains", direction: "forward", weight: 1 });
    if (exported.has(item.name)) edges.push({ source: fileId, target: sid, type: "exports", direction: "forward", weight: 0.8 });
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
    if (source && target && source !== target && !edgeKeys.has(key) && callEdgesAdded < 70) { edges.push({ source, target, type: "calls", direction: "forward", weight: 0.8 }); edgeKeys.add(key); callEdgesAdded += 1; }
  }
}

const D = [
  ["class", "pipeline/stage/input.py", "DirectInput", "class", "pipeline/stage/input.py", "InputHandler", "inherits", 0.9],
  ["class", "pipeline/stage/input.py", "AggregatedInput", "class", "pipeline/stage/input.py", "InputHandler", "inherits", 0.9],
  ["class", "pipeline/replicas.py", "RoundRobinBindingPolicy", "class", "pipeline/replicas.py", "BindingPolicy", "inherits", 0.9],
  ["class", "platforms/cpu.py", "CPUOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "platforms/cuda.py", "CUDAOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "platforms/musa.py", "MUSAOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "platforms/npu.py", "NPUOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "platforms/rocm.py", "ROCMOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "platforms/xpu.py", "XPUOmniPlatform", "class", "platforms/interface.py", "OmniPlatform", "inherits", 0.9],
  ["class", "pipeline/mp_runner.py", "MultiProcessPipelineRunner", "class", "pipeline/stage_workers.py", "StageGroup", "depends_on", 0.6],
  ["class", "pipeline/stage/runtime.py", "Stage", "class", "pipeline/stage/stream_queue.py", "StreamQueue", "depends_on", 0.6],
  ["class", "profiler/event_recorder.py", "RequestEventRecorder", "class", "profiler/event_recorder.py", "RequestEvent", "depends_on", 0.6]
];
for (const [sk, sp, sn, tk, tp, tn, type, weight] of D) {
  const source = id(sk, sp, sn), target = id(tk, tp, tn), key = `${source}|${target}|${type}`;
  if (!nodes.some((n) => n.id === source) || !nodes.some((n) => n.id === target)) throw new Error(`语义边端点不存在: ${source} -> ${target}`);
  if (!edgeKeys.has(key)) { edges.push({ source, target, type, direction: "forward", weight }); edgeKeys.add(key); }
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
  const name = partCount === 1 ? "batch-27.json" : `batch-27-part-${i + 1}.json`, json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}
if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

import fs from "node:fs";

const base = "sglang_omni/.ua";
const extracted = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-extract-results-29.json`, "utf8"));
const input = JSON.parse(fs.readFileSync(`${base}/tmp/ua-file-analyzer-input-29.json`, "utf8"));

const F = {
  "scheduling/speaker_cache.py": ["按模型、说话人和编码参数缓存 TTS 说话人制品，估算显存/主存占用并支持全局缓存复用。", ["scheduling", "speaker-cache", "tts", "memory-accounting"], "moderate"],
  "scheduling/stage_cache.py": ["实现通用阶段输出 LRU 缓存，将张量安全分离并可固定到主机内存，同时按字节预算淘汰。", ["scheduling", "stage-cache", "lru", "pinned-memory"], "complex"],
  "scheduling/streaming_simple_scheduler.py": ["实现具备 inbox/outbox 的流式简单调度器，管理请求主负载、流块、完成信号、中止、超时和结果输出。", ["scheduling", "streaming-scheduler", "request-lifecycle", "inbox-outbox"], "complex"],
  "scheduling/streaming_vocoder.py": ["定义流式声码器调度基类，协调码块摄取、批次参与者、解码节奏、资源释放和完整解码回退。", ["scheduling", "streaming-vocoder", "batching", "audio-decode"], "complex"],
  "scheduling/threaded_simple_scheduler.py": ["在线程中运行简单调度循环，以带计数的 inbox 提供工作唤醒、停止、中止和异常传播。", ["scheduling", "threaded-scheduler", "inbox", "concurrency"], "complex"],
  "scheduling/typed_tensor.py": ["把 Torch 张量编码为带 dtype 与形状的可移植字节格式，并从该格式恢复张量。", ["scheduling", "tensor-serialization", "dtype"], "moderate"],
  "scheduling/vocoder_base.py": ["定义批量声码器调度器的解码、结果组装和资源清理接口。", ["scheduling", "batch-vocoder", "scheduler-base"], "moderate"],
  "serve/__init__.py": ["通过惰性属性公开服务启动器和 OpenAI API 应用工厂。", ["serve", "public-api", "lazy-import"], "simple"],
  "serve/generation_params.py": ["记录请求中用户显式提供的生成参数，便于默认值合并和响应追踪。", ["serve", "generation-params", "request-metadata"], "simple"],
  "serve/launcher.py": ["准备流水线和 FastAPI 应用、挂载 profiler 路由、启动 Uvicorn，并监控服务与子进程失败。", ["serve", "server-launcher", "uvicorn", "pipeline-runtime"], "complex"],
  "serve/openai_api.py": ["构建 OpenAI 兼容 FastAPI 服务，注册模型、管理、聊天、生成、实时、语音、批量和 WebSocket 端点。", ["serve", "openai-api", "fastapi", "speech", "streaming"], "complex"],
  "serve/openai_errors.py": ["识别应转换为 OpenAI 兼容 400 响应的请求错误。", ["serve", "openai-errors", "bad-request"], "simple"],
  "serve/protocol.py": ["定义聊天、生成、多模态张量、语音、转写、模型列表和管理操作的 OpenAI 兼容 Pydantic 协议。", ["serve", "openai-protocol", "pydantic", "api-schema"], "complex"],
  "serve/realtime/__init__.py": ["公开 OpenAI Realtime 会话管理器和事件协议。", ["serve", "realtime-api", "package"], "simple"],
  "serve/realtime/audio_buffer.py": ["维护 Realtime 会话的有界 PCM 音频缓冲区，支持追加、清空、截取和溢出报告。", ["serve", "realtime-audio", "buffer", "pcm"], "moderate"],
  "serve/realtime/events.py": ["定义 Realtime 客户端与服务端事件、会话配置和轮次检测协议，并提供事件创建与解析。", ["serve", "realtime-events", "session-config", "protocol"], "moderate"],
  "serve/realtime/manager.py": ["创建、查询和关闭并发 Realtime 会话，并在服务停止时统一清理。", ["serve", "realtime-manager", "session-lifecycle"], "moderate"],
  "serve/realtime/session.py": ["实现完整 OpenAI Realtime 会话状态机，处理音频缓冲、VAD、转写、响应生成、取消和事件推送。", ["serve", "realtime-session", "vad", "websocket", "generation"], "complex"],
  "serve/realtime/vad.py": ["封装流式语音活动检测，累计帧、换算时间偏移并产生语音开始和结束事件。", ["serve", "voice-activity-detection", "streaming-audio"], "moderate"],
  "serve/speech_errors.py": ["把语音服务异常转换为 OpenAI 兼容 HTTP 或 WebSocket 错误负载，并提供常用错误工厂。", ["serve", "speech-errors", "openai-error", "websocket"], "moderate"],
  "serve/speech_limits.py": ["集中定义语音上传、参考音频和批量请求的服务限制常量。", ["serve", "speech-limits", "validation"], "simple"],
  "serve/speech_service.py": ["校验并准备 TTS 请求、参考音频、音色和采样参数，支持批量错误隔离、上传音色和媒体大小限制。", ["serve", "speech-service", "tts", "request-validation", "reference-audio"], "complex"],
  "serve/speech_to_text.py": ["解析转写表单、校验音频、构建 ASR 请求、检测语言，并生成普通、详细或流式 OpenAI 转写响应。", ["serve", "speech-to-text", "asr", "streaming-response"], "complex"],
  "serve/speech_voices.py": ["管理上传音色及其参考样本、元数据和编码制品，校验媒体并以原子方式持久化文件。", ["serve", "voice-management", "speaker-store", "reference-audio"], "complex"],
  "serve/speech_ws.py": ["实现语音生成 WebSocket 会话，接收配置与文本、流式发送音频和事件，并处理取消与错误。", ["serve", "speech-websocket", "streaming-audio", "session"], "complex"]
};

const topic = Object.fromEntries(Object.entries(F).map(([path, info]) => [path, info[1].slice(0, 2).join("、")]));
const explicit = {
  "scheduling/speaker_cache.py:SpeakerCacheKey": "以模型修订、说话人、编码配置和输入指纹唯一标识说话人制品。",
  "scheduling/speaker_cache.py:SpeakerArtifactCache": "按字节预算缓存说话人嵌入或参考音频码，并提供线程安全查询与淘汰。",
  "scheduling/stage_cache.py:_CacheEntry": "保存阶段缓存值、占用字节数和最近访问元数据。",
  "scheduling/stage_cache.py:StageOutputCache": "以 LRU 策略缓存阶段输出，将张量分离到安全主机存储并按容量淘汰。",
  "scheduling/streaming_simple_scheduler.py:StreamingSimpleScheduler": "协调流式请求的主负载与数据块到达顺序，处理完成、中止、超时和结果发送。",
  "scheduling/streaming_vocoder.py:StreamingVocoderBase": "定义码流摄取、分批解码、步长选择、会话资源和最终音频组装的公共算法。",
  "scheduling/threaded_simple_scheduler.py:_CountingInbox": "包装消息队列并维护待处理计数，用于无忙等地唤醒调度线程。",
  "scheduling/threaded_simple_scheduler.py:ThreadedSimpleScheduler": "在后台线程运行请求调度循环并封装启动、停止、中止和异常传播。",
  "scheduling/vocoder_base.py:BatchVocoderBase": "定义完成请求的批量声码器解码及结果写回契约。",
  "serve/launcher.py:_PipelineUvicornServer": "扩展 Uvicorn Server 以配合流水线失败监控和受控退出。",
  "serve/launcher.py:StartReq": "描述 profiler 启动请求的活动范围和输出参数。",
  "serve/launcher.py:StopReq": "描述停止 profiler 的管理请求。",
  "serve/launcher.py:StartRequestProfileReq": "描述按请求启动性能追踪的管理请求。",
  "serve/openai_api.py:_RequestBodyTooLarge": "表示请求体超过语音上传限制的内部控制异常。",
  "serve/openai_api.py:VoiceUploadBodyLimitMiddleware": "在读取完整请求前按路由和 Content-Length 限制音色上传体积。",
  "serve/realtime/audio_buffer.py:BufferOverflow": "报告实时音频缓冲区超限及允许的最大字节数。",
  "serve/realtime/audio_buffer.py:RealtimeAudioBuffer": "线程安全地累计会话 PCM 字节，并支持消费、清空和边界检查。",
  "serve/realtime/manager.py:RealtimeSessionManager": "管理活动 RealtimeSession 的创建、查找、移除和批量关闭。",
  "serve/realtime/session.py:ConversationItem": "表示实时会话对话历史中的用户或助手项目。",
  "serve/realtime/session.py:ResponseOutput": "保存一次实时响应的文本、音频和完成状态。",
  "serve/realtime/session.py:RealtimeSession": "协调 WebSocket 事件、音频缓冲、VAD、ASR 和生成任务的完整会话生命周期。",
  "serve/realtime/vad.py:VADConfig": "保存语音活动检测阈值、前缀填充和静音时长配置。",
  "serve/realtime/vad.py:VADEvent": "表示检测到的语音开始或结束及其时间偏移。",
  "serve/realtime/vad.py:Emit": "封装 VAD 应发送的事件和可选音频片段。",
  "serve/realtime/vad.py:StreamingVAD": "增量处理音频帧并根据阈值状态机产生语音边界事件。",
  "serve/speech_errors.py:SpeechAPIError": "携带 HTTP 状态、OpenAI 错误类型、参数和错误码的语音服务异常。",
  "serve/speech_service.py:PreparedSpeechRequest": "保存已通过校验的语音请求和发送给模型的参数。",
  "serve/speech_service.py:PreparedSpeechReferences": "保存规范化参考音频描述与缓存复用信息。",
  "serve/speech_service.py:SpeechRequestValidator": "统一校验 TTS 文本、任务、音色、参考媒体、流式和批量参数并构建模型请求。",
  "serve/speech_service.py:_SpeechReferenceMediaIO": "解析数据 URL、上传文件和音色库引用并执行媒体大小与格式校验。",
  "serve/speech_to_text.py:SpeechToTextForm": "保存转写端点解析后的模型、语言、提示和响应格式字段。",
  "serve/speech_voices.py:UploadedVoice": "描述已持久化音色的名称、元数据、引用样本和编码制品。",
  "serve/speech_voices.py:UploadedVoiceReference": "描述音色库中的单个参考音频及其转写文本。",
  "serve/speech_voices.py:SpeakerSampleStore": "以锁和原子文件替换管理音色样本、元数据、容量限制与安全张量制品。",
  "serve/speech_ws.py:SpeechWebSocketSession": "管理语音 WebSocket 协议、请求构建、流式音频发送、取消与关闭。"
};

const W = { create: "创建", register: "注册", build: "构建", read: "读取", send: "发送", content: "内容", length: "长度", voice: "音色", upload: "上传", scope: "范围", health: "健康检查", models: "模型", admin: "管理", response: "响应", model: "模型", info: "信息", common: "公共", chat: "聊天", completions: "补全", stream: "流式", explicit: "显式", generation: "生成", params: "参数", request: "请求", rollout: "采样展开", speech: "语音", batch: "批量", pcm: "PCM", audio: "音频", await: "等待", cancel: "取消", task: "任务", disconnect: "断开", abort: "中止", close: "关闭", cache: "缓存", bytes: "字节", encode: "编码", encoded: "已编码", key: "键", speaker: "说话人", artifact: "制品", pinned: "固定页", host: "主机", detach: "分离", value: "值", size: "大小", initial: "初始", codec: "编解码器", chunk: "块", frames: "帧", typed: "类型化", tensor: "张量", record: "记录", default: "默认", port: "端口", run: "运行", id: "ID", template: "模板", stage: "阶段", runtime: "运行时", log: "日志", summary: "摘要", format: "格式", gpu: "GPU", device: "设备", placement: "放置", capabilities: "能力", profiler: "分析器", routes: "路由", server: "服务", failure: "失败", watch: "监控", available: "可用", event: "事件", directory: "目录", error: "错误", payload: "负载", websocket: "WebSocket", bad: "错误", service: "服务", unavailable: "不可用", internal: "内部", reference: "参考", media: "媒体", normalize: "规范化", tasktype: "任务类型", validation: "校验", positive: "正数", non: "非", negative: "负数", int: "整数", parse: "解析", data: "数据", url: "URL", base64: "Base64", estimated: "估算", decoded: "解码后", freeze: "冻结", language: "语言", detect: "检测", transcription: "转写", form: "表单", assemble: "组装", probe: "探测", duration: "时长", adapter: "适配器", complete: "完成", first: "首个", streaming: "流式", raw: "原始", session: "会话", fields: "字段", exception: "异常", name: "名称", root: "目录", uploaded: "上传", env: "环境", required: "必填", optional: "可选", mime: "MIME", type: "类型", decode: "解码", validate: "校验", write: "写入", temp: "临时", file: "文件", replace: "替换", metadata: "元数据", safetensors: "SafeTensors", save: "保存", load: "加载", recorder: "记录器", offsets: "偏移", ms: "毫秒", client: "客户端", turn: "轮次", detection: "检测", parseclientevent: "解析客户端事件" };
function label(name) { return name.replace(/^_+/, "").replace(/([a-z0-9])([A-Z])/g, "$1_$2").split("_").filter(Boolean).map((x) => W[x.toLowerCase()] || x).join(" "); }
function summaryFor(path, kind, name) {
  const key = `${path}:${name}`;
  if (explicit[key]) return explicit[key];
  const l = label(name), t = topic[path];
  if (kind === "class") {
    if (/(Request|Response|Event|Message|Params|Config|Metadata|Choice|Delta|Audio|Reference|Permission|Card|List|Reason|Info|Item|Object|Type|Usage|Base)$/.test(name)) return `定义${l}协议模型，校验并序列化${t}相关字段。`;
    return `实现${l}，封装${t}中的状态、校验和运行行为。`;
  }
  const rules = [[/^create_/, "创建"], [/^register_/, "注册"], [/^build_/, "构建"], [/^read_/, "读取"], [/^validate_/, "校验"], [/^resolve_/, "解析"], [/^normalize_/, "规范化"], [/^parse_/, "解析"], [/^detect_/, "检测"], [/^complete_/, "完成"], [/^assemble_/, "组装"], [/^probe_/, "探测"], [/^openai_/, "构建"], [/^speech_/, "处理"], [/^bad_/, "创建"], [/^internal_/, "创建"], [/^service_/, "创建"], [/^new_/, "创建"], [/^make_/, "创建"], [/^record_/, "记录"], [/^estimate_/, "估算"], [/^encode_/, "编码"], [/^decode_/, "解码"], [/^get_/, "获取"], [/^offsets_/, "换算"], [/^_register_/, "注册"], [/^_build_/, "构建"], [/^_read_/, "读取"], [/^_send_/, "发送"], [/^_is_/, "判断"], [/^_content_/, "读取"], [/^_timeout_/, "解析"], [/^_request_/, "读取"], [/^_admin_/, "构造"], [/^_model_/, "构造"], [/^_extract_/, "提取"], [/^_common_/, "归并"], [/^_chat_/, "处理"], [/^_explicit_/, "提取"], [/^_rollout_/, "转换"], [/^_speech_/, "处理"], [/^_await_/, "等待"], [/^_cancel_/, "取消"], [/^_discard_/, "清理"], [/^_wait_/, "等待"], [/^_abort_/, "中止"], [/^_to_/, "转换"], [/^_detach_/, "分离"], [/^_value_/, "计算"], [/^_encode_/, "编码"], [/^_encoded_/, "解析"], [/^_find_/, "查找"], [/^_default_/, "生成"], [/^_format_/, "格式化"], [/^_placement_/, "汇总"], [/^_log_/, "记录"], [/^_mount_/, "挂载"], [/^_run_/, "运行"], [/^_serve_/, "运行"], [/^_parse_/, "解析"], [/^_validate_/, "校验"], [/^_normalize_/, "规范化"], [/^_reference_/, "转换"], [/^_uploaded_/, "解析"], [/^_batch_/, "处理"], [/^_freeze_/, "冻结"], [/^_estimated_/, "估算"], [/^_first_/, "获取"], [/^_looks_/, "判断"], [/^_soundfile_/, "探测"], [/^_av_/, "探测"], [/^_resolve_/, "解析"], [/^_speaker_/, "解析"], [/^_decode_/, "解码"], [/^_voice_/, "处理"], [/^_write_/, "写入"], [/^_replace_/, "替换"], [/^_safetensors_/, "操作"], [/^_cancel_tasks/, "取消"], [/^_speech_error_/, "转换"], [/^_validate_raw_/, "校验"]];
  const action = (rules.find(([re]) => re.test(name)) || [null, "执行"])[1];
  return `${action}${l}逻辑，服务于${t}的请求处理与协议转换。`;
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
    if (source && target && source !== target && !edgeKeys.has(key) && callEdgesAdded < 80) { edges.push({ source, target, type: "calls", direction: "forward", weight: 0.8 }); edgeKeys.add(key); callEdgesAdded += 1; }
  }
}

const D = [
  ["class", "scheduling/speaker_cache.py", "SpeakerArtifactCache", "class", "scheduling/speaker_cache.py", "SpeakerCacheKey"],
  ["class", "scheduling/streaming_simple_scheduler.py", "StreamingSimpleScheduler", "class", "scheduling/threaded_simple_scheduler.py", "ThreadedSimpleScheduler"],
  ["class", "serve/realtime/manager.py", "RealtimeSessionManager", "class", "serve/realtime/session.py", "RealtimeSession"],
  ["class", "serve/realtime/session.py", "RealtimeSession", "class", "serve/realtime/audio_buffer.py", "RealtimeAudioBuffer"],
  ["class", "serve/realtime/session.py", "RealtimeSession", "class", "serve/realtime/vad.py", "StreamingVAD"],
  ["class", "serve/speech_service.py", "SpeechRequestValidator", "class", "serve/speech_service.py", "PreparedSpeechRequest"],
  ["class", "serve/speech_service.py", "SpeechRequestValidator", "class", "serve/speech_service.py", "_SpeechReferenceMediaIO"],
  ["class", "serve/speech_voices.py", "SpeakerSampleStore", "class", "serve/speech_voices.py", "UploadedVoice"],
  ["class", "serve/speech_ws.py", "SpeechWebSocketSession", "class", "serve/speech_service.py", "SpeechRequestValidator"],
  ["function", "serve/openai_api.py", "_register_realtime", "class", "serve/realtime/manager.py", "RealtimeSessionManager"],
  ["function", "serve/openai_api.py", "_register_speech", "class", "serve/speech_service.py", "SpeechRequestValidator"],
  ["function", "serve/openai_api.py", "_register_speech_ws", "class", "serve/speech_ws.py", "SpeechWebSocketSession"],
  ["function", "serve/speech_to_text.py", "assemble_speech_to_text_response", "class", "serve/protocol.py", "TranscriptionResponse"],
  ["function", "serve/speech_to_text.py", "speech_to_text_stream", "class", "serve/protocol.py", "TranscriptionTextDeltaEvent"]
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
  const name = partCount === 1 ? "batch-29.json" : `batch-29-part-${i + 1}.json`, json = JSON.stringify(parts[i], null, 2) + "\n";
  console.log("*** Begin Patch");
  console.log(`*** Add File: sglang_omni/.ua/intermediate/${name}`);
  for (const line of json.split("\n").slice(0, -1)) console.log(`+${line}`);
  console.log("*** End Patch");
}
if (!selected) console.error(JSON.stringify({ files: paths.length, nodes: nodes.length, edges: edges.length, partCount, partNodes: parts.map((p) => p.nodes.length), partEdges: parts.map((p) => p.edges.length) }));

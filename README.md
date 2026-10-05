# DeepSeek Codex · Token 用量看板

一个基于 Electron 的 DeepSeek 网页桌面封装，内置**本地 Token 用量看板**：
按时间分时段聚合（今日按小时、其余按天），区分「服务端精确值」与「本地估算值」，
支持历史存量会话全量回填、CSV / JSON 导出、估算系数校准。**数据全部保存在本机，不上传任何地方。**

![看板顶部](docs/dashboard-top.png)

![趋势图与数据构成](docs/dashboard-chart.png)

## 功能

- **看板入口**：侧栏 → Stone → 系统设置 → 「Token 用量」（与「账号管理」平级）
- **精确统计**：读取 `history_messages` 返回的 `accumulated_token_usage`，按消息做差分得到逐条精确 token（输入 / 思考 / 回答分列），精确率 100%
- **本地估算**：界面呈现文本按中 / 英 / 数字 / 符号分段启发式估算，仅在没有精确值时兜底，可用滑条校准（0.5x–2.0x）
- **历史回填**：`fetch_page` 分页拉取全部会话 → 逐会话拉取全量历史，启动后自动执行，可断点续传；同步条实时显示进度
- **增量采集**：活动会话每 15 秒轮询一次，窗口失焦时不采集
- **分段视图**：今日 / 近 7 天 / 近 30 天 / 全部，含分段柱状图、4 张统计卡、数据构成占比、口径说明、明细表
- **导出**：CSV（带来源标签：接口 usage / 服务端精确 / 估算）、JSON、清空重置、大屏模式

## 快速开始

```bash
npm install     # .npmrc 已内置 npmmirror 镜像（Electron / electron-builder 走国内源）
npm start       # 开发运行，userData 位于系统 %APPDATA% 下
npm run dist    # electron-builder 打包到 release/win-unpacked
```

打包后的便携版：userData 固定为 **exe 同级 `userdata/` 目录**（随 U 盘移动，登录态与统计数据一致）。

## 数据文件

| 文件 | 说明 |
| --- | --- |
| `userdata/token-stats.json` | 全部用量事件与元数据（`events` / `meta.sessions` / `calib`） |
| `userdata/*` | 登录态、IndexedDB 等，请勿提交到仓库 |

保留策略：默认保留 1500 天内的事件，超出部分在写入时自动裁剪。

## 统计口径

- **服务端精确值（推荐口径）**：同一条消息按 `会话 ID + 消息 ID` 去重，终身只计一次；`accumulated_token_usage` 差分即该条消息的精确 token
- **本地估算**：按字符类别分段（中文约 1.5 字 ≈ 1 token、英文 4 字母 ≈ 1、数字 3、空白 /10、标点 /2）
- **接口 usage**：`usage` 字段单独归类，不计入总量，避免与逐条差分重复统计
- 看板顶部「精确率」= 精确值 / (精确值 + 估算值)

## 隐私

- 仅在本机读取你自己账号的会话历史与 token 统计，全部落盘在本地 `token-stats.json`
- 采集的鉴权头只保存在内存中用于调用同一账号的历史接口，不写入磁盘、不外发

## 免责声明

- 本项目为第三方实现，**非 DeepSeek 官方产品，与 DeepSeek 无任何关联**
- 使用本项目需自行遵守 DeepSeek 的服务条款与相关法律法规

## License

[MIT](LICENSE) © stone2010

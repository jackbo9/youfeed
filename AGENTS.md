# YouFeed — Agent 执行约定

## 开始前

- 先读 `PLAN.md` 的定位、轮次状态与最新 review 记录，再读本轮涉及的代码。
- 当前产品基线为 `2c0efae`。历史评估见 `docs/audit-2026-10-03/assessment.md`，截图是历史证据，不是修改后验证。
- 用户最新明确指令优先于本文档；不要把本文档变成额外的确认流程。

## 按轮交付

1. 每次只执行用户指定或已批准的一个轮次。用户说“开始/继续下一轮”，即授权实施该轮、必要的简单检查、本地预览、Git commit 和 push，无需逐项再次确认。
2. 开始时将该轮标为 `IN_PROGRESS`。严格控制在该轮范围；必要的前置修复可以包含，但要记录原因。
3. 完成代码和简单检查后更新 `PLAN.md`：改动、检查结果、已知限制、用户浏览器检查项、下一步。
4. 启动或复用本地服务，HTTP 检查可访问，然后生成一个清楚的 commit 并推送当前工作分支。不要只留本地修改。
5. 将该轮标为 `READY_FOR_USER_REVIEW`，交付本地链接、分支、提交短 SHA、检查结果、3–5 项走查重点，然后停止本轮，不自动进入下一轮。
6. 用户指出问题时留在同一轮，修复后追加 commit 和 push；不 amend 已推送历史。用户明确通过或要求进入下一轮后，才将该轮标为 `ACCEPTED`。
7. Agent 完成实现、构建通过或 push 成功，都不等于用户已验收。不能代用户记录通过。

状态：`NOT_STARTED → IN_PROGRESS → READY_FOR_USER_REVIEW → ACCEPTED`；用户反馈需修改时为 `CHANGES_REQUESTED`，修复后回到 `READY_FOR_USER_REVIEW`。

## 分工与检查边界

- Agent：实现、基本代码检查、启动本地预览、版本提交与推送、记录已知限制。
- 用户：浏览器内走查、视觉判断、交互 review、真实手机/键盘/权限体验及最终验收。
- 默认不调用浏览器自动化，不做截图 QA、跨浏览器测试、全面无障碍审计、自动生成多套视觉稿或大规模测试。用户后续明确要求时再做。
- 产品代码轮次运行 `npm run lint`、`npm run build`、`git diff --check`，并检查改动中的状态转换、输入边界、内容保留及明显逻辑问题。
- 纯文档轮次以文档一致性、路径和 `git diff --check` 为准，无需重复构建。
- 已知基线 lint 问题记录在 `PLAN.md`；第一轮修复，之后不引入新的 lint/build 失败。不要为了通过检查关闭规则或删除有效检查。
- 只为确有价值的复杂逻辑添加小范围测试，不为低风险样式修改或实现细节铺设测试套件。
- 本地服务优先复用本仓库已有的 Vite 服务；确认来源后使用 `http://127.0.0.1:5173/`。若不可用，运行 `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`。端口被其他项目占用时选空闲端口并记录，不杀其他项目进程。
- 用 HTTP 请求确认入口可访问；这只能证明服务可访问，不能称为浏览器验收或交互验证。
- 保留服务供用户 review；服务被运行环境结束时重新启动，不承诺永久后台运行。默认不开放公网、不发布生产站点。

## Git 节点

- 开始与提交前检查 `git status` 和当前分支；保留用户已有修改，只 stage 本轮明确涉及的文件。
- 当前约定沿用 `main`，远端 `origin`：`https://github.com/jackbo9/youfeed.git`。如果用户切换了分支，沿用其工作分支，不擅自切回。
- 每个可 review 的轮次至少一个独立 commit；例如 `feat: R1 make demo flow complete`。文档节点用 `docs: R0 record upgrade plan and agent workflow`。
- 推送用普通 `git push`；禁止 force push、擅自重写远端历史或丢弃修改。遇到远端分叉先获取并检查差异，再决定安全整合方式。
- 不提交 `node_modules/`、`dist/`、`.codegraph/` 数据库、日志、凭据或本地临时文件。
- push 失败就记录实际原因，保留本地 commit；不能声称已同步。
- `PLAN.md` 不预填尚未生成的 SHA。当前轮 commit 用最终回复报告；下一轮开始时可将上一轮 SHA 补进记录，避免为自引用不断提交。

## 产品原则

- Giacomini 发起反馈，YouFeed 提供支持；保持“进入 → 表达 → 核对 → 完成”的轻量任务。
- YouFeed 保留交互、组件与状态规则；客户适配标识、品牌表达和内容。不要完整照搬客户营销网站，也不要建设通用换肤平台。
- 语音和文字均可直接发现；切换与恢复保留已有内容；成功仅在对应动作确实完成后显示。
- 历史部署、当前演示、本次验证分开记录。历史 1,000+ 团队响应不作为本版本效果证据。
- 演示必须标注模拟行为；不得请求真实麦克风权限后只展示模拟录音，也不得把模拟提交描述成已送达 Giacomini。
- 客户图片、品牌规范、产品名与用途说明要有来源；缺失时标为待确认，不编造。
- 不添加账户、积分、信息流、复杂问卷、分析后台或无关功能。
- 作品集外部仓库的实际修改/发布不在本仓库默认授权范围；本项目先产出可使用的叙述与材料。

<!-- CODEGRAPH_START -->
## CodeGraph

本项目已建立 `.codegraph/` 索引。结构问题优先使用配置的 `codegraph_*` MCP 工具，传入本项目绝对路径。

| 任务 | 首选工具 |
| --- | --- |
| 符号位置 | `codegraph_search` |
| 调用方/被调用方 | `codegraph_callers` / `codegraph_callees` |
| 从 X 到 Y 的完整流程 | `codegraph_trace`，再按需一次 `codegraph_explore` |
| 修改影响 | `codegraph_impact` |
| 签名/源码 | `codegraph_node` |
| 区域上下文 | `codegraph_context`，再按需一次 `codegraph_explore` |
| 多个相关符号 | `codegraph_explore` |
| 文件列表/索引状态 | `codegraph_files` / `codegraph_status` |

- 仅暴露 `codegraph_explore` 时直接使用它获取相关上下文，不假定其他工具可调用。
- 架构探索直接回答，不派子 agent 重复读文件；本项目默认不创建并行 agent 或新聊天。
- 不先 grep 查符号，不对同一结果再次 grep 验证，不循环逐个读大量符号。
- 原生 `rg` 用于字符串、注释、日志等字面内容；已打开的具体文件可以直接读取。
- 有 staleness banner 时只读取列出的待同步文件；其余结果可信。不猜测等待时间。
- 若新 checkout 没有索引且未获初始化授权，问用户是否运行 `codegraph init -i`。当前 checkout 已于 R0 获授权并完成初始化。
- 工具不可用或明确返回未索引时如实说明，并按其指示使用原生读取；不要假称索引已验证。
<!-- CODEGRAPH_END -->

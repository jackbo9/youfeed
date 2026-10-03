# YouFeed × Giacomini

面向展会现场的轻量反馈体验：确认展品 → 语音或文字表达 → 核对 → 完成。

当前仓库是演示原型，录音/转写/提交尚不代表真实服务。升级按轮交付，由用户负责浏览器走查与 review。

## 开发

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

打开 http://127.0.0.1:5173/ 。简单代码检查：`npm run lint`、`npm run build`、`git diff --check`。

## 文档

- [Agent 执行约定](AGENTS.md)：按轮实施、本地预览、commit/push、review 分工。
- [完整升级计划与进度](PLAN.md)：定位、轮次范围、验收和执行记录。
- [升级前评估](docs/audit-2026-10-03/assessment.md)：原始问题与证据边界。

当前为 R0 文档节点。已有 3 条 lint 基线错误将在 R1 修复，详见计划；build 已在初始评估通过。

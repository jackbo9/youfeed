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

当前为 **R0 + R1 合并交付，待用户 review**。基线 lint 错误已修复，lint/build 通过；浏览器走查由用户完成。

## 本轮体验

- 文字：输入 → 提交演示 → Demo complete。
- 模拟语音：点击麦克风 → 停止或等 30 秒 → 编辑样例 → 提交演示。不申请麦克风权限。
- 失败：展开底部 **Demo controls**，勾选 **Fail the next submission, then allow retry**；下次提交失败后草稿仍在，再重试成功。
- 转写与文字共享草稿。重新录音完成后会替换为样例，开始前确认；取消录音保留已有文字。
- 清空/重启需确认。草稿只保留在当前页面内存，刷新会清空。
- 无真实音频采集、转写或后端投递；完成页不代表反馈已送达客户。

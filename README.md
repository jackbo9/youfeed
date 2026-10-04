# YouFeed × Giacomini

轻量展会反馈概念：确认展品 → 语音或文字表达 → 核对 → 完成。

这是 **2026 年作品集重构演示**，使用官方 Giacomini R146C 素材。语音、转写和提交均为模拟；不请求麦克风、不发送反馈。不是 Giacomini 官方在线收件服务，也不是 2025 年部署版本的逐像素还原。

## 本地运行

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

开发预览：http://127.0.0.1:5173/

```sh
npm run lint
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

生产构建预览：http://127.0.0.1:4173/

## 体验和异常场景

- 正常：Write a thought → 输入 → Finish feedback；或 Try speaking → Stop and review → Edit → Finish feedback。
- 底部 **About this demo & controls**：选择下一次语音尝试的模拟权限不可用/无有效录音/转写失败，或勾选下一次提交失败。场景只影响下一次尝试，正常重试可继续。
- 转写与文字共享草稿；返回、模式切换、失败重试不清空已形成的文字。
- 重录会在样例准备完成后替换草稿，开始前确认；清空/重启同样确认，Escape 可取消。
- 草稿只在页面内存；刷新、关闭或明确重启会清空。没有账户、持久化、分析后台或真实音频。

## 静态发布

`npm run build` 后，把 **dist 内的内容**上传到静态站点根目录或 `/youfeed/` 子目录。Vite 使用相对 base，所有品牌资产和字体无需外部 CDN。使用带尾斜线的子目录 URL（例如 `/youfeed/`），无需 SPA 路由重写。

本次构建包放在本地 `artifacts/youfeed-portfolio-demo.zip`（忽略于 Git）；相同内容可随时从源码重新构建。预览服务器仅监听本机；本次未发布公网。修改外部作品集页面或实际公开部署不是当前仓库自动执行的动作。

## 文档与证据

- [Agent 约定](AGENTS.md) · [完整计划与轮次记录](PLAN.md)
- [客户内容与官方资产来源](docs/giacomini-content.md)
- [小型视觉系统](docs/design-system.md)
- [中文版/英文版作品集更新材料](docs/portfolio-update.md)
- [最终发布资格检查与证据](docs/release-review-2026-10-04/README.md)
- [升级前评估](docs/audit-2026-10-03/assessment.md)

客户内容集中在 `src/client-config.js`，视觉规则在 `src/index.css`，行为状态在 `src/feedback-state.js`。品牌资产版权归其权利人；来源和事实/提案边界见内容文档。

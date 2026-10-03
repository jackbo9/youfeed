# Giacomini 内容与素材依据

核对日期：2026-10-04。本文件区分官方产品事实和本次设计提案，不代表客户批准。

## 官方事实与素材

- 产品页：https://www.giacomini.com/product/R146C
- 官方名称：R146C — Adjustable magnetic dirt separator（可调式磁性除污器）。不要沿用旧版泛称 Air & Dirt Separator，避免混淆排气与除污功能。
- 官方图片：https://www.giacomini.com/dam/jcr:55f50e69-2704-4a18-bc5b-747254f06204/R146C
  - 本地：`public/giacomini/r146c.jpg`，275×275，官方系列图，显示两种配置，不宣称单一 SKU。
  - 保持完整比例，contain 放置；不生成、重绘或裁掉产品部件。
- 官方标识：https://www.giacomini.com/.resources/sito-giacomini/webresources/images/giacomini_logo.svg
  - 本地：`public/giacomini/logo.svg`，200×40 viewBox，保留原始文件。
- 官方样式观察：https://www.giacomini.com/.resources/sito-giacomini/webresources/css/main.css
  - 标识 SVG 与官网 CSS 均使用 `#E0001B`；这是官网直接观察，不是已取得完整品牌手册。
- 图片/标识属各自权利人。用于本项目明确标注的客户情境概念演示；没有声称客户背书或素材开放许可。

## 本次内容卡（设计提案）

| 项目 | 本次选择 | 证据边界 |
| --- | --- | --- |
| 客户 | Giacomini | 用户指定 |
| 示例展品 | R146C 除污器 | 官方产品事实；尚未证明它就是 2025 年原项目现场 SKU |
| 情境 | Exhibition feedback | 展会反馈概念；不虚构 Hall B / Stand 14 等具体位置 |
| 目的 | 了解访客还想获得哪些解释 | 设计提案，非已确认客户研究目标 |
| 问题 | What would you like to know more about? | 直接置于产品图/名下，各输入方式一致 |
| 邀请 | One thought about this separator is enough. You can check your words before finishing. | 轻量表达邀请，非完成时长承诺 |
| 接收方 | Giacomini exhibition team | 演示中的拟定接收方，未真实投递 |
| 示例回答 | 关注清洁方法和维护频率 | 人工编写示例，不是访客原话、访谈记录或真实转写 |

## 处理说明与限制

- 不采集音频；不请求麦克风；反馈仅在当前页面内存；不调用提交/转写网络接口。
- 外层始终显示 Concept demo；完成页明确未送出。字体与品牌资产本地提供，不依赖第三方字体请求。
- 不承诺匿名、保存期限、研究用途或客户隐私条款；真实服务接入前由客户确认。
- 30 秒只是演示时长参数，可提前结束；文字不限制 280 字，避免切换时丢失较长草稿。
- 待真实部署确认：现场产品、问题目标、语言、收件机制、用途与权限说明、数据保留策略、真实输入限制。

配置入口：`src/client-config.js`。后续适配客户仅替换客户资产与内容；交互与恢复行为不随主题改变。

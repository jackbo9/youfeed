# YouFeed 展会现场运行指南｜图解·中英文对照 v1.2

2026-10-05。依据用户 brief、参与经历说明及当前项目资料重新设计。不是历史原件，不声明客户批准或真实工作人员测试通过。用户要求内容完整后增强 infographic 表达，并制作中英文对照。

## 交付与阅读

- [左右对照阅读版](../../output/pdf/youfeed-field-guide-bilingual-spreads.pdf)：8个主题，A3横版，左中文、右英文，适合屏幕对照与讨论。
- [A4打印版](../../output/pdf/youfeed-field-guide-bilingual.pdf)：16页，中文/英文逐主题成对排列；原尺寸打印以保留字号。PDF设置为双页显示，阅读器可能不采用该偏好。
- [双语速查](../../output/pdf/youfeed-field-quick-reference-bilingual.pdf)：中英各1页A4，支持单独打印。
- 文字审阅稿：[中文指南](guide-content.md)、[英文指南](guide-content-en.md)、[中文速查](quick-reference-content.md)、[英文速查](quick-reference-content-en.md)。
- [本次检查记录](review.md)。

正文与异常细则约10–10.5pt，辅助信息分级呈现。不要把整张A3对照页缩印到一张A4。第07节区分工作人员简记与负责人跟进，可复印填写，非交互式PDF表单。

## 图形结构

01：按角色排列的五步服务流程；02：三类区域图标与任务模块；04：两列六张引导卡；05–06：状态分流图＋固定结构异常条目，停止条件以红色文字标识。颜色同时配文字、字母或编号，不依赖色彩理解。

这是一张任务地图，不是虚构的展位平面图。蓝、绿属于本次文档的信息分类，未宣称为官方品牌规范。中英文共用图形、主题/卡片/异常编号；文内引用“节”，不受合并后的物理页码影响。

## 编辑与重新生成

双语内容主源：[guide_copy.py](guide_copy.py)。公共版式：[build_guide.py](build_guide.py)。双语合成：[build_bilingual.py](build_bilingual.py)。Markdown是同步导出的审阅稿，应修改内容主源再生成。

依赖 Python 3、reportlab、pypdf。中文默认使用macOS STHeiti；其他环境用 `YOUFEED_FONT_REGULAR` 和 `YOUFEED_FONT_BOLD` 指定可嵌入中文TTF/TTC。从仓库根目录运行：

```sh
python3 docs/field-guide/build_bilingual.py
```

五份最终PDF位于 `output/pdf/`，包括新增的[中文A4版](../../output/pdf/youfeed-field-guide-zh.pdf)与[英文A4版](../../output/pdf/youfeed-field-guide-en.pdf)。视觉检查图和初稿保留于 `artifacts/field-guide-qa/`。重新生成后需渲染并逐页查看，不能以脚本通过代替视觉检查。

第03节使用当前首页、核对页与完成页截图（assets/），裁切到对应操作区域，并集中说明演示性质。

## 现场使用前

负责人填写02区域核对单与08配置，确认拟定规则、真实完成提示和安全重试条件。当前演示不录音、不投递、刷新清空草稿；它不能代替真实系统行为。入口、活动与产品名、负责人、匿名性、数据保存和接收机制仍需确认。

作品集优先截取02、04、05–06主题，统一标注“依据项目经历重建，2026”。

## 作品集节选

`export_excerpts.py <输出目录>` 从最终单语PDF第02、04、05节导出原样裁片：三张区域卡、02/03引导卡、E1异常处理。manifest.json记录页码与裁切坐标。组合卡片在网页中响应式排列，E1附可直接阅读的文字。来源说明集中在指南首页和作品集章节引言。

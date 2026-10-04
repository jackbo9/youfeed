# YouFeed 展会现场运行指南｜图解·中英文对照 v1.1

2026-10-04。依据用户 brief、参与经历说明及当前项目资料重新设计。不是历史原件，不声明客户批准或真实工作人员测试通过。用户要求内容完整后增强 infographic 表达，并制作中英文对照。

## 交付与阅读

- [左右对照阅读版](../../output/pdf/youfeed-field-guide-bilingual-spreads.pdf)：8个主题，A3横版，左中文、右英文，适合屏幕对照与讨论。
- [A4打印版](../../output/pdf/youfeed-field-guide-bilingual.pdf)：16页，中文/英文逐主题成对排列；原尺寸打印以保留字号。PDF设置为双页显示，阅读器可能不采用该偏好。
- [双语速查](../../output/pdf/youfeed-field-quick-reference-bilingual.pdf)：中英各1页A4，支持单独打印。
- 文字审阅稿：[中文指南](guide-content.md)、[英文指南](guide-content-en.md)、[中文速查](quick-reference-content.md)、[英文速查](quick-reference-content-en.md)。
- [本次检查记录](review.md)。

正文10.5pt，异常细则和辅助信息9pt，图表文字9.5pt。不要把整张A3对照页缩印到一张A4。第07节是可复印的手写记录表，非交互式PDF表单。

## 图形结构

01：按角色排列的五步服务流程；02：三类区域图标与任务模块；04：两列六张引导卡；05–06：状态分流图＋固定结构异常条目，停止条件以红色文字标识。颜色同时配文字、字母或编号，不依赖色彩理解。

这是一张任务地图，不是虚构的展位平面图。蓝、绿属于本次文档的信息分类，未宣称为官方品牌规范。中英文共用图形、主题/卡片/异常编号；文内引用“节”，不受合并后的物理页码影响。

## 编辑与重新生成

中文内容和公共版式主源：[build_guide.py](build_guide.py)。英文内容与双语合成：[build_bilingual.py](build_bilingual.py)。Markdown为同步导出的文字审阅稿；修改后需同步到对应Python源，避免重新生成时被覆盖。

依赖 Python 3、reportlab、pypdf。中文默认使用macOS STHeiti；其他环境用 `YOUFEED_FONT_REGULAR` 和 `YOUFEED_FONT_BOLD` 指定可嵌入中文TTF/TTC。从仓库根目录运行：

```sh
python3 docs/field-guide/build_bilingual.py
```

三份最终PDF位于 `output/pdf/`。单语言中间稿位于Git忽略的 `artifacts/field-guide-build/`；视觉检查图和初稿保留于 `artifacts/field-guide-qa/`。重新生成后需渲染并逐页查看，不能以脚本通过代替视觉检查。

第03节复用现有R7截图，仅在版面中裁去源截图右侧和底部的空白，保留演示提示和全部可见应用内容；未改原截图。

## 现场使用前

负责人填写02区域核对单与08配置，确认拟定规则、真实完成提示和安全重试条件。当前演示不录音、不投递、刷新清空草稿；它不能代替真实系统行为。入口、活动与产品名、负责人、匿名性、数据保存和接收机制仍需确认。

作品集优先截取02、04、05–06主题，统一标注“依据项目经历重建，2026”。

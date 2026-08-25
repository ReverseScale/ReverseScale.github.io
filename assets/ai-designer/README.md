# AI Designer 页面素材来源

本目录只保存 AI Designer 项目介绍页使用、可公开追溯的正式素材，不包含临时 Mock 或调试产物。

## Flutter Golden 基线

四张 PNG 来自相邻 `ai-designer` 仓库中已提交的固定 Linux / Flutter 3.24.5 Golden 基线：

- `design-button-state-matrix-light.png`：`DesignButton` Light State Matrix。
- `design-text-field-state-matrix-dark.png`：`DesignTextField` Dark State Matrix。
- `design-status-badge-state-matrix-light.png`：`DesignStatusBadge` Light State Matrix。
- `design-empty-state-interactive-light.png`：`DesignEmptyState` Light Interactive Use Case。

页面将它们作为“真实审查制品”展示，而不是把静态图片描述为可交互 Widgetbook。

## 字体

`fonts/WorkSans-Variable.ttf` 来自 `ai-designer/design_assets_flutter` 的已审计字体资产；许可原文保存在 `fonts/OFL.txt`。页面通过本地 `@font-face` 使用该字体，不依赖第三方 CDN。

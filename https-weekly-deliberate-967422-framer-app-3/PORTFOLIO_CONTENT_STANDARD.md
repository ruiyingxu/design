# Ruiying Portfolio Content Standard

## 1) 字段规范（单项目）

每个项目至少应包含：
- `href`: 详情页路径
- `title`: 标题
- `category`: `works` 或 `product-design`
- `contentStatus`: `complete | basic | pending`
- `requiredSections`: `角色 / 方法 / 产出 / 反思 / 结果`
- `tags`: 项目标签（用于筛选与检索）
- `homeMeta`: 首页展示文案
- `listingMeta`: 列表页展示文案
- `moreMeta`: 「More Projects」类卡片文案
- `related`: 相关推荐 id 列表

## 2) 分类规则（展示策略）

- `works`
  - 作品向：品牌、视觉、环境、展示型项目
  - 目前映射：`forma`, `museumOfTechnology`

- `product-design`
  - 产品与系统向：服务设计、AI 产品、交互探索
  - 目前映射：`nowAssist`, `aiControlTower`, `dwHeader`, `columnPinning`, `sheepguard`, `allerpal`

- `homeFeatured`
  - 首页精选展示：按照顺序混合 `works` 与 `product-design` 的策略性组合
  - 顺序：
    1. `forma`
    2. `dwHeader`
    3. `nowAssist` + `aiControlTower`（双栏 pair）
    4. `columnPinning`
    5. `sheepguard`
    6. `allerpal`

## 3) 内容完整度分级

- `complete`：已完成：字段与页面结构齐全
- `basic`：基础版：关键信息有，但部分二级结构待补
- `pending`：待补：缺少必要结构或标准字段

### 当前分级快照
- complete：`forma`, `nowAssist`, `aiControlTower`, `allerpal`
- basic：`dwHeader`, `columnPinning`, `sheepguard`, `museumOfTechnology`

## 4) 运行时对齐方式

- `index.html`：使用 `project-collection` + `source="homeFeatured"`
- `works.html`：使用 `project-collection` + `source="works"`
- `product-designs.html`：使用 `project-collection` + `source="productDesigns"`
- `script.js` 中统一消费 `window.PORTFOLIO_COLLECTIONS` 与 `window.PORTFOLIO_PROJECTS`

# 徽墨制作技艺 · 专题站

一个**零前端框架、零运行时依赖**的静态站点，介绍徽墨制作的六道工序与三种墨锭案例。

## 页面

| 页面 | 路径 |
| --- | --- |
| 首页（工艺流程 / 图说 / 案例入口） | `index.html` |
| 原料 | `pages/yuanliao.html` |
| 制烟 | `pages/zhiyan.html` |
| 和胶 | `pages/hejiao.html` |
| 捶打 | `pages/chuida.html` |
| 晾墨 | `pages/liangmo.html` |
| 题款 | `pages/tikuan.html` |
| 墨锭案例（含详情：放大图片 + 文字说明） | `pages/cases.html` |

## 本地运行

```bash
npm start          # http://localhost:8123 （零依赖 Node 静态服务器）
# 或任意静态服务器，如： python3 -m http.server 8000
npm run check      # 构建检查（Node >= 18）
```

## 构建检查（`tools/check-build.mjs`）

零依赖脚本，递归检查全部 HTML：

1. **相对资源**：每个 `href` / `src`（相对路径）指向的文件必须存在；
2. **无效锚点**：`#id` 与跨页 `page.html#id` 必须在目标页面真实存在；
3. **内容版本**：每页 `<meta name="content-version">` 必须与
   `assets/js/data.js` 中的 `VERSION` 一致；
4. 数据层引用的图片全部存在；章节 `slug` 与 `pages/*.html` 一一对应；案例 id 有锚点块；
5. 质量项：`img` 的 `alt`、`id="main"` 跳转目标、静态降级导航、禁止引用任何前端框架/CDN。

发现错误时退出码为 `1`，可直接用于 CI。

## 数据驱动

`assets/js/data.js` 是唯一内容数据源（章节、小节正文、图集、墨锭案例）。

- **章节导航**：顶部导航、首页工艺流程、工序页目录均由数据渲染；
- **图片灯箱**：`data-gallery="slug"` 容器与案例详情的图集按数据组注册到灯箱；
- 所有数据驱动区域都有**等价的静态 HTML 降级**：不启用 JavaScript 时，
  页面仍是完整图文长文，图片用普通链接打开。

## 滚动出现、灯箱与动效控制

- `IntersectionObserver` 驱动 `.reveal` 元素柔和上浮淡入；
- 滚动观察器**可取消**：`HUIMO.cancelReveal()`（或 `HUIMO_REVEAL.cancel()`）
  立即断开观察器并显示全部内容；导航栏“减弱动效”按钮可随时切换并记住选择；
- 同时遵循系统 **`prefers-reduced-motion`**：无观察器、无过渡，全部内容直接呈现；
- 灯箱支持键盘（Esc 关闭、←/→ 切换）、点击图片放大并跟随鼠标变换放大中心、焦点归还。

## 旧浏览器文本降级

`assets/js/loader.js` 在 `<head>` 最早执行能力检测
（`querySelector` / `addEventListener` / `classList`）。能力不足时 `<html>` 加
`.legacy`，所有增强脚本短路，`.legacy` CSS 将灯箱区域还原为普通图文流式排版；
无 JS 时显示页首提示条与文本导航，内容本身完整可读。站点脚本全部为 ES5 语法。

## 目录结构

```
index.html
pages/                 六道工序页 + cases.html
assets/css/styles.css  唯一样式表
assets/js/             loader / data / ui / lightbox / detail / reveal
assets/img/            手工 SVG 水墨风格插图（无外部引用）
tools/                 check-build.mjs 构建检查、serve.mjs 本地预览
```

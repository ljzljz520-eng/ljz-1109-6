#!/usr/bin/env node
/**
 * 徽墨专题站 · 构建检查脚本（零依赖，Node >= 18）
 *
 * 检查项：
 *  1. 相对资源引用（href/src）指向的文件必须存在
 *  2. 内部锚点：#id 必须在本页（跨页链接的锚点须在目标页）存在
 *  3. 内容版本：每个页面 <meta name="content-version"> 必须存在且与
 *     assets/js/data.js 的 version 一致
 *  4. 数据层引用的图片资源全部存在；六个章节页与数据 slug 一一对应
 *  5. 质量项：img alt、main 锚点目标、静态降级导航存在、未引用前端框架
 *
 * 退出码：发现错误为 1，否则 0。
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------- 收集 HTML 文件 ---------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}
const htmlFiles = walk(ROOT).map((p) => ({ path: p, rel: relative(ROOT, p), html: readFileSync(p, 'utf8') }));

/* ---------- 读取数据层版本 ---------- */
const dataSrc = readFileSync(join(ROOT, 'assets/js/data.js'), 'utf8');
const dataVersion = (dataSrc.match(/var\s+VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];
if (!dataVersion) err('assets/js/data.js 中找不到 VERSION 定义');

/* ---------- 每页面提取 id、链接、资源、版本 ---------- */
const idSet = new Map(); // rel page -> Set(ids)
const pageIndex = new Map(htmlFiles.map((f) => [f.rel, f]));

const ATTR_RE = /(?:href|src)\s*=\s*"([^"]*)"/g;
const ID_RE = /\bid\s*=\s*"([^"]+)"/g;
const META_VER_RE = /<meta[^>]+name\s*=\s*"content-version"[^>]*content\s*=\s*"([^"]+)"|<meta[^>]+content\s*=\s*"([^"]+)"[^>]*name\s*=\s*"content-version"/;
const FRAMEWORK_RE = /(?:cdn\.(?:jsdelivr|unpkg)|react|vue|angular|jquery|bootstrap(?:\.min)?\.(?:js|css))/i;
const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ALT_RE = /\balt\s*=\s*"[^"]*"/;

/* 第一遍：收集所有页面 id */
for (const f of htmlFiles) {
  const ids = new Set();
  let m;
  while ((m = ID_RE.exec(f.html))) ids.add(m[1]);
  idSet.set(f.rel, ids);
}

/* 第二遍：资源 / 锚点 / 版本 / 质量项 */
for (const f of htmlFiles) {
  const ids = idSet.get(f.rel);

  /* 版本 */
  const vm = f.html.match(META_VER_RE);
  const pageVer = vm ? (vm[1] || vm[2]) : null;
  if (!pageVer) err(`[版本] ${f.rel}：缺少 <meta name="content-version">`);
  else if (dataVersion && pageVer !== dataVersion)
    err(`[版本] ${f.rel}：版本 ${pageVer} 与数据层版本 ${dataVersion} 不一致`);

  /* main 与 skip link */
  if (!f.html.includes('id="main"')) err(`[结构] ${f.rel}：缺少 id="main"（跳转链接目标）`);
  if (!/data-nav/.test(f.html)) warn(`[降级] ${f.rel}：未发现静态章节导航 data-nav`);
  if (FRAMEWORK_RE.test(f.html)) err(`[框架] ${f.rel}：检测到前端框架/CDN 引用，本站要求无框架`);

  /* img alt */
  let im;
  while ((im = IMG_TAG_RE.exec(f.html))) {
    if (!ALT_RE.test(im[0])) err(`[可访问性] ${f.rel}：img 缺少 alt：${im[0].slice(0, 80)}`);
  }

  /* 资源 + 锚点 */
  let a;
  ATTR_RE.lastIndex = 0;
  while ((a = ATTR_RE.exec(f.html))) {
    let url = a[1];
    if (!url || url.startsWith('#') === false && (url.includes('://') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:'))) {
      continue;
    }
    const [pathPart, hashPart] = splitHash(url);
    const dir = dirname(f.path);

    if (pathPart) {
      const target = resolve(dir, pathPart);
      if (!existsSync(target)) {
        err(`[资源] ${f.rel}：相对资源不存在 -> ${url}`);
      }
    }

    if (hashPart) {
      let targetPageRel = f.rel;
      if (pathPart) {
        const targetAbs = resolve(dir, pathPart);
        targetPageRel = relative(ROOT, targetAbs).split('\\').join('/');
      }
      const targetIds = idSet.get(targetPageRel);
      if (targetIds && !targetIds.has(hashPart)) {
        err(`[锚点] ${f.rel}：无效锚点 -> ${url}（#${hashPart} 在 ${targetPageRel} 不存在）`);
      } else if (!targetIds && pathPart) {
        /* 目标可能是非 html 资源（如 .svg#frag），存在性已在上文检查 */
      } else if (!pathPart && !ids) {
        err(`[锚点] ${f.rel}：无法校验锚点 ${url}`);
      }
    }
  }
}

function splitHash(url) {
  const i = url.indexOf('#');
  if (i === -1) return [url, ''];
  return [url.slice(0, i), url.slice(i + 1)];
}

/* ---------- 数据层资源与章节页 ---------- */
/* 用正则提取数据层中所有 src 引用，避免把整份脚本当 JSON 解析 */
const dataAssets = new Set();
const SRC_IN_DATA = /(?:src|image|thumb)\s*:\s*'([^']+)'/g;
let dm;
while ((dm = SRC_IN_DATA.exec(dataSrc))) dataAssets.add(dm[1]);
for (const asset of dataAssets) {
  if (asset.includes('://')) continue;
  if (!existsSync(join(ROOT, asset))) err(`[数据] 数据层引用的资源不存在：${asset}`);
}

/* slug -> pages/<slug>.html */
const slugs = Array.from(dataSrc.matchAll(/slug:\s*'([^']+)'/g)).map((x) => x[1]);
for (const slug of slugs) {
  if (!existsSync(join(ROOT, 'pages', `${slug}.html`)))
    err(`[数据] 章节 slug "${slug}" 缺少对应页面 pages/${slug}.html`);
}
for (const f of htmlFiles) {
  if (f.rel.startsWith('pages/') && f.rel !== 'pages/cases.html') {
    const slug = f.rel.replace('pages/', '').replace('.html', '');
    if (!slugs.includes(slug)) warn(`[数据] 页面 ${f.rel} 未出现在数据层章节中`);
  }
}

/* 案例 id 与 cases.html 中的锚点块 */
const caseIds = Array.from(dataSrc.matchAll(/id:\s*'([a-z0-9-]+)',\s*\n\s*name/g)).map((x) => x[1]);
const casesPage = pageIndex.get('pages/cases.html');
if (casesPage) {
  for (const id of caseIds) {
    if (!idSet.get('pages/cases.html').has(id))
      err(`[数据] 案例 id "${id}" 在 cases.html 中缺少对应锚点块`);
  }
}

/* ---------- 输出 ---------- */
const pad = (s) => `  ${s}`;
console.log(`徽墨专题站构建检查`);
console.log(`HTML 页面：${htmlFiles.length} · 数据版本：${dataVersion || '?'}`);
if (warnings.length) {
  console.log(`\n警告 ${warnings.length}：`);
  warnings.forEach((w) => console.log(pad('⚠ ' + w)));
}
if (errors.length) {
  console.log(`\n错误 ${errors.length}：`);
  errors.forEach((e) => console.log(pad('✗ ' + e)));
  console.log(`\n检查未通过。`);
  process.exit(1);
}
console.log(`\n✓ 相对资源、内部锚点、内容版本、数据层引用全部检查通过。`);
process.exit(0);

/* loader.js —— <head> 中最早执行
 * 1. 能力检测：旧浏览器打上 .legacy 标记，全站进入文本降级，不加载任何增强逻辑
 * 2. 动效偏好：读取 localStorage 显式选择与系统 prefers-reduced-motion
 * 纯 ES5，不依赖任何其他脚本。
 */
(function (global, doc) {
  'use strict';

  var rootEl = doc.documentElement;

  /* 去除 no-js，标记 js */
  rootEl.className = rootEl.className.replace(/\bno-js\b/, '') + ' js';

  function hasStorage() {
    try {
      return 'localStorage' in global && !!global.localStorage;
    } catch (e) { return false; }
    }

  /* 完整增强所需最低能力：选择器、事件、classList */
  var capable = !!(doc.querySelector && global.addEventListener && rootEl.classList);

  var HUIMO = {
    legacy: !capable,
    root: rootEl.getAttribute('data-root') || '.',
    page: rootEl.getAttribute('data-page') || '',
    storage: hasStorage(),
    MOTION_KEY: 'huimo-motion',
    motionEnabled: true
  };

  HUIMO.store = function (key, value) {
    if (!HUIMO.storage) { return; }
    try { global.localStorage.setItem(key, value); } catch (e) {}
  };
  HUIMO.read = function (key) {
    if (!HUIMO.storage) { return null; }
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  };

  if (HUIMO.legacy) {
    /* 旧浏览器：文本降级。加一个类名，其余脚本各自短路。 */
    rootEl.className += ' legacy';
    global.HUIMO = HUIMO;
    return;
  }

  /* ---------- 动效开关 ---------- */
  var mq = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
  HUIMO.osReduced = !!(mq && mq.matches);

  var stored = HUIMO.read(HUIMO.MOTION_KEY); /* 'on' | 'off' | null */
  HUIMO.motionEnabled = stored !== null ? (stored === 'on') : !HUIMO.osReduced;

  HUIMO.applyMotionClass = function () {
    rootEl.classList.toggle('motion-off', !HUIMO.motionEnabled);
  };
  HUIMO.applyMotionClass();

  /* ---------- 通用小工具（ES5） ---------- */
  HUIMO.qs = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  HUIMO.qsa = function (sel, ctx) {
    var list = (ctx || doc).querySelectorAll(sel);
    return Array.prototype.slice.call(list);
  };
  HUIMO.on = function (el, type, fn, opts) {
    if (el && el.addEventListener) { el.addEventListener(type, fn, opts || false); }
  };

  /* 数据中的路径均为相对站点根目录（如 pages/x.html、assets/img/y.svg）。
   * 依据 <html data-root> 换算成相对当前页面的路径：
   * 首页 data-root="."；子页 data-root=".."。 */
  HUIMO.resolve = function (p) {
    if (!p) { return p; }
    if (p.charAt(0) === '/' || /^[a-z]+:/.test(p)) { return p; }
    var base = HUIMO.root === '.' ? '' : HUIMO.root;
    p = p.replace(/^\.\//, '');
    return base ? (base + '/' + p) : p;
  };

  HUIMO.ready = function (fn) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  };

  HUIMO.escapeHTML = function (s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };

  global.HUIMO = HUIMO;
})(window, document);

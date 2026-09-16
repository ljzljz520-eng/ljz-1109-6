/* reveal.js —— 滚动时内容柔和出现
 * - IntersectionObserver 观察 .reveal，进入视口加 .is-visible
 * - 观察器可取消：HUIMO_REVEAL.cancel() / HUIMO.cancelReveal() 立即停用并全部显示
 * - prefers-reduced-motion（系统或用户经开关取消）时不做入场动画
 * - 无 IntersectionObserver 的旧环境：一次性全部显示（文本降级的一部分）
 */
(function (global) {
  'use strict';
  var H = global.HUIMO;
  if (!H || H.legacy) { return; }
  var doc = document;

  var observer = null;
  var cancelled = false;
  var bound = [];

  function markVisible(el) {
    if (el) { el.classList.add('is-visible'); }
  }

  function showAll() {
    H.qsa('.reveal').forEach(markVisible);
  }

  function scan() {
    if (cancelled) { showAll(); return; }
    var els = H.qsa('.reveal:not([data-reveal-bound])');

    /* 系统减弱动效，或用户已取消动效：不观察，直接就位 */
    if (!H.motionEnabled || H.osReduced || !('IntersectionObserver' in global)) {
      els.forEach(markVisible);
      els.forEach(function (el) { el.setAttribute('data-reveal-bound', 'static'); });
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    }

    els.forEach(function (el) {
      el.setAttribute('data-reveal-bound', 'io');
      bound.push(el);
      observer.observe(el);
    });
  }

  /* 可取消的滚动观察器：停止观察并让内容立即全部出现 */
  function cancel() {
    cancelled = true;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    showAll();
  }

  /* 立即监听：ui.js 可能在同一个 DOMContentLoaded 轮次内先派发事件 */
  doc.addEventListener('huimo:rendered', scan);
  H.ready(scan);

  global.HUIMO_REVEAL = { scan: scan, cancel: cancel };
  H.cancelReveal = cancel;
})(window);

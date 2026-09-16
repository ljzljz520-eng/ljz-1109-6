/* ui.js —— 数据驱动渲染：章节导航、工艺流程、章节目录、灯箱图集、案例列表
 * 旧浏览器（HUIMO.legacy）整体短路，使用页面中的静态文本降级内容。
 */
(function (global) {
  'use strict';
  var H = global.HUIMO, D = global.HUIMO_DATA;
  if (!H || H.legacy || !D) { return; }
  var doc = document, esc = H.escapeHTML, R = H.resolve;

  /* ---------- 顶部章节导航 ---------- */
  function currentSlug() {
    var m = location.pathname.match(/([^\/]+)\.html$/);
    var file = m ? m[1] : 'index';
    if (file === 'index' || file === 'cases') { return file; }
    return file; /* 与 chapter.slug 一致 */
  }

  function renderNav() {
    var host = H.qs('[data-nav]');
    if (!host) { return; }
    var cur = currentSlug();
    var h = '';
    for (var i = 0; i < D.chapters.length; i++) {
      var c = D.chapters[i];
      var curAttr = (c.slug === cur) ? ' aria-current="page"' : '';
      h += '<li><a href="' + esc(R(c.page)) + '"' + curAttr + '>' + esc(c.name) + '</a></li>';
    }
    host.innerHTML = h;
  }

  /* ---------- 首页：工艺流程（数据驱动章节导航） ---------- */
  function renderProcess() {
    var host = H.qs('[data-process]');
    if (!host) { return; }
    var h = '';
    for (var i = 0; i < D.chapters.length; i++) {
      var c = D.chapters[i];
      h += '<li class="reveal" style="transition-delay:' + (Math.min(i, 6) * 70) + 'ms">'
        + '<a href="' + esc(R(c.page)) + '">' + esc(c.name) + '</a>'
        + '<span class="sub">' + esc(c.subtitle) + '</span>'
        + '<p>' + esc(c.lead.slice(0, 42)) + '……</p></li>';
    }
    host.innerHTML = h;
  }

  /* ---------- 工序页：章节目录 ---------- */
  function findChapter() {
    var slug = currentSlug();
    for (var i = 0; i < D.chapters.length; i++) {
      if (D.chapters[i].slug === slug) { return { c: D.chapters[i], idx: i }; }
    }
    return null;
  }

  function renderToc(c) {
    var host = H.qs('[data-toc]');
    if (!host) { return; }
    var h = '<h2>本页目录</h2><ol>';
    for (var i = 0; i < c.sections.length; i++) {
      h += '<li><a href="#' + esc(c.sections[i].id) + '">' + esc(c.sections[i].title) + '</a></li>';
    }
    h += '</ol>';
    host.innerHTML = h;
  }

  /* ---------- 图集（数据驱动灯箱） ----------
   * 容器：<div data-gallery="chapter-slug"></div>
   * 同时向全局灯箱注册图片组。 */
  function registerGallery(key, images) {
    if (global.HUIMO_LIGHTBOX && HUIMO_LIGHTBOX.register) {
      HUIMO_LIGHTBOX.register(key, images);
    }
  }

  function renderGalleries() {
    H.qsa('[data-gallery]').forEach(function (host) {
      var key = host.getAttribute('data-gallery');
      var images = null;
      if (key === 'home') {
        images = [
          { src: 'assets/img/hero.svg', alt: '水墨远山与徽墨', caption: '墨出黄山，一锭成于万火千捶' },
          { src: 'assets/img/soot.svg', alt: '卧窑制烟', caption: '制烟：卧窑闷烧，守候烟炱' }
        ];
      } else {
        for (var i = 0; i < D.chapters.length; i++) {
          if (D.chapters[i].slug === key) { images = D.chapters[i].images; break; }
        }
      }
      if (!images || !images.length) { return; }
      registerGallery(key, images);
      var h = '<div class="gallery">';
      images.forEach(function (im, idx) {
        h += '<figure class="shot reveal">'
          + '<button type="button" class="lb-open" data-lb="' + esc(key) + '" data-index="' + idx + '"'
          + ' aria-label="放大查看：' + esc(im.alt) + '">'
          + '<img src="' + esc(R(im.src)) + '" alt="' + esc(im.alt) + '" loading="lazy"></button>'
          + '<figcaption>' + esc(im.caption || im.alt) + '</figcaption></figure>';
      });
      host.innerHTML = h + '</div>';
    });
  }

  /* ---------- 案例列表 ---------- */
  function renderCases() {
    var host = H.qs('[data-cases]');
    if (!host) { return; }
    var h = '';
    D.cases.forEach(function (item, i) {
      var href = R('pages/cases.html') + '#' + encodeURIComponent(item.id);
      h += '<a class="case-card reveal" style="transition-delay:' + (i * 70) + 'ms" href="' + esc(href) + '">'
        + '<span class="thumb"><img src="' + esc(R(item.image)) + '" alt="' + esc(item.name) + '" loading="lazy"></span>'
        + '<span class="body"><h2>' + esc(item.name) + '</h2>'
        + '<span class="tag">' + esc(item.tagline) + '</span>'
        + '<p>' + esc(item.summary) + '</p>'
        + '<span class="more">查看详情 →</span></span></a>';
    });
    host.innerHTML = h;
  }

  /* ---------- 动效开关按钮 ---------- */
  function wireMotionToggle() {
    var btn = H.qs('[data-motion-toggle]');
    if (!btn) { return; }
    btn.hidden = false;
    function label() {
      btn.textContent = H.motionEnabled ? '减弱动效' : '恢复动效';
      btn.setAttribute('aria-pressed', String(!H.motionEnabled));
      btn.title = '立即取消或恢复滚动出现动画';
    }
    label();
    H.on(btn, 'click', function () {
      H.motionEnabled = !H.motionEnabled;
      H.store(H.MOTION_KEY, H.motionEnabled ? 'on' : 'off');
      H.applyMotionClass();
      label();
      /* 若当前已无可见动画，直接把所有 reveal 就位，避免停在半透明状态 */
      if (!H.motionEnabled) {
        H.qsa('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      } else {
        H.qsa('.reveal:not(.is-visible)').forEach(function (el) {
          el.style.transitionDelay = '0ms';
        });
      }
    });
  }

  H.ready(function () {
    var info = findChapter();
    renderNav();
    renderProcess();
    if (info) { renderToc(info.c); }
    renderGalleries();
    renderCases();
    wireMotionToggle();

    var banner = H.qs('[data-nojs]');
    if (banner) { banner.parentNode.removeChild(banner); }

    /* 通知其他模块：数据渲染完成，可扫描 .reveal / 绑定灯箱 */
    doc.dispatchEvent(new global.CustomEvent('huimo:rendered'));
  });
})(window);

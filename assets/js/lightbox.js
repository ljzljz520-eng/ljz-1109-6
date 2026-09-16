/* lightbox.js —— 数据驱动图片灯箱
 * - 图片组由 ui.js（章图集）与 detail.js（案例图集）注册
 * - 任意带 data-lb="组key" data-index="n" 的元素均可触发
 * - 支持上一张/下一张、Esc 关闭、点击放大与复位、焦点归还
 * - prefers-reduced-motion 下不做缩放过渡（CSS 已处理）
 * - 旧浏览器 HUIMO.legacy 时不启用，图片以普通图文呈现（文本降级）
 */
(function (global) {
  'use strict';
  var H = global.HUIMO;
  if (!H || H.legacy) { return; }
  var doc = document, R = H.resolve, esc = H.escapeHTML;

  var groups = {};     /* key -> [{src,alt,caption}] */
  var state = { key: null, index: 0, zoomed: false, lastTrigger: null };

  var box, imgEl, captionEl, countEl, wrapEl;

  function buildLightbox() {
    box = doc.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '图片灯箱');
    box.hidden = true;
    box.innerHTML =
      '<div class="lightbox-frame">'
      + '<button type="button" class="lb-btn lb-close" aria-label="关闭灯箱 (Esc)">×</button>'
      + '<button type="button" class="lb-btn lb-prev" aria-label="上一张">‹</button>'
      + '<button type="button" class="lb-btn lb-next" aria-label="下一张">›</button>'
      + '<button type="button" class="lb-btn lb-zoom" aria-label="放大或复位图片">放大</button>'
      + '<div class="lightbox-img-wrap"><img class="lb-img" alt=""></div>'
      + '<p class="lb-caption"></p>'
      + '<div class="lb-count"></div>'
      + '</div>';
    doc.body.appendChild(box);

    wrapEl = H.qs('.lightbox-img-wrap', box);
    imgEl = H.qs('.lb-img', box);
    captionEl = H.qs('.lb-caption', box);
    countEl = H.qs('.lb-count', box);

    H.on(H.qs('.lb-close', box), 'click', close);
    H.on(H.qs('.lb-prev', box), 'click', function () { move(-1); });
    H.on(H.qs('.lb-next', box), 'click', function () { move(1); });
    H.on(H.qs('.lb-zoom', box), 'click', function (e) { e.stopPropagation(); toggleZoom(); });

    /* 点击图片：放大/复位；随鼠标改变放大中心 */
    H.on(imgEl, 'click', toggleZoom);
    H.on(imgEl, 'mousemove', function (e) {
      if (!state.zoomed) { return; }
      var r = imgEl.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      imgEl.style.transformOrigin = x + '% ' + y + '%';
    });

    /* 点击遮罩空白处关闭 */
    H.on(box, 'click', function (e) {
      if (e.target === box || e.target === wrapEl) { close(); }
    });
  }

  function currentGroup() { return groups[state.key] || []; }

  function render() {
    var g = currentGroup();
    var im = g[state.index];
    if (!im) { close(); return; }
    state.zoomed = false;
    imgEl.classList.remove('is-zoomed');
    imgEl.style.transformOrigin = 'center center';
    imgEl.src = R(im.src);
    imgEl.alt = im.alt || '';
    captionEl.textContent = im.caption || im.alt || '';
    countEl.textContent = (state.index + 1) + ' / ' + g.length;
  }

  function open(key, index, trigger) {
    if (!groups[key]) { return; }
    state.key = key;
    state.index = index || 0;
    state.lastTrigger = trigger || doc.activeElement;
    box.hidden = false;
    box.classList.add('is-open');
    render();
    H.qs('.lb-close', box).focus();
    doc.documentElement.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('is-open');
    box.hidden = true;
    doc.documentElement.style.overflow = '';
    if (state.lastTrigger && state.lastTrigger.focus) { state.lastTrigger.focus(); }
    state.lastTrigger = null;
  }

  function move(delta) {
    var g = currentGroup();
    if (!g.length) { return; }
    state.index = (state.index + delta + g.length) % g.length;
    render();
  }

  function toggleZoom() {
    state.zoomed = !state.zoomed;
    imgEl.classList.toggle('is-zoomed', state.zoomed);
    var z = H.qs('.lb-zoom', box);
    z.textContent = state.zoomed ? '复位' : '放大';
    z.setAttribute('aria-pressed', String(state.zoomed));
  }

  H.on(doc, 'keydown', function (e) {
    if (!box || box.hidden) { return; }
    if (e.key === 'Escape' || e.keyCode === 27) { close(); }
    else if (e.key === 'ArrowRight' || e.keyCode === 39) { move(1); }
    else if (e.key === 'ArrowLeft' || e.keyCode === 37) { move(-1); }
  });

  /* 事件委托：动态渲染的触发按钮也无需重新绑定 */
  H.ready(function () {
    buildLightbox();
    doc.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== doc && !t.getAttribute) { t = t.parentNode; }
      if (!t || !t.getAttribute) { return; }
      var key = t.getAttribute('data-lb');
      if (key) {
        e.preventDefault();
        open(key, parseInt(t.getAttribute('data-index'), 10) || 0, t);
      }
    });
  });

  global.HUIMO_LIGHTBOX = {
    register: function (key, images) { groups[key] = images; },
    open: open
  };
})(window);

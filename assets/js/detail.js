/* detail.js —— 案例详情
 * cases.html 静态包含全部案例（无 JS / 旧浏览器即“长文文本降级”）。
 * 启用 JS 且带 #案例id 时：只显示该案例，主图可点开灯箱，缩略图切换。
 */
(function (global) {
  'use strict';
  var H = global.HUIMO, D = global.HUIMO_DATA;
  if (!H || H.legacy || !D) { return; }
  var doc = document, esc = H.escapeHTML, R = H.resolve;

  var caseHost = H.qs('[data-case-detail]');
  if (!caseHost) { return; }

  var blocks = H.qsa('.case-block', caseHost);
  var singleTitle = H.qs('[data-case-title]');
  var singleCrumb = H.qs('[data-case-crumb]');
  var listHeading = H.qs('[data-case-list-heading]');

  function byId(id) {
    for (var i = 0; i < D.cases.length; i++) {
      if (D.cases[i].id === id) { return D.cases[i]; }
    }
    return null;
  }

  function wireBlock(block, item) {
    var stageBtn = H.qs('[data-stage-btn]', block);
    var stageImg = H.qs('[data-stage-img]', block);
    var stageCap = H.qs('[data-stage-cap]', block);
    var thumbs = H.qsa('[data-thumb]', block);

    /* 注册该案例的完整图集给灯箱 */
    if (global.HUIMO_LIGHTBOX) { HUIMO_LIGHTBOX.register('case-' + item.id, item.gallery); }

    function showAt(i) {
      var im = item.gallery[i];
      if (!im) { return; }
      stageImg.src = R(im.src);
      stageImg.alt = im.alt;
      if (stageCap) { stageCap.textContent = im.caption || im.alt; }
      if (stageBtn) {
        stageBtn.setAttribute('data-lb', 'case-' + item.id);
        stageBtn.setAttribute('data-index', String(i));
      }
      thumbs.forEach(function (b) {
        b.setAttribute('aria-current', String(parseInt(b.getAttribute('data-thumb'), 10) === i));
      });
    }

    thumbs.forEach(function (b) {
      H.on(b, 'click', function () {
        showAt(parseInt(b.getAttribute('data-thumb'), 10) || 0);
      });
    });

    showAt(0);
  }

  blocks.forEach(function (block) {
    var item = byId(block.getAttribute('data-case'));
    if (!item) { return; }
    /* 先给主图按钮打上灯箱组标记，再执行首次 showAt */
    var btn0 = H.qs('[data-stage-btn]', block);
    if (btn0) { btn0.setAttribute('data-lb', 'case-' + item.id); }
    wireBlock(block, item);
  });

  function applyMode() {
    var hash = decodeURIComponent(location.hash || '').replace(/^#/, '');
    var item = hash ? byId(hash) : null;

    if (item) {
      blocks.forEach(function (b) {
        b.hidden = (b.getAttribute('data-case') !== item.id);
      });
      if (listHeading) { listHeading.hidden = true; }
      if (singleTitle) {
        singleTitle.textContent = item.name;
        singleTitle.hidden = false;
      }
      if (singleCrumb) {
        singleCrumb.innerHTML = '<a href="' + esc(R('pages/cases.html')) + '">案例</a> / ' + esc(item.name);
      }
      doc.title = item.name + ' · 徽墨制作技艺';
    } else {
      blocks.forEach(function (b) { b.hidden = false; });
      if (listHeading) { listHeading.hidden = false; }
      if (singleTitle) { singleTitle.hidden = true; }
      if (singleCrumb) {
        singleCrumb.innerHTML = '<a href="' + esc(R('index.html')) + '">首页</a> / 案例';
      }
    }
  }

  H.ready(applyMode);
  global.addEventListener('hashchange', applyMode);
})(window);

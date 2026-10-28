// ── 入力値の保存と復元 ────────────────────────────────────────────
// 2026-10-28 追加。AdSense 3回目の落選（理由はいずれも「有用性の低いコンテンツ」）の
// あと、GA4で新規ユーザー96.9%・リピーター13人・1.35ページ/セッションという定着率が
// 主因と判断したため。計算ツールは「前回入れた数字が残っている」ことが再訪の理由になる。
//
// 動作：ツールページの入力値を localStorage に保存し、次に開いたときに復元する。
//       復元したら小さなバナーを出し、1クリックで初期値に戻せるようにする。
//
// 対象は id を持つ number / range / checkbox / select のみ。
// oco-calc の動的生成 input（.pct-input・id無し）は対象外。
//
// 注意：localStorage はプライベートウィンドウやサイトデータ拒否の設定で
//       読み書きそのものが例外を投げる。全ての読み書きを try/catch で囲む。
(function () {
  'use strict';

  var KEY = 'mt:inputs:' + location.pathname;
  // range は対象外。investment-sim はスライダーと数値入力が双方向連動していて、
  // range に input を飛ばすと num.value = range.value で数値側が上書きされる
  // （num に range の範囲外を入れていた場合、clamp された値に戻ってしまう）。
  // num 側を復元すれば range は num の input リスナーが同期してくれる。
  var SEL = 'input[type="number"][id], input[type="checkbox"][id], select[id]';

  function store(method, value) {
    try {
      if (method === 'get') return localStorage.getItem(KEY);
      if (method === 'set') return localStorage.setItem(KEY, value);
      if (method === 'del') return localStorage.removeItem(KEY);
    } catch (e) {
      return null; // 使えない環境では保存機能ごと黙って無効になる
    }
  }

  function fields() {
    return Array.prototype.slice.call(document.querySelectorAll(SEL));
  }

  function valueOf(el) {
    return el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value;
  }

  function applyValue(el, v) {
    if (el.type === 'checkbox') el.checked = (v === '1');
    else el.value = v;
  }

  // 各ツールは input / change で自動計算する作りなので、復元後に発火させれば結果も戻る。
  // investment-sim だけは「計算する」ボタン方式なので、最後にそれを押す。
  function recalc(els) {
    els.forEach(function (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    var btn = document.getElementById('calc-btn');
    if (btn) btn.click();
  }

  function banner(onClear) {
    var box = document.createElement('div');
    box.className = 'restore-note';
    box.innerHTML =
      '<span>前回入力した内容を復元しました。</span>' +
      '<button type="button">入力をリセット</button>';
    box.querySelector('button').addEventListener('click', onClear);
    return box;
  }

  // タイトルと同じ階層に差し込む。構造がツールごとに違うので、
  // 最初の入力欄の祖先をたどって .page-title の兄弟レベルまで上がる。
  function insert(box, first) {
    var title = document.querySelector('.page-title');
    if (title && title.parentElement) {
      var el = first;
      while (el.parentElement && el.parentElement !== title.parentElement) el = el.parentElement;
      if (el.parentElement === title.parentElement) {
        el.parentElement.insertBefore(box, el);
        return;
      }
    }
    var block = first.closest('div, section, form');
    if (block && block.parentElement) block.parentElement.insertBefore(box, block);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var els = fields();
    if (!els.length) return; // 記事・固定ページでは何もしない

    // 復元前の初期値を覚えておく。リセットと「全部初期値なら保存しない」判定に使う。
    var defaults = {};
    els.forEach(function (el) { defaults[el.id] = valueOf(el); });

    var changed = false;
    var raw = store('get');
    if (raw) {
      try {
        var saved = JSON.parse(raw);
        els.forEach(function (el) {
          if (Object.prototype.hasOwnProperty.call(saved, el.id) && saved[el.id] !== valueOf(el)) {
            applyValue(el, saved[el.id]);
            changed = true;
          }
        });
      } catch (e) {
        store('del'); // 壊れた値が入っていたら捨てる
      }
    }

    if (changed) {
      recalc(els);
      // 復元が起きた＝そのツールに戻ってきた人。再訪の実数をこれで測る。
      // GA4管理画面で「キーイベント」に指定すると成果として集計できる（要手動設定）。
      if (typeof gtag === 'function') {
        gtag('event', 'input_restored', { page_path: location.pathname });
      }
      insert(banner(function () {
        store('del');
        els.forEach(function (el) { applyValue(el, defaults[el.id]); });
        recalc(els);
        var note = document.querySelector('.restore-note');
        if (note) note.remove();
      }), els[0]);
    }

    // 保存は入力が止まってから。初期値と全部同じなら保存せず消す。
    var timer = null;
    function save() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var data = {};
        var differs = false;
        els.forEach(function (el) {
          var v = valueOf(el);
          data[el.id] = v;
          if (v !== defaults[el.id]) differs = true;
        });
        if (differs) store('set', JSON.stringify(data));
        else store('del');
      }, 400);
    }

    els.forEach(function (el) {
      el.addEventListener('input', save);
      el.addEventListener('change', save);
    });
  });
})();

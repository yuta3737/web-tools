document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const headerNav = document.querySelector('.header-nav');
  if (!hamburger || !headerNav) return;

  // デスクトップナビのリンクをコピーしてモバイルナビを生成
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = headerNav.innerHTML;
  document.querySelector('.site-header').after(mobileNav);

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // リンクをタップしたら閉じる
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
});

// ── アフィリエイトリンクのクリック計測（GA4） ──────────────────────
// 2026-08-29 追加。Search Console/GA4 の分析で、アフィリエイト導線が
// 一切計測されていない（キーイベント0・収益0）ことが判明したため。
//
// .broker-cta クラス、または主要ASPドメインへのリンクのクリックを
// affiliate_click イベントとして送る。
// ※ GA4管理画面で「キーイベント」に指定すると成果として集計できる（要手動設定）。
const AFFILIATE_HOSTS = ['h.accesstrade.net', 'ad2.trafficgate.net'];

document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a');
  if (!a || !a.href) return;

  let host;
  try {
    host = new URL(a.href, location.href).hostname;
  } catch (err) {
    return;
  }

  const isAffiliate = a.classList.contains('broker-cta') || AFFILIATE_HOSTS.includes(host);
  if (!isAffiliate || typeof gtag !== 'function') return;

  gtag('event', 'affiliate_click', {
    link_url: a.href,
    link_domain: host,
    link_text: (a.textContent || '').trim().slice(0, 100),
    page_path: location.pathname
  });
}, true);

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

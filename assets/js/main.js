(function () {
  // Кнопка «бургер»: открыть/закрыть навигацию
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('#site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Подсветка активного пункта меню
  const path = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || href === location.pathname) {
      a.classList.add('active');
    }
  });
})();

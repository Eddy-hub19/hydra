document.addEventListener('DOMContentLoaded', () => {
  const swiperElement = document.querySelector('.hero-swiper');

  if (swiperElement && typeof Swiper !== 'undefined') {
    new Swiper('.hero-swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: '.swiper-custom-next',
        prevEl: '.swiper-custom-prev',
      },
    });
  }

  const hamburger = document.querySelector('.hamburger');
  const header = document.querySelector('.header');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMenu(forceOpen) {
    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !header.classList.contains('is-open');
    header.classList.toggle('is-open', isOpen);
    if (hamburger) hamburger.setAttribute('aria-expanded', String(isOpen));
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  }

  if (hamburger && header) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    // close when clicking outside header
    document.addEventListener('click', (e) => {
      if (header.classList.contains('is-open') && !header.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }
});

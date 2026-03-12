document.addEventListener('DOMContentLoaded', () => {
  const swiperInstances = new WeakMap();

  function getSwiperInlineOptions(swiperElement) {
    const rawOptions = swiperElement.getAttribute('data-swiper-options');

    if (!rawOptions) {
      return {};
    }

    try {
      const parsedOptions = JSON.parse(rawOptions);
      return parsedOptions && typeof parsedOptions === 'object' ? parsedOptions : {};
    } catch (error) {
      console.warn('Invalid data-swiper-options JSON:', swiperElement, error);
      return {};
    }
  }

  function getSwiperPresetOptions(swiperElement) {
    if (swiperElement.classList.contains('why-build-swiper')) {
      return {
        loop: true,
        spaceBetween: 24,
      };
    }

    if (swiperElement.classList.contains('hero-swiper')) {
      return {
        loop: true,
        spaceBetween: 16,
      };
    }

    return {};
  }

  function buildSwiperOptions(swiperElement) {
    const inlineOptions = getSwiperInlineOptions(swiperElement);
    const presetOptions = getSwiperPresetOptions(swiperElement);
    const nextEl = swiperElement.querySelector('.swiper-custom-next');
    const prevEl = swiperElement.querySelector('.swiper-custom-prev');

    const options = {
      slidesPerView: 1,
      speed: 550,
      watchOverflow: true,
      grabCursor: true,
      observer: true,
      observeParents: true,
      ...presetOptions,
      ...inlineOptions,
    };

    if (nextEl || prevEl) {
      const navigationOptions = {
        ...(options.navigation || {}),
      };

      if (nextEl) {
        navigationOptions.nextEl = nextEl;
      }

      if (prevEl) {
        navigationOptions.prevEl = prevEl;
      }

      options.navigation = navigationOptions;
    }

    return options;
  }

  function initSwiper(swiperElement) {
    if (!swiperElement || swiperInstances.has(swiperElement) || typeof Swiper === 'undefined') {
      return;
    }

    const options = buildSwiperOptions(swiperElement);
    const instance = new Swiper(swiperElement, options);
    swiperInstances.set(swiperElement, instance);
  }

  function initAllSwipers(root = document) {
    const swiperElements = root.querySelectorAll('.swiper');
    swiperElements.forEach((swiperElement) => initSwiper(swiperElement));
  }

  initAllSwipers();

  const swiperObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        if (node.matches('.swiper')) {
          initSwiper(node);
        }

        node.querySelectorAll('.swiper').forEach((swiperElement) => initSwiper(swiperElement));
      });
    });
  });

  swiperObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

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

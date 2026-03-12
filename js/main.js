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
    if (swiperElement.classList.contains('we-build-swiper')) {
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

    if (swiperElement.classList.contains('technologies-slider-swiper')) {
      return {
        loop: true,
        spaceBetween: 16,
      };
    }

    return {};
  }

  function findMappedNavigationButton(root, type, swiperId) {
    if (!root || !swiperId) {
      return null;
    }

    return root.querySelector(
      `.swiper-custom-${type}[data-swiper-for="${swiperId}"], .swiper-custom-${type}[aria-controls="${swiperId}"]`,
    );
  }

  function resolveNavigationElements(swiperElement) {
    const localNext = swiperElement.querySelector('.swiper-custom-next');
    const localPrev = swiperElement.querySelector('.swiper-custom-prev');

    if (localNext || localPrev) {
      return { nextEl: localNext, prevEl: localPrev };
    }

    const sectionRoot = swiperElement.closest('section');
    const swiperId = swiperElement.id || swiperElement.getAttribute('data-swiper-id');

    if (swiperId) {
      const scopedNext = findMappedNavigationButton(sectionRoot, 'next', swiperId);
      const scopedPrev = findMappedNavigationButton(sectionRoot, 'prev', swiperId);

      if (scopedNext || scopedPrev) {
        return { nextEl: scopedNext, prevEl: scopedPrev };
      }

      const globalNext = findMappedNavigationButton(document, 'next', swiperId);
      const globalPrev = findMappedNavigationButton(document, 'prev', swiperId);

      if (globalNext || globalPrev) {
        return { nextEl: globalNext, prevEl: globalPrev };
      }
    }

    if (!sectionRoot) {
      return { nextEl: null, prevEl: null };
    }

    // Fallback for a common layout where controls are outside .swiper but inside the same section.
    const externalNext = Array.from(sectionRoot.querySelectorAll('.swiper-custom-next')).find(
      (button) => !button.closest('.swiper'),
    );
    const externalPrev = Array.from(sectionRoot.querySelectorAll('.swiper-custom-prev')).find(
      (button) => !button.closest('.swiper'),
    );

    return { nextEl: externalNext || null, prevEl: externalPrev || null };
  }

  function buildSwiperOptions(swiperElement) {
    const inlineOptions = getSwiperInlineOptions(swiperElement);
    const presetOptions = getSwiperPresetOptions(swiperElement);
    const { nextEl, prevEl } = resolveNavigationElements(swiperElement);

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

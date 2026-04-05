/**
 * VectorForgeML Internship Portal - Main JavaScript
 * Handles: component loading, navigation, scroll animations, mobile menu, theme toggle
 */

(function () {
  'use strict';

  /* ----------------------------------------
     Theme Management
     Default: light | Stored in localStorage
  ---------------------------------------- */
  function getStoredTheme() {
    return localStorage.getItem('vfml-theme') || 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    localStorage.setItem('vfml-theme', theme);
    updateThemeIcons(theme);
  }

  function updateThemeIcons(theme) {
    // Desktop icons
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    // Mobile icons
    const sunIconMobile = document.getElementById('theme-icon-sun-mobile');
    const moonIconMobile = document.getElementById('theme-icon-moon-mobile');

    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', theme !== 'dark');
      moonIcon.classList.toggle('hidden', theme === 'dark');
    }
    if (sunIconMobile && moonIconMobile) {
      sunIconMobile.classList.toggle('hidden', theme !== 'dark');
      moonIconMobile.classList.toggle('hidden', theme === 'dark');
    }
  }

  function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const toggleBtnMobile = document.getElementById('theme-toggle-mobile');

    function toggle() {
      const current = getStoredTheme();
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggle);

    // Apply current theme icons after navbar loads
    updateThemeIcons(getStoredTheme());
  }

  // Apply theme immediately (before DOM content loaded) to prevent flash
  applyTheme(getStoredTheme());

  /* ----------------------------------------
     Component Loader
     Dynamically loads navbar and footer HTML
  ---------------------------------------- */
  async function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const html = await response.text();
      container.innerHTML = html;

      // Fix relative links for subdirectory pages (e.g., tracks/)
      const base = getBasePath();
      if (base !== './') {
        container.querySelectorAll('a[href]').forEach((link) => {
          const href = link.getAttribute('href');
          if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('/')) {
            link.setAttribute('href', base + href);
          }
        });

        // Fix image src paths for subdirectory pages
        container.querySelectorAll('img[src]').forEach((img) => {
          const src = img.getAttribute('src');
          if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
            img.setAttribute('src', base + src);
          }
        });
      }

      // After navbar loads, initialize mobile menu, active link, and theme toggle
      if (containerId === 'navbar-container') {
        initMobileMenu();
        setActiveNavLink();
        initThemeToggle();
      }
    } catch (err) {
      console.error(`Component load error: ${err.message}`);
    }
  }

  /* ----------------------------------------
     Mobile Menu Toggle
  ---------------------------------------- */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn && mobileMenu) {
      closeBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    // Close on link click
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ----------------------------------------
     Active Navigation Link
  ---------------------------------------- */
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const linkPage = href ? href.split('/').pop() : '';
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------
     Scroll Fade-In Animation (IntersectionObserver)
  ---------------------------------------- */
  function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------
     Animated Counters (IntersectionObserver)
     Counts from 0 to data-target on .counter-number elements
  ---------------------------------------- */
  function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  function animateCounter(el, target) {
    const duration = 2000; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + (target >= 100 ? '+' : '+');
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ----------------------------------------
     FAQ Accordion
  ---------------------------------------- */
  function initFAQAccordion() {
    const faqContainer = document.getElementById('faq-container');
    if (!faqContainer) return;

    faqContainer.addEventListener('click', function (e) {
      const questionBtn = e.target.closest('.faq-question');
      if (!questionBtn) return;

      const faqItem = questionBtn.closest('.faq-item');
      const isOpen = faqItem.classList.contains('open');

      // Close all open items
      faqContainer.querySelectorAll('.faq-item.open').forEach((item) => {
        item.classList.remove('open');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked item (if it was closed)
      if (!isOpen) {
        faqItem.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ----------------------------------------
     Floating Apply Button - hide when at hero or footer
  ---------------------------------------- */
  function initFloatingButton() {
    const btn = document.querySelector('.floating-apply-btn');
    if (!btn) return;

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;

          // Hide at very top and very bottom
          if (scrollY < 200 || scrollY + windowHeight > docHeight - 100) {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
          } else {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ----------------------------------------
     Resolve base path for components
     Works from root-level and subdirectory pages
  ---------------------------------------- */
  function getBasePath() {
    const path = window.location.pathname || '/';
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) return './';

    const endsWithSlash = path.endsWith('/');
    const lastSegment = segments[segments.length - 1] || '';
    const isFilePath = !endsWithSlash && lastSegment.includes('.');
    const depth = isFilePath ? segments.length - 1 : segments.length;

    if (depth <= 0) return './';
    return '../'.repeat(depth);
  }

  /* ----------------------------------------
     Initialize
  ---------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    const base = getBasePath();

    // Load shared components
    loadComponent('navbar-container', base + 'components/navbar.html');
    loadComponent('footer-container', base + 'components/footer.html');

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize animated counters
    initAnimatedCounters();

    // Initialize FAQ accordion
    initFAQAccordion();

    // Initialize floating apply button
    initFloatingButton();

    // Re-init animations after a short delay (for dynamically loaded content)
    setTimeout(initScrollAnimations, 500);
  });

  // Expose getBasePath globally for other modules
  window.VF = window.VF || {};
  window.VF.getBasePath = getBasePath;
})();

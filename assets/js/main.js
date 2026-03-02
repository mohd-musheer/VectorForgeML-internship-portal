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
     Resolve base path for components
     Works from root-level and subdirectory pages
  ---------------------------------------- */
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/tracks/')) {
      return '../';
    }
    return './';
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

    // Re-init animations after a short delay (for dynamically loaded content)
    setTimeout(initScrollAnimations, 500);
  });

  // Expose getBasePath globally for other modules
  window.VF = window.VF || {};
  window.VF.getBasePath = getBasePath;
})();

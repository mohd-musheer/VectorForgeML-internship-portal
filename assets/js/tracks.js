/**
 * VectorForgeML - Tracks Module
 * Registry of internship tracks for easy expansion
 * To add a new track: add an entry to TRACKS array
 */

(function () {
  'use strict';

  /* ----------------------------------------
     Track Registry
     Add new tracks here. Each entry generates
     a card on the internships page.
  ---------------------------------------- */
  const TRACKS = [
    {
      id: 'machine-learning',
      title: 'Machine Learning Internship',
      overview:
        'Build production-grade ML systems using VectorForgeML. Work on supervised learning, matrix optimization, and high-performance computing pipelines.',
      duration: '4–8 Weeks',
      mode: 'Online',
      link: 'tracks/machine-learning.html',
      icon: '⚙️',
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis Internship',
      overview:
        'Develop analytical pipelines, perform statistical analysis, and create reproducible data reports using R-based workflows and VectorForgeML tools.',
      duration: '4–8 Weeks',
      mode: 'Online',
      link: 'tracks/data-analysis.html',
      icon: '📊',
    },
  ];

  /* ----------------------------------------
     Render track cards into container
  ---------------------------------------- */
  function renderTrackCards() {
    const container = document.getElementById('tracks-container');
    if (!container) return;

    container.innerHTML = TRACKS.map(
      (track) => `
      <div class="glass-card p-6 md:p-8 fade-in">
        <div class="text-3xl mb-4">${track.icon}</div>
        <h3 class="text-xl font-bold mb-3" style="color:var(--text-primary)">${track.title}</h3>
        <p class="mb-4 leading-relaxed" style="color:var(--text-secondary)">${track.overview}</p>
        <div class="flex flex-wrap gap-3 mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            ${track.duration}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
            </svg>
            ${track.mode}
          </span>
        </div>
        <a href="${track.link}" class="btn-primary text-sm">
          View Details
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
    `
    ).join('');

    // Re-run IntersectionObserver for new fade-in elements
    initFadeIn();
  }

  /* ----------------------------------------
     Fade-in observer for dynamically added elements
  ---------------------------------------- */
  function initFadeIn() {
    const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeElements.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------
     Initialize
  ---------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderTrackCards();
  });

  // Expose tracks data for potential use by other modules
  window.VF = window.VF || {};
  window.VF.TRACKS = TRACKS;
})();

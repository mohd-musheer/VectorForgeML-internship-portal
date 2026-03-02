(function () {
  'use strict';

  const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwO30i9rYXdv0IDQ9sBWQMGM2l2pnTn5nLS69Sa7oI-iGwjHHVNYAcfv2A6KcTUfzlgug/exec';
  const RESULT_CONTAINER_ID = 'verify-result';

  function getCertificateIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) return params.get('id').trim();
    const raw = window.location.search.replace('?', '').trim();
    if (raw && !raw.includes('=')) return raw;
    return null;
  }

  async function verifyCertificate(certId) {
    const response = await fetch(`${API_BASE_URL}?id=${encodeURIComponent(certId)}`);
    if (!response.ok) throw new Error('Verification request failed');
    return await response.json();
  }

  function escapeHTML(str) {
    if (str === undefined || str === null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function formatDuration(startDate, endDate) {
    if (!startDate && !endDate) return 'N/A';
    if (startDate && endDate) return escapeHTML(startDate) + ' — ' + escapeHTML(endDate);
    return escapeHTML(startDate || endDate);
  }

  function statusBadge(value) {
    const v = String(value || '').toLowerCase();
    if (v === 'issued' || v === 'yes' || v === 'completed' || v === 'true') {
      return '<span class="text-emerald-400 font-semibold">Issued</span>';
    }
    if (v === 'pending' || v === 'in progress') {
      return '<span class="text-yellow-400 font-semibold">Pending</span>';
    }
    return '<span style="color:var(--text-muted)" class="font-semibold">Not Issued</span>';
  }

  function downloadButton(url, label) {
    if (!url) return '';
    return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      ${escapeHTML(label)}
    </a>`;
  }

  function renderResult(container, data) {
    if (data && data.found === true && data.fullName) {
      const duration = formatDuration(data.startDate, data.endDate);
      const certBtn = downloadButton(data.certificatePDF, 'Download Certificate');
      const lorBtn = downloadButton(data.lorPDF, 'Download LOR');
      const hasButtons = certBtn || lorBtn;

      container.innerHTML = `
        <div class="glass-card p-6 md:p-8 max-w-lg mx-auto text-center">
          <div class="verified-badge mx-auto mb-4 justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Verified Certificate
          </div>
          <h3 class="text-xl font-bold mb-4" style="color:var(--text-primary)">${escapeHTML(data.fullName)}</h3>
          <div class="space-y-3 text-left">
            <div class="flex justify-between py-2" style="border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Certificate ID</span>
              <span class="text-cyan-400 font-mono text-sm">${escapeHTML(data.id)}</span>
            </div>
            <div class="flex justify-between py-2" style="border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Track</span>
              <span style="color:var(--text-primary)">${escapeHTML(data.track)}</span>
            </div>
            <div class="flex justify-between py-2" style="border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Duration</span>
              <span style="color:var(--text-primary)">${duration}</span>
            </div>
            <div class="flex justify-between py-2" style="border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Tasks Completed</span>
              <span style="color:var(--text-primary)">${escapeHTML(data.tasksCompleted)}</span>
            </div>
            <div class="flex justify-between py-2" style="border-bottom:1px solid var(--glass-border)">
              <span style="color:var(--text-secondary)">Certificate Status</span>
              ${statusBadge(data.certificateIssued)}
            </div>
            <div class="flex justify-between py-2">
              <span style="color:var(--text-secondary)">LOR Status</span>
              ${statusBadge(data.lorIssued)}
            </div>
          </div>
          ${hasButtons ? `<div class="flex flex-wrap justify-center gap-3 mt-6">${certBtn}${lorBtn}</div>` : ''}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="glass-card p-6 md:p-8 max-w-lg mx-auto text-center">
          <div class="invalid-badge mx-auto mb-4 justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            Invalid Certificate
          </div>
          <p style="color:var(--text-secondary)" class="mb-2">The certificate ID provided could not be verified.</p>
          <p class="text-sm" style="color:var(--text-muted)">Please check the ID and try again, or contact
            <a href="mailto:vectorforgeml@yahoo.com" class="text-cyan-400 hover:underline">vectorforgeml@yahoo.com</a>
          </p>
        </div>
      `;
    }
  }

  function renderError(container) {
    container.innerHTML = `
      <div class="glass-card p-6 md:p-8 max-w-lg mx-auto text-center">
        <div class="invalid-badge mx-auto mb-4 justify-center">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          Verification Error
        </div>
        <p style="color:var(--text-secondary)" class="mb-2">Unable to connect to the verification server.</p>
        <p class="text-sm" style="color:var(--text-muted)">Please try again later or contact
          <a href="mailto:vectorforgeml@yahoo.com" class="text-cyan-400 hover:underline">vectorforgeml@yahoo.com</a>
        </p>
      </div>
    `;
  }

  async function handleVerify(certId) {
    const container = document.getElementById(RESULT_CONTAINER_ID);
    if (!container) return;
    container.innerHTML = '<div class="text-center py-8"><div class="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div><p class="mt-3" style="color:var(--text-secondary)">Verifying...</p></div>';
    try {
      const data = await verifyCertificate(certId);
      renderResult(container, data);
    } catch (_) {
      renderError(container);
    }
  }

  function initManualVerify() {
    const form = document.getElementById('verify-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('cert-id-input');
      const certId = input ? input.value.trim() : '';
      if (!certId) return;
      handleVerify(certId);
    });
  }

  async function autoVerifyFromURL() {
    const certId = getCertificateIdFromURL();
    if (!certId) return;
    const input = document.getElementById('cert-id-input');
    if (input) input.value = certId;
    handleVerify(certId);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initManualVerify();
    setTimeout(autoVerifyFromURL, 200);
  });
})();

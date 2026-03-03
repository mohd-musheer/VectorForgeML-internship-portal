/**
 * VectorForgeML - Chatbot Module
 * Two-layer logic:
 *   1. RAG API (if window.RAG_API exists)
 *   2. Rule-based fallback
 * Features: Quick suggestion buttons, collapsible, theme-aware, mobile-responsive
 */

(function () {
  'use strict';

  /* ----------------------------------------
     Quick Suggestion Buttons
  ---------------------------------------- */
  const QUICK_SUGGESTIONS = [
    'What is VectorForgeML?',
    'About Internship',
    'Is it free?',
    'How to apply?',
    'Certificate & LOR',
    'Verify certificate',
  ];

  /* ----------------------------------------
     Rule-Based Knowledge Base
  ---------------------------------------- */
  const RULES = [
    {
      keywords: ['what is vectorforgeml', 'about vectorforgeml', 'what is vfml', 'tell me about'],
      answer:
        'VectorForgeML is a CRAN-published, high-performance machine learning framework built using R and C++. It integrates BLAS, LAPACK, OpenMP, and zero-copy memory architecture for optimized linear algebra and ML operations.',
    },
    {
      keywords: ['free', 'cost', 'pricing', 'fee', 'charge', 'paid'],
      answer:
        'Yes, the VectorForgeML internship program is completely free of charge. There are no fees to apply or participate.',
    },
    {
      keywords: ['how to apply', 'apply', 'application', 'register', 'sign up', 'enroll'],
      answer:
        'You can apply directly through our website! Visit the Apply page (apply.html) and fill out the application form. It\'s completely free and takes less than 2 minutes.',
    },
    {
      keywords: ['duration', 'how long', 'weeks', 'time period', 'length'],
      answer:
        'The internship duration is 4 to 8 weeks, depending on the track and your pace. It is fully self-paced.',
    },
    {
      keywords: ['certificate', 'certification', 'will i get', 'receive certificate', 'certificate & lor'],
      answer:
        'Yes, upon successful completion, you will receive a verifiable digital certificate. Each certificate has a unique ID that can be verified on our portal. Exceptional interns may also receive a Letter of Recommendation (LOR).',
    },
    {
      keywords: ['lor', 'letter of recommendation', 'recommendation letter'],
      answer:
        'A Letter of Recommendation (LOR) is issued to interns who demonstrate exceptional performance, complete all tasks with quality, and show genuine research aptitude during the program.',
    },
    {
      keywords: ['online', 'remote', 'mode', 'offline', 'in person'],
      answer:
        'The internship is conducted entirely online. All work is submitted via GitHub, and communication happens through email.',
    },
    {
      keywords: ['who can apply', 'eligible', 'eligibility', 'qualification', 'requirement'],
      answer:
        'Students, graduates, and self-learners with basic programming knowledge can apply. Familiarity with R or Python is a plus, but not mandatory. Motivation and willingness to learn are the key requirements.',
    },
    {
      keywords: ['verify certificate', 'verification', 'check certificate', 'verify'],
      answer:
        'You can verify a certificate by visiting the Verify page on our portal and entering the certificate ID. You can also use a direct link like: verify.html?VFML-ML-2026-001',
    },
    {
      keywords: ['contact', 'email', 'reach', 'support'],
      answer:
        'You can contact us via email at vectorforgeml@yahoo.com. You can also connect with us on LinkedIn and Reddit through the links on our Contact page.',
    },
    {
      keywords: ['github', 'git', 'repository', 'code submission'],
      answer:
        'All internship work follows a GitHub-based workflow. You will create repositories for your projects, and your work will be tracked via commits and pull requests.',
    },
    {
      keywords: ['about internship', 'internship program', 'tell me about internship'],
      answer:
        'The VectorForgeML Internship Program is a structured, research-oriented initiative designed to help learners build verifiable ML systems. It offers two tracks: Machine Learning and Data Analysis. The program is free, online, and self-paced within 4–8 weeks.',
    },
  ];

  const DEFAULT_REPLY = 'I\'m not sure about that. Please contact vectorforgeml@yahoo.com for further assistance.';

  /* ----------------------------------------
     Check for RAG API
  ---------------------------------------- */
  async function queryRAG(message) {
    if (window.RAG_API && typeof window.RAG_API === 'function') {
      try {
        const response = await window.RAG_API(message);
        if (response) return response;
      } catch (err) {
        console.warn('RAG API error, falling back to rule-based:', err.message);
      }
    }
    return null;
  }

  /* ----------------------------------------
     Rule-Based Matcher
  ---------------------------------------- */
  function matchRule(input) {
    const normalized = input.toLowerCase().trim();

    for (const rule of RULES) {
      for (const keyword of rule.keywords) {
        if (normalized.includes(keyword)) {
          return rule.answer;
        }
      }
    }

    return DEFAULT_REPLY;
  }

  /* ----------------------------------------
     Get Bot Response
  ---------------------------------------- */
  async function getBotResponse(message) {
    // Layer 1: Try RAG API
    const ragResponse = await queryRAG(message);
    if (ragResponse) return ragResponse;

    // Layer 2: Rule-based fallback
    return matchRule(message);
  }

  /* ----------------------------------------
     Inject Chatbot HTML
  ---------------------------------------- */
  function injectChatbotHTML() {
    const quickBtnsHTML = QUICK_SUGGESTIONS.map(
      (label) => `<button class="chatbot-quick-btn" data-question="${label}">${label}</button>`
    ).join('');

    const chatbotHTML = `
      <div class="chatbot-container" id="chatbot">
        <!-- Toggle Button -->
        <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chatbot">
          <svg id="chatbot-icon-open" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <svg id="chatbot-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatbot-window">
          <div class="chatbot-header">
            <div class="flex items-center gap-2">
              <div class="pulse-dot"></div>
              <span class="text-sm font-semibold" style="color:var(--text-primary)">VectorForgeML Assistant</span>
            </div>
            <button id="chatbot-close" class="transition-colors" style="color:var(--text-muted)" aria-label="Close chatbot">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-messages" id="chatbot-messages">
            <div class="chat-msg bot">
              👋 Hello! I'm the VectorForgeML assistant. Ask me anything about our internship program, or use the quick buttons below.
            </div>
          </div>
          <div class="chatbot-quick-btns" id="chatbot-quick-btns">
            ${quickBtnsHTML}
          </div>
          <div class="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Type your question..." autocomplete="off" />
            <button id="chatbot-send" aria-label="Send message">Send</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  /* ----------------------------------------
     Add Message to Chat
  ---------------------------------------- */
  function addMessage(text, sender) {
    const messagesEl = document.getElementById('chatbot-messages');
    if (!messagesEl) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.textContent = text;
    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ----------------------------------------
     Handle Send
  ---------------------------------------- */
  async function handleSend(message) {
    const input = document.getElementById('chatbot-input');
    const text = message || (input ? input.value.trim() : '');
    if (!text) return;

    // Show user message
    addMessage(text, 'user');
    if (input) input.value = '';

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot';
    typingDiv.textContent = '...';
    typingDiv.id = 'typing-indicator';
    document.getElementById('chatbot-messages').appendChild(typingDiv);

    // Get response
    const response = await getBotResponse(text);

    // Remove typing indicator and show response
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
    addMessage(response, 'bot');
  }

  /* ----------------------------------------
     Initialize Chatbot
  ---------------------------------------- */
  function initChatbot() {
    injectChatbotHTML();

    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const chatInput = document.getElementById('chatbot-input');
    const iconOpen = document.getElementById('chatbot-icon-open');
    const iconClose = document.getElementById('chatbot-icon-close');
    const quickBtnsContainer = document.getElementById('chatbot-quick-btns');

    // Toggle chat window
    toggleBtn.addEventListener('click', () => {
      const isOpen = chatWindow.classList.toggle('open');
      iconOpen.classList.toggle('hidden', isOpen);
      iconClose.classList.toggle('hidden', !isOpen);

      if (isOpen) {
        chatInput.focus();
      }
    });

    // Close button
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    });

    // Send message
    sendBtn.addEventListener('click', () => handleSend());

    // Enter key
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    // Quick suggestion buttons
    if (quickBtnsContainer) {
      quickBtnsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.chatbot-quick-btn');
        if (!btn) return;
        const question = btn.getAttribute('data-question');
        if (question) {
          handleSend(question);
        }
      });
    }
  }

  /* ----------------------------------------
     Initialize on DOM ready
  ---------------------------------------- */
  document.addEventListener('DOMContentLoaded', initChatbot);
})();

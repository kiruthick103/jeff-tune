/**
 * Jeff Tune-1 Pro - Frontend application
 * Chat UI, markdown rendering, copy, model selector, DB-backed chat history.
 */

(function () {
  'use strict';

  const messagesEl = document.getElementById('messages');
  const welcomeEl = document.getElementById('welcome');
  const typingEl = document.getElementById('typingIndicator');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const btnSend = document.getElementById('btnSend');
  const btnNewChat = document.getElementById('btnNewChat');
  const modelSelect = document.getElementById('modelSelect');
  const chatHistory = document.getElementById('chatHistory');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const btnSettings = document.getElementById('btnSettings');

  let conversation = [];
  let chatSessions = [];
  let currentSessionId = null;

  // Detect environment
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiBase = (isLocal || window.location.hostname.includes('vercel.app')) ? '/api' : '/.netlify/functions';


  // --- Markdown (simple, safe) ---
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderMarkdown(text) {
    if (!text || typeof text !== 'string') return '';
    const lines = text.split('\n');
    const out = [];
    let i = 0;
    let inCode = false;
    let codeLang = '';
    let codeBuf = [];

    function flushCode() {
      if (codeBuf.length) {
        out.push('<pre><code>', escapeHtml(codeBuf.join('\n')), '</code></pre>');
        codeBuf = [];
      }
      inCode = false;
    }

    while (i < lines.length) {
      const line = lines[i];
      const codeFence = line.match(/^```(\w*)/);
      if (codeFence) {
        if (!inCode) {
          flushCode();
          inCode = true;
          codeLang = codeFence[1] || '';
          i++;
          continue;
        }
        flushCode();
        i++;
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        i++;
        continue;
      }
      const trimmed = line.trim();
      if (!trimmed) {
        out.push('<p></p>');
        i++;
        continue;
      }
      let html = escapeHtml(trimmed);
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      if (trimmed.startsWith('### ')) {
        out.push('<h3>', html.slice(4), '</h3>');
      } else if (trimmed.startsWith('## ')) {
        out.push('<h2>', html.slice(3), '</h2>');
      } else if (trimmed.startsWith('# ')) {
        out.push('<h1>', html.slice(2), '</h1>');
      } else if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
        out.push('<p>', html, '</p>');
      } else {
        out.push('<p>', html, '</p>');
      }
      i++;
    }
    flushCode();
    return out.join('');
  }

  function hideWelcome() {
    if (welcomeEl) welcomeEl.hidden = true;
  }

  function showTyping(show) {
    if (typingEl) typingEl.classList.toggle('visible', !!show);
  }

  function scrollToBottom() {
    const wrap = document.querySelector('.messages-wrap');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }

  function addMessage(role, content, isUser) {
    hideWelcome();
    const div = document.createElement('div');
    div.className = 'msg msg-' + role;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    const head = document.createElement('div');
    head.className = 'msg-head';
    head.innerHTML = '<span class="msg-role">' + (isUser ? 'You' : 'Jeff Tune-1 Pro') + '</span>' +
      '<button type="button" class="btn-copy" data-copy>Copy</button>';
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = 'Just now';
    const contentEl = document.createElement('div');
    contentEl.className = 'msg-content';
    if (role === 'assistant') {
      contentEl.innerHTML = renderMarkdown(content);
    } else {
      contentEl.textContent = content;
    }
    bubble.appendChild(head);
    bubble.appendChild(contentEl);
    bubble.appendChild(meta);
    div.appendChild(bubble);
    messagesEl.appendChild(div);

    const copyBtn = bubble.querySelector('[data-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(content).then(function () {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
        });
      });
    }
    scrollToBottom();
    return div;
  }

  function setSendDisabled(disabled) {
    btnSend.disabled = disabled;
  }

  function fetchModels() {
    fetch(apiBase + '/models')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        modelSelect.innerHTML = '<option value="">Auto (smart routing)</option>';
        (data.options || []).forEach(function (opt) {
          const o = document.createElement('option');
          o.value = opt.id;
          o.textContent = opt.label;
          modelSelect.appendChild(o);
        });
      })
      .catch(function () { });
  }

  function sendToApi(message, history, model, sessionId) {
    return fetch(apiBase + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: history,
        model: model || null,
        session_id: sessionId || null
      })
    });
  }

  function submitChat() {
    const text = (userInput.value || '').trim();
    if (!text) return;

    const model = (modelSelect.value || '').trim() || null;
    userInput.value = '';
    userInput.style.height = 'auto';

    const userMsg = { role: 'user', content: text };
    conversation.push(userMsg);
    addMessage('user', text, true);

    showTyping(true);
    setSendDisabled(true);

    const historyForApi = conversation.slice(0, -1);

    sendToApi(text, historyForApi, model, currentSessionId)
      .then(function (r) {
        if (!r.ok) return r.json().then(function (d) { throw new Error(d.error || r.statusText); });
        return r.json();
      })
      .then(function (data) {
        showTyping(false);
        setSendDisabled(false);
        const reply = data.reply || '';
        currentSessionId = data.session_id || currentSessionId;
        conversation.push({ role: 'assistant', content: reply });
        addMessage('assistant', reply);
        loadSessions();
      })
      .catch(function (err) {
        showTyping(false);
        setSendDisabled(false);
        conversation.push({ role: 'assistant', content: 'Sorry, something went wrong. ' + (err.message || 'Please try again.') });
        addMessage('assistant', 'Sorry, something went wrong. ' + (err.message || 'Please try again.'));
      });
  }

  function loadSessions() {
    fetch(apiBase + '/sessions')
      .then(function (r) { return r.json(); })
      .then(function (sessions) {
        chatSessions = sessions;
        renderChatHistory();
      })
      .catch(function () { renderChatHistory(); });
  }

  function newChat() {
    currentSessionId = null;
    conversation = [];
    if (welcomeEl) welcomeEl.hidden = false;
    messagesEl.querySelectorAll('.msg').forEach(function (n) { n.remove(); });
    document.querySelectorAll('.chat-item').forEach(function (n) { n.classList.remove('active'); });
    userInput.focus();
    loadSessions();
  }

  function renderChatHistory() {
    const list = chatSessions || [];
    if (list.length === 0) {
      chatHistory.innerHTML = '<p class="sidebar-placeholder">No chats yet</p>';
      return;
    }
    chatHistory.innerHTML = '';
    list.forEach(function (s) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-item' + (s.id === currentSessionId ? ' active' : '');
      btn.textContent = s.title || 'Chat';
      btn.dataset.id = s.id;
      btn.addEventListener('click', function () {
        loadSession(s.id);
        if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');
      });
      chatHistory.appendChild(btn);
    });
  }

  function loadSession(id) {
    fetch(apiBase + '/sessions/' + encodeURIComponent(id))
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(function (msgs) {
        currentSessionId = id;
        conversation = msgs.map(function (m) { return { role: m.role, content: m.content }; });
        if (welcomeEl) welcomeEl.hidden = conversation.length > 0;
        messagesEl.querySelectorAll('.msg').forEach(function (n) { n.remove(); });
        conversation.forEach(function (m) {
          addMessage(m.role, m.content, m.role === 'user');
        });
        renderChatHistory();
        scrollToBottom();
      })
      .catch(function () {
        chatHistory.innerHTML = '<p class="sidebar-placeholder">Failed to load</p>';
      });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      submitChat();
    });
  }

  if (userInput) {
    userInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
    userInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitChat();
      }
    });
  }

  if (btnNewChat) btnNewChat.addEventListener('click', newChat);
  if (btnSettings) btnSettings.addEventListener('click', function () { alert('Settings coming soon.'); });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  if (sidebar) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', function () { sidebar.classList.remove('open'); });
    sidebar.parentNode.insertBefore(overlay, sidebar.nextSibling);
  }

  fetchModels();
  loadSessions();
})();

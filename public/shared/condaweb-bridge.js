(function bootstrapCondaWebBridge() {
  const listeners = new Map();
  let context = null;

  // Protection native commune à tous les jeux intégrés. Elle reste confinée
  // à l'iframe du jeu et n'empêche pas de sélectionner le texte du site.
  const protectionStyle = document.createElement('style');
  protectionStyle.textContent = `
    html, body, canvas, img, button, [role="button"] {
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-user-drag: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    html, body { overscroll-behavior: none; }
    canvas, img { touch-action: none !important; }
    button, [role="button"] { touch-action: manipulation; }
  `;
  document.head.appendChild(protectionStyle);
  const clearSelection = () => {
    try { document.getSelection()?.removeAllRanges(); } catch (_) {}
  };
  const blockNativeMenu = (event) => {
    event.preventDefault();
    clearSelection();
  };
  ['contextmenu', 'selectstart', 'dragstart', 'copy', 'cut', 'dblclick'].forEach((type) => {
    document.addEventListener(type, blockNativeMenu, true);
  });
  document.addEventListener('touchstart', clearSelection, { capture: true, passive: true });
  document.addEventListener('touchend', clearSelection, { capture: true, passive: true });

  const emit = (type, payload) => {
    const callbacks = listeners.get(type) || [];
    callbacks.forEach((callback) => callback(payload));
  };

  const send = (type, payload = {}) => {
    if (window.parent === window) return;
    window.parent.postMessage({
      source: 'condamine-game',
      bridgeVersion: 1,
      type,
      ...payload,
    }, '*');
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.source !== 'condamine') return;
    if (event.data.type === 'simulate-key') {
      const code = String(event.data.code || 'Space');
      const key = String(event.data.key || (code === 'Space' ? ' ' : code.replace(/^Key/, '')));
      const init = { key, code, bubbles: true, cancelable: true };
      window.dispatchEvent(new KeyboardEvent('keydown', init));
      setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', init)), 50);
      return;
    }
    if (event.data.type === 'game-context') context = event.data.context || null;
    emit(event.data.type, event.data);
  });

  window.CondaWebGame = {
    version: 1,
    send,
    requestQuestion: (payload) => send('request-question', { payload }),
    submitAnswer: (payload) => send('submit-answer', { payload }),
    getContext: () => context,
    getLessons: () => context?.lessons || [],
    getLessonById: (lessonId) => (context?.lessons || []).find((lesson) => lesson.id === lessonId) || null,
    openLearningGuide: () => send('open-learning-guide'),
    on(type, callback) {
      const callbacks = listeners.get(type) || [];
      callbacks.push(callback);
      listeners.set(type, callbacks);
      return () => listeners.set(type, (listeners.get(type) || []).filter((item) => item !== callback));
    },
  };

  send('game-ready', { href: window.location.href });
})();

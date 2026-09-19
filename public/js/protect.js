/* ==========================================================================
   IMAGE & CONTENT PROTECTION ENGINE
   ========================================================================== */

(function () {
  'use strict';

  // 1. Bloquear Clique com Botão Direito (Context Menu)
  document.addEventListener('contextmenu', function (e) {
    // Permite menu apenas se estiver logado como admin e clicando em input/textarea
    if (localStorage.getItem('adm_token') && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
      return;
    }
    e.preventDefault();
    showProtectionWarning('A cópia e download de imagens e conteúdos protegidos por direitos autorais são desativados.');
    return false;
  }, { capture: true });

  // 2. Bloquear Atalhos de Teclado (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, PrintScreen)
  window.addEventListener('keydown', function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      showProtectionWarning('Ferramentas de desenvolvedor desativadas para proteção do acervo.');
      return false;
    }

    // Ctrl+U / Cmd+U (Ver Código Fonte)
    if (modifier && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Salvar Página / Imagem)
    if (modifier && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      // Se não for o botão de salvar do admin
      if (!document.getElementById('liveAdminToolbar') || document.getElementById('liveAdminToolbar').style.display === 'none') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspecionar Elemento)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspecionar)
    if ((modifier && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (isMac && e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
      e.preventDefault();
      e.stopPropagation();
      showProtectionWarning('Acesso ao código-fonte protegido.');
      return false;
    }

    // PrintScreen
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
    }
  }, { capture: true });

  // 3. Desativar Arrastar Imagem (Drag & Drop para download)
  document.addEventListener('dragstart', function (e) {
    // Permite apenas se estiver no modo admin organizando cards
    if (e.target.closest('.live-dragging') || (localStorage.getItem('adm_token') && (e.target.closest('.project-card') || e.target.closest('.gallery-item')))) {
      return;
    }
    if (e.target.tagName === 'IMG' || e.target.closest('.card-img-wrapper') || e.target.closest('.gallery-item')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 4. Bloquear Seleção de Imagens e Texto Não Editável
  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    if (e.target.tagName === 'IMG' || e.target.closest('.portfolio-grid') || e.target.closest('.gallery-grid')) {
      e.preventDefault();
      return false;
    }
  });

  // 5. Anti-DevTools Debugger Loop
  function initDevToolsDetector() {
    // Se o usuário não for admin logado
    if (localStorage.getItem('adm_token')) return;

    let devtoolsOpen = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function () {
        devtoolsOpen = true;
        // Limpa a tela ou desativa inspeção
        document.body.classList.add('devtools-active-blur');
      }
    });

    setInterval(function () {
      if (localStorage.getItem('adm_token')) return;
      devtoolsOpen = false;
      console.log(element);
      console.clear();
      if (devtoolsOpen) {
        document.body.classList.add('devtools-active-blur');
      } else {
        document.body.classList.remove('devtools-active-blur');
      }
    }, 1500);
  }

  // 6. Toast de Aviso Visual Discreto
  function showProtectionWarning(msg) {
    let warningEl = document.getElementById('copyrightWarningToast');
    if (!warningEl) {
      warningEl = document.createElement('div');
      warningEl.id = 'copyrightWarningToast';
      warningEl.className = 'copyright-warning-toast';
      document.body.appendChild(warningEl);
    }
    warningEl.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> ${msg}`;
    warningEl.classList.add('active');

    clearTimeout(warningEl.timeout);
    warningEl.timeout = setTimeout(function () {
      warningEl.classList.remove('active');
    }, 3200);
  }

  // Inicia detecção leve
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDevToolsDetector);
  } else {
    initDevToolsDetector();
  }
})();

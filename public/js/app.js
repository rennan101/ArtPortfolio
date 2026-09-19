/* ==========================================================================
   APP.JS - CLIENT-SIDE SPA ROUTING, MULTI-LANGUAGE (PT-BR, PT-PT, EN)
   & WIX-STYLE LIVE VISUAL CMS
   ========================================================================== */

(function () {
  let siteData = null;
  let isLiveAdmin = false;
  let hasPendingChanges = false;
  let currentActiveGalleryItems = [];

  // Idioma Atual (padrão: pt-br)
  let currentLang = localStorage.getItem('site_lang') || 'pt-br';

  // -------------------------------------------------------------
  // DICIONÁRIO MULTI-IDIOMA & LEXICOM AUTOMÁTICO
  // -------------------------------------------------------------
  const translations = {
    'pt-br': {
      // Menu / Nav
      nav_portfolio: 'Portfólio',
      nav_services: 'Serviços',
      nav_about: 'Sobre',
      nav_contact: 'Contato',
      // Home / Hero
      visual_artist: 'Artista Visual',
      visual_artist_sculptor: 'Artista Visual & Escultor',
      default_bio: 'Acredito em um design que emociona e transcende a função.',
      gallery_badge: 'Galeria',
      work_together: 'Vamos trabalhar juntos',
      // Contact
      contact_title: 'Contato',
      contact_desc: 'Ficarei feliz em conversar. Envie dúvidas, ideias ou propostas de projetos e responderei o quanto antes.',
      first_name_label: 'Nome',
      first_name_placeholder: 'Seu primeiro nome',
      last_name_label: 'Sobrenome',
      last_name_placeholder: 'Seu sobrenome',
      email_label: 'Seu E-mail',
      email_placeholder: 'seu@email.com',
      message_label: 'Sua Mensagem',
      message_placeholder: 'Descreva seu projeto ou mensagem...',
      btn_send_message: 'Enviar Mensagem',
      sending_message: 'Enviando...',
      contact_success: 'Obrigado pelo contato! Sua mensagem foi enviada com sucesso.',
      phone_label: 'Telefone:',
      // About
      about_title: 'Sobre',
      recognition: 'Reconhecimento',
      selected_clients: 'Clientes Selecionados',
      // Services
      services_title: 'Serviços',
      services_quote: '“Uma experiência fluida e profissional do início ao fim. Comunicação clara, ideias marcantes e um resultado que superou todas as expectativas.”',
      // Footer
      all_rights_reserved: 'Todos os direitos reservados.',
      // Live Editor
      live_mode_active: 'MODO EDIÇÃO VISUAL ATIVO',
      btn_add_photos: 'Adicionar Fotos',
      btn_new_gallery: 'Nova Galeria',
      btn_menus: 'Menus',
      btn_profile_bio: 'Perfil & Bio',
      btn_save_changes: 'Salvar Alterações',
      btn_saving: 'Gravando...',
      btn_logout: 'Sair',
      btn_dashboard: 'Painel',
      page_label: 'Página:'
    },
    'pt-pt': {
      // Menu / Nav
      nav_portfolio: 'Portfólio',
      nav_services: 'Serviços',
      nav_about: 'Sobre',
      nav_contact: 'Contacto',
      // Home / Hero
      visual_artist: 'Artista Visual',
      visual_artist_sculptor: 'Artista Visual & Escultor',
      default_bio: 'Acredito num design que emociona e transcende a função.',
      gallery_badge: 'Galeria',
      work_together: 'Vamos trabalhar juntos',
      // Contact
      contact_title: 'Contacto',
      contact_desc: 'Terei todo o gosto em falar consigo. Envie dúvidas, ideias ou propostas de projetos e responderei com a maior brevidade.',
      first_name_label: 'Primeiro Nome',
      first_name_placeholder: 'O seu primeiro nome',
      last_name_label: 'Apelido',
      last_name_placeholder: 'O seu apelido',
      email_label: 'O seu E-mail',
      email_placeholder: 'o.seu@email.pt',
      message_label: 'A sua Mensagem',
      message_placeholder: 'Descreva o seu projeto ou mensagem...',
      btn_send_message: 'Enviar Mensagem',
      sending_message: 'A enviar...',
      contact_success: 'Obrigado pelo contacto! A sua mensagem foi enviada com sucesso.',
      phone_label: 'Telefone:',
      // About
      about_title: 'Sobre',
      recognition: 'Reconhecimento',
      selected_clients: 'Clientes Selecionados',
      // Services
      services_title: 'Serviços',
      services_quote: '“Uma experiência fluida e profissional do início ao fim. Comunicação clara, ideias marcantes e um resultado que superou todas as expectativas.”',
      // Footer
      all_rights_reserved: 'Todos os direitos reservados.',
      // Live Editor
      live_mode_active: 'MODO EDIÇÃO VISUAL ATIVO',
      btn_add_photos: 'Adicionar Fotos',
      btn_new_gallery: 'Nova Galeria',
      btn_menus: 'Menus',
      btn_profile_bio: 'Perfil & Bio',
      btn_save_changes: 'Guardar Alterações',
      btn_saving: 'A gravar...',
      btn_logout: 'Sair',
      btn_dashboard: 'Painel',
      page_label: 'Página:'
    },
    'en': {
      // Menu / Nav
      nav_portfolio: 'Portfolio',
      nav_services: 'Services',
      nav_about: 'About',
      nav_contact: 'Contact',
      // Home / Hero
      visual_artist: 'Visual Artist',
      visual_artist_sculptor: 'Visual Artist & Sculptor',
      default_bio: 'I believe in design that feels, not just functions.',
      gallery_badge: 'Gallery',
      work_together: "Let's work together",
      // Contact
      contact_title: 'Contact',
      contact_desc: 'I’m always happy to connect. Reach out with questions, ideas, or project inquiries, and I’ll get back to you as soon as possible.',
      first_name_label: 'First Name',
      first_name_placeholder: 'Your first name',
      last_name_label: 'Last Name',
      last_name_placeholder: 'Your last name',
      email_label: 'Your Email',
      email_placeholder: 'your@email.com',
      message_label: 'Your Message',
      message_placeholder: 'Describe your project or message...',
      btn_send_message: 'Send Message',
      sending_message: 'Sending...',
      contact_success: 'Thank you! Your message has been sent successfully.',
      phone_label: 'Phone:',
      // About
      about_title: 'About',
      recognition: 'Recognition',
      selected_clients: 'Selected Clients',
      // Services
      services_title: 'Services',
      services_quote: '“A smooth and professional experience from start to finish. Clear communication, strong ideas, and a result that exceeded expectations.”',
      // Footer
      all_rights_reserved: 'All rights reserved.',
      // Live Editor
      live_mode_active: 'LIVE VISUAL EDITING ACTIVE',
      btn_add_photos: 'Add Photos',
      btn_new_gallery: 'New Gallery',
      btn_menus: 'Menus',
      btn_profile_bio: 'Profile & Bio',
      btn_save_changes: 'Save Changes',
      btn_saving: 'Saving...',
      btn_logout: 'Logout',
      btn_dashboard: 'Dashboard',
      page_label: 'Page:'
    }
  };

  // Dicionário Léxico Automático para traduzir menus, galerias e tags adicionadas
  const lexicon = {
    // Menu / Páginas
    'portfolio': { 'pt-br': 'Portfólio', 'pt-pt': 'Portfólio', 'en': 'Portfolio' },
    'portfólio': { 'pt-br': 'Portfólio', 'pt-pt': 'Portfólio', 'en': 'Portfolio' },
    'services': { 'pt-br': 'Serviços', 'pt-pt': 'Serviços', 'en': 'Services' },
    'serviços': { 'pt-br': 'Serviços', 'pt-pt': 'Serviços', 'en': 'Services' },
    'about': { 'pt-br': 'Sobre', 'pt-pt': 'Sobre', 'en': 'About' },
    'sobre': { 'pt-br': 'Sobre', 'pt-pt': 'Sobre', 'en': 'About' },
    'contact': { 'pt-br': 'Contato', 'pt-pt': 'Contacto', 'en': 'Contact' },
    'contato': { 'pt-br': 'Contato', 'pt-pt': 'Contacto', 'en': 'Contact' },
    'contacto': { 'pt-br': 'Contato', 'pt-pt': 'Contacto', 'en': 'Contact' },
    
    // Profissões
    'visual artist': { 'pt-br': 'Artista Visual', 'pt-pt': 'Artista Visual', 'en': 'Visual Artist' },
    'artista visual': { 'pt-br': 'Artista Visual', 'pt-pt': 'Artista Visual', 'en': 'Visual Artist' },
    'visual artist & sculptor': { 'pt-br': 'Artista Visual & Escultor', 'pt-pt': 'Artista Visual & Escultor', 'en': 'Visual Artist & Sculptor' },
    'artista visual & escultor': { 'pt-br': 'Artista Visual & Escultor', 'pt-pt': 'Artista Visual & Escultor', 'en': 'Visual Artist & Sculptor' },
    'sculptor': { 'pt-br': 'Escultor', 'pt-pt': 'Escultor', 'en': 'Sculptor' },
    'escultor': { 'pt-br': 'Escultor', 'pt-pt': 'Escultor', 'en': 'Sculptor' },
    'illustrator': { 'pt-br': 'Ilustrador', 'pt-pt': 'Ilustrador', 'en': 'Illustrator' },
    'ilustrador': { 'pt-br': 'Ilustrador', 'pt-pt': 'Ilustrador', 'en': 'Illustrator' },
    'designer': { 'pt-br': 'Designer', 'pt-pt': 'Designer', 'en': 'Designer' },

    // Galerias e Tags Comuns
    'creatures': { 'pt-br': 'Criaturas', 'pt-pt': 'Criaturas', 'en': 'Creatures' },
    'criaturas': { 'pt-br': 'Criaturas', 'pt-pt': 'Criaturas', 'en': 'Creatures' },
    'sculptures': { 'pt-br': 'Esculturas', 'pt-pt': 'Esculturas', 'en': 'Sculptures' },
    'esculturas': { 'pt-br': 'Esculturas', 'pt-pt': 'Esculturas', 'en': 'Sculptures' },
    'portraits': { 'pt-br': 'Retratos', 'pt-pt': 'Retratos', 'en': 'Portraits' },
    'retratos': { 'pt-br': 'Retratos', 'pt-pt': 'Retratos', 'en': 'Portraits' },
    'editorial': { 'pt-br': 'Editorial', 'pt-pt': 'Editorial', 'en': 'Editorial' },
    'personal work': { 'pt-br': 'Trabalhos Pessoais', 'pt-pt': 'Trabalhos Pessoais', 'en': 'Personal Work' },
    'trabalhos pessoais': { 'pt-br': 'Trabalhos Pessoais', 'pt-pt': 'Trabalhos Pessoais', 'en': 'Personal Work' },
    'paintings': { 'pt-br': 'Pinturas', 'pt-pt': 'Pinturas', 'en': 'Paintings' },
    'pinturas': { 'pt-br': 'Pinturas', 'pt-pt': 'Pinturas', 'en': 'Paintings' },
    'drawings': { 'pt-br': 'Desenhos', 'pt-pt': 'Desenhos', 'en': 'Drawings' },
    'desenhos': { 'pt-br': 'Desenhos', 'pt-pt': 'Desenhos', 'en': 'Drawings' },
    'visuals': { 'pt-br': 'Visuais', 'pt-pt': 'Visuais', 'en': 'Visuals' },
    'visuais': { 'pt-br': 'Visuais', 'pt-pt': 'Visuais', 'en': 'Visuals' },
    'storytelling': { 'pt-br': 'Narrativa', 'pt-pt': 'Narrativa', 'en': 'Storytelling' },
    'narrativa': { 'pt-br': 'Narrativa', 'pt-pt': 'Narrativa', 'en': 'Storytelling' },
    'brand': { 'pt-br': 'Marca', 'pt-pt': 'Marca', 'en': 'Brand' },
    'marca': { 'pt-br': 'Marca', 'pt-pt': 'Marca', 'en': 'Brand' },
    'gallery': { 'pt-br': 'Galeria', 'pt-pt': 'Galeria', 'en': 'Gallery' },
    'galeria': { 'pt-br': 'Galeria', 'pt-pt': 'Galeria', 'en': 'Gallery' },
    'exhibitions': { 'pt-br': 'Exposições', 'pt-pt': 'Exposições', 'en': 'Exhibitions' },
    'exposições': { 'pt-br': 'Exposições', 'pt-pt': 'Exposições', 'en': 'Exhibitions' },
    'concept art': { 'pt-br': 'Arte Conceitual', 'pt-pt': 'Arte Conceptual', 'en': 'Concept Art' },
    'arte conceitual': { 'pt-br': 'Arte Conceitual', 'pt-pt': 'Arte Conceptual', 'en': 'Concept Art' },
    'arte conceptual': { 'pt-br': 'Arte Conceitual', 'pt-pt': 'Arte Conceptual', 'en': 'Concept Art' }
  };

  function t(key, fallback = '') {
    const langDict = translations[currentLang] || translations['pt-br'];
    return langDict[key] || fallback || key;
  }

  function autoTranslate(text) {
    if (!text || typeof text !== 'string') return text;
    const clean = text.trim().toLowerCase();
    if (lexicon[clean] && lexicon[clean][currentLang]) {
      return lexicon[clean][currentLang];
    }
    return text;
  }

  // Elementos Principais do DOM
  const mainApp = document.getElementById('mainApp');
  const mainNav = document.getElementById('mainNav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteBrandLogo = document.getElementById('siteBrandLogo');
  const pageTitle = document.getElementById('pageTitle');
  const footerCopyright = document.getElementById('footerCopyright');
  
  // Toolbar de Edição Visual (Wix-Style)
  const liveAdminToolbar = document.getElementById('liveAdminToolbar');
  const livePageIndicator = document.getElementById('livePageIndicator');
  const btnLiveAddPhoto = document.getElementById('btnLiveAddPhoto');
  const btnLiveAddPage = document.getElementById('btnLiveAddPage');
  const btnLiveManageMenu = document.getElementById('btnLiveManageMenu');
  const btnLiveEditProfile = document.getElementById('btnLiveEditProfile');
  const btnLiveSaveAll = document.getElementById('btnLiveSaveAll');
  const btnLiveLogout = document.getElementById('btnLiveLogout');
  const liveToast = document.getElementById('liveToast');

  // Modal Login Discreto
  const secretAdminTrigger = document.getElementById('secretAdminTrigger');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
  const inlineLoginForm = document.getElementById('inlineLoginForm');
  const inlineAdminPassword = document.getElementById('inlineAdminPassword');
  const inlineLoginError = document.getElementById('inlineLoginError');
  const btnSubmitInlineLogin = document.getElementById('btnSubmitInlineLogin');

  // Modal Upload Inline
  const inlineUploadModal = document.getElementById('inlineUploadModal');
  const closeInlineUploadModal = document.getElementById('closeInlineUploadModal');
  const inlineUploadDropzone = document.getElementById('inlineUploadDropzone');
  const inlineFileInput = document.getElementById('inlineFileInput');
  const inlineUploadProgress = document.getElementById('inlineUploadProgress');

  // Modal Menu Inline
  const inlineMenuModal = document.getElementById('inlineMenuModal');
  const closeInlineMenuModal = document.getElementById('closeInlineMenuModal');
  const inlineMenuList = document.getElementById('inlineMenuList');
  const btnInlineAddMenuItem = document.getElementById('btnInlineAddMenuItem');
  const btnInlineSaveMenu = document.getElementById('btnInlineSaveMenu');

  // -------------------------------------------------------------
  // INICIALIZAÇÃO
  // -------------------------------------------------------------
  async function init() {
    setupLangSwitcher();
    setupMobileMenu();
    setupSecretLock();
    setupLiveModals();
    await fetchSiteData();
    await checkAdminAuth();
    setupRouter();
    renderCurrentRoute();
  }

  // -------------------------------------------------------------
  // SELETOR DE IDIOMAS
  // -------------------------------------------------------------
  function setupLangSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === currentLang);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selected = btn.getAttribute('data-lang');
        if (selected && selected !== currentLang) {
          currentLang = selected;
          localStorage.setItem('site_lang', currentLang);

          langBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === currentLang));

          updateGlobalInfo();
          renderNavigation();
          renderCurrentRoute();
        }
      });
    });
  }

  // -------------------------------------------------------------
  // AUTENTICAÇÃO DO ADMIN DISCRETO
  // -------------------------------------------------------------
  function setupSecretLock() {
    if (secretAdminTrigger) {
      secretAdminTrigger.addEventListener('click', () => {
        if (isLiveAdmin) {
          showLiveToast('Você já está no modo de edição visual!', 'success');
          return;
        }
        adminLoginModal.style.display = 'flex';
        inlineAdminPassword.value = '';
        inlineLoginError.textContent = '';
        inlineAdminPassword.focus();
      });
    }

    if (closeAdminLoginModal) {
      closeAdminLoginModal.addEventListener('click', () => {
        adminLoginModal.style.display = 'none';
      });
    }

    if (inlineLoginForm) {
      inlineLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = inlineAdminPassword.value;
        btnSubmitInlineLogin.disabled = true;
        btnSubmitInlineLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
        inlineLoginError.textContent = '';

        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          const data = await res.json();
          if (data.success && data.token) {
            localStorage.setItem('adm_token', data.token);
            isLiveAdmin = true;
            adminLoginModal.style.display = 'none';
            enableLiveEditorUI();
            renderCurrentRoute();
            showLiveToast('Modo de Edição Visual Ativado! Clique nos textos ou fotos para editar ao vivo.', 'success');
          } else {
            inlineLoginError.textContent = data.message || 'Senha incorreta.';
          }
        } catch (err) {
          inlineLoginError.textContent = 'Erro ao conectar ao servidor.';
        } finally {
          btnSubmitInlineLogin.disabled = false;
          btnSubmitInlineLogin.innerHTML = '<span>Acessar Modo Edição</span><i class="fa-solid fa-arrow-right"></i>';
        }
      });
    }

    if (btnLiveLogout) {
      btnLiveLogout.addEventListener('click', () => {
        localStorage.removeItem('adm_token');
        isLiveAdmin = false;
        disableLiveEditorUI();
        renderCurrentRoute();
        showLiveToast('Sessão encerrada com segurança.', 'success');
      });
    }
  }

  async function checkAdminAuth() {
    const token = localStorage.getItem('adm_token');
    if (!token) {
      isLiveAdmin = false;
      disableLiveEditorUI();
      return;
    }

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        isLiveAdmin = true;
        enableLiveEditorUI();
      } else {
        localStorage.removeItem('adm_token');
        isLiveAdmin = false;
        disableLiveEditorUI();
      }
    } catch (e) {
      isLiveAdmin = false;
      disableLiveEditorUI();
    }
  }

  function enableLiveEditorUI() {
    if (liveAdminToolbar) {
      liveAdminToolbar.style.display = 'flex';
      const badge = liveAdminToolbar.querySelector('.live-badge');
      if (badge) badge.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${t('live_mode_active')}`;
      if (btnLiveAddPhoto) btnLiveAddPhoto.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${t('btn_add_photos')}`;
      if (btnLiveAddPage) btnLiveAddPage.innerHTML = `<i class="fa-solid fa-plus"></i> ${t('btn_new_gallery')}`;
      if (btnLiveManageMenu) btnLiveManageMenu.innerHTML = `<i class="fa-solid fa-bars"></i> ${t('btn_menus')}`;
      if (btnLiveEditProfile) btnLiveEditProfile.innerHTML = `<i class="fa-solid fa-user-gear"></i> ${t('btn_profile_bio')}`;
      if (btnLiveSaveAll) btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-check"></i> ${t('btn_save_changes')}`;
      if (btnLiveLogout) btnLiveLogout.innerHTML = `<i class="fa-solid fa-lock"></i> ${t('btn_logout')}`;
    }
  }

  function disableLiveEditorUI() {
    if (liveAdminToolbar) liveAdminToolbar.style.display = 'none';
  }

  // -------------------------------------------------------------
  // BUSCA DE DADOS & NAVEGAÇÃO
  // -------------------------------------------------------------
  async function fetchSiteData() {
    try {
      const res = await fetch('/api/site');
      siteData = await res.json();
      renderNavigation();
      updateGlobalInfo();
    } catch (err) {
      console.error('Erro ao carregar dados do site:', err);
      mainApp.innerHTML = `<div style="text-align:center; padding: 60px 20px;">
        <h2>Erro ao carregar conteúdo</h2>
        <p>Por favor, tente recarregar a página.</p>
      </div>`;
    }
  }

  function updateGlobalInfo() {
    if (!siteData) return;
    const name = siteData.artistName || 'Max Doe';
    if (siteBrandLogo) siteBrandLogo.textContent = name;
    if (footerCopyright) {
      footerCopyright.innerHTML = `&copy; ${name}. ${t('all_rights_reserved')}`;
    }
  }

  function setupMobileMenu() {
    if (mobileMenuBtn && mainNav) {
      mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const isOpen = mainNav.classList.contains('open');
        mobileMenuBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
      });
    }
  }

  function renderNavigation() {
    if (!siteData || !mainNav) return;
    const currentPath = window.location.pathname;

    let navHtml = '';
    const menuItems = siteData.menu || [
      { title: 'Portfolio', url: '/' },
      { title: 'Services', url: '/services' },
      { title: 'About', url: '/about' },
      { title: 'Contact', url: '/contact' }
    ];

    menuItems.forEach(item => {
      const isActive = (item.url === '/' && currentPath === '/') || (item.url !== '/' && currentPath.startsWith(item.url));
      const translatedTitle = autoTranslate(item.title);
      navHtml += `<a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" data-nav>${translatedTitle}</a>`;
    });

    mainNav.innerHTML = navHtml;

    mainNav.querySelectorAll('a[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');
        navigateTo(url);
        if (mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      });
    });
  }

  function setupRouter() {
    window.addEventListener('popstate', () => renderCurrentRoute());

    document.body.addEventListener('click', (e) => {
      if (e.target.closest('.live-action-btn') || e.target.closest('.admin-modal-backdrop') || e.target.closest('#liveAdminToolbar') || e.target.hasAttribute('contenteditable') || e.target.closest('.lang-switcher')) {
        return;
      }

      const link = e.target.closest('a');
      if (link && link.href && link.host === window.location.host && !link.target && !link.hasAttribute('download') && !link.getAttribute('href').startsWith('/admin')) {
        const path = link.getAttribute('href');
        if (path && (path.startsWith('/') || path.startsWith('#'))) {
          e.preventDefault();
          navigateTo(path);
        }
      }
    });
  }

  function navigateTo(url) {
    if (window.location.pathname !== url) {
      window.history.pushState(null, null, url);
    }
    renderNavigation();
    renderCurrentRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -------------------------------------------------------------
  // RENDERIZADOR DE ROTAS
  // -------------------------------------------------------------
  function renderCurrentRoute() {
    if (!siteData) return;
    const path = window.location.pathname;

    mainApp.classList.add('page-loading');

    if (livePageIndicator) {
      livePageIndicator.textContent = `${t('page_label')} ${path === '/' || path === '/portfolio' ? 'Home' : path.replace('/', '').toUpperCase()}`;
    }

    setTimeout(() => {
      if (path === '/' || path === '/portfolio') {
        renderHomePage();
      } else if (path === '/services') {
        renderServicesPage();
      } else if (path === '/about') {
        renderAboutPage();
      } else if (path === '/contact') {
        renderContactPage();
      } else {
        const page = siteData.pages.find(p => p.url === path);
        if (page) {
          renderGalleryPage(page);
        } else {
          render404Page();
        }
      }

      if (isLiveAdmin) {
        attachLiveInlineEditing(path);
      }

      mainApp.classList.remove('page-loading');
    }, 100);
  }

  // -------------------------------------------------------------
  // 1. PÁGINA HOME (PORTFOLIO)
  // -------------------------------------------------------------
  function renderHomePage() {
    const artistName = siteData.artistName || 'Max Doe';
    const profession = autoTranslate(siteData.profession || 'Visual Artist');
    const bio = siteData.bio || t('default_bio');

    if (pageTitle) pageTitle.textContent = `${artistName} — ${profession}`;

    let portfolioItems = [];
    const homePageData = siteData.pages.find(p => p.url === '/' || p.url === '/portfolio' || p.isStartPage);
    
    if (homePageData && homePageData.sections) {
      const gridSec = homePageData.sections.find(s => s.gallery);
      if (gridSec && gridSec.gallery && gridSec.gallery.items) {
        portfolioItems = gridSec.gallery.items;
      }
    }

    if (portfolioItems.length === 0) {
      siteData.pages
        .filter(p => !p.isStartPage && p.url !== '/' && p.url !== '/services' && p.url !== '/about' && p.url !== '/contact')
        .forEach(p => {
          const galSec = p.sections.find(s => s.gallery);
          const firstImg = (galSec && galSec.gallery.items && galSec.gallery.items[0]) ? galSec.gallery.items[0].src : '/uploads/about.jpg';
          portfolioItems.push({
            id: 'item_' + p.id,
            link: p.url,
            src: firstImg,
            title: p.title,
            subtitle: 'Gallery',
            description: ''
          });
        });
    }

    currentActiveGalleryItems = portfolioItems;

    let cardsHtml = '';
    portfolioItems.forEach((item, index) => {
      const itemTitle = autoTranslate(item.title);
      const itemSubtitle = autoTranslate(item.subtitle || 'Gallery');
      cardsHtml += `
        <div class="project-card fade-in" data-card-index="${index}" data-card-id="${item.id || ''}" ${isLiveAdmin ? 'draggable="true"' : ''}>
          ${isLiveAdmin ? `
            <div class="live-item-controls">
              <button class="live-action-btn btn-move-left" title="Mover para esquerda/cima"><i class="fa-solid fa-arrow-left"></i></button>
              <button class="live-action-btn btn-move-right" title="Mover para direita/baixo"><i class="fa-solid fa-arrow-right"></i></button>
              <button class="live-action-btn btn-delete" title="Remover item"><i class="fa-solid fa-trash"></i></button>
            </div>
          ` : ''}
          <a href="${item.link || '#'}" class="card-img-wrapper" ${isLiveAdmin ? 'onclick="event.preventDefault();"' : ''}>
            <img src="${item.src}" alt="${itemTitle || 'Projeto'}" class="card-img" loading="lazy" />
          </a>
          <div class="card-caption">
            <h3 class="card-title ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-title" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${itemTitle || 'Projeto'}</h3>
            ${item.subtitle || isLiveAdmin ? `<div class="card-subtitle ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-subtitle" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${itemSubtitle}</div>` : ''}
            ${item.description || isLiveAdmin ? `<p class="card-description ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-desc" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${item.description || ''}</p>` : ''}
          </div>
        </div>
      `;
    });

    mainApp.innerHTML = `
      <section class="hero-section">
        <span class="hero-subtitle ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroSubtitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${profession}</span>
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroTitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${artistName}</h1>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroDesc" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${bio}</p>
      </section>

      <section class="portfolio-grid" id="livePortfolioGrid">
        ${cardsHtml}
      </section>

      ${renderSubmenuBigSection([
        { title: 'Services', url: '/services' },
        { title: 'About', url: '/about' },
        { title: 'Contact', url: '/contact' }
      ])}
    `;

    if (isLiveAdmin) {
      setupCardsDragAndDrop('livePortfolioGrid');
    }
  }

  // -------------------------------------------------------------
  // 2. PÁGINA DE GALERIA INDIVIDUAL
  // -------------------------------------------------------------
  function renderGalleryPage(page) {
    const artistName = siteData.artistName || 'Max Doe';
    const translatedPageTitle = autoTranslate(page.title);
    if (pageTitle) pageTitle.textContent = `${translatedPageTitle} — ${artistName}`;

    let title = page.title;
    let description = '';
    let tags = ['Visuals', 'Storytelling', 'Brand'];
    let galleryItems = [];

    page.sections.forEach(sec => {
      if (sec.viewType === 'Text' && sec.elements) {
        const tEl = sec.elements.find(e => e.view === 'header-view');
        const descEl = sec.elements.find(e => e.view === 'longtext-view');
        const listEl = sec.elements.find(e => e.view === 'list-view');

        if (tEl) title = tEl.content;
        if (descEl) description = descEl.content;
        if (listEl && Array.isArray(listEl.content)) {
          tags = listEl.content.map(t => t.Title || t);
        }
      }

      if (sec.gallery && sec.gallery.items) {
        galleryItems = sec.gallery.items;
      }
    });

    currentActiveGalleryItems = galleryItems;

    let tagsHtml = tags.map(tag => `<span class="tag-badge ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(tag)}</span>`).join('');
    
    let galleryGridHtml = '';
    if (galleryItems.length === 0) {
      galleryGridHtml = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #888;">
          <i class="fa-regular fa-image" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
          ${isLiveAdmin ? 'Esta galeria ainda não tem fotos. Clique em <strong>"Adicionar Fotos"</strong> na barra superior para enviar suas obras!' : 'Galeria em construção.'}
        </div>
      `;
    } else {
      galleryItems.forEach((item, index) => {
        const itemTitle = autoTranslate(item.title);
        const itemSubtitle = autoTranslate(item.subtitle || 'Gallery');
        galleryGridHtml += `
          <div class="gallery-item fade-in" data-card-index="${index}" data-card-id="${item.id || ''}" ${isLiveAdmin ? 'draggable="true"' : ''}>
            ${isLiveAdmin ? `
              <div class="live-item-controls">
                <button class="live-action-btn btn-move-left" title="Mover para esquerda/cima"><i class="fa-solid fa-arrow-left"></i></button>
                <button class="live-action-btn btn-move-right" title="Mover para direita/baixo"><i class="fa-solid fa-arrow-right"></i></button>
                <button class="live-action-btn btn-delete" title="Excluir foto"><i class="fa-solid fa-trash"></i></button>
              </div>
            ` : ''}
            <a href="${item.src}" class="gallery-lightbox-trigger" data-lightbox="gallery" data-title="${itemTitle}" data-subtitle="${itemSubtitle}" ${isLiveAdmin ? 'onclick="event.preventDefault();"' : ''}>
              <img src="${item.src}" alt="${itemTitle || 'Foto'}" loading="lazy" />
            </a>
            ${(item.title || item.subtitle || isLiveAdmin) ? `
              <div class="gallery-caption">
                ${item.title || isLiveAdmin ? `<h4 class="item-title ${isLiveAdmin ? 'editable-active' : ''}" data-field="gallery-title" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${itemTitle || 'Título da Obra'}</h4>` : ''}
                ${item.subtitle || isLiveAdmin ? `<span class="item-subtitle ${isLiveAdmin ? 'editable-active' : ''}" data-field="gallery-sub" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${itemSubtitle}</span>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      });
    }

    mainApp.innerHTML = `
      <div class="gallery-page-container">
        <section class="gallery-header-section">
          <h1 class="gallery-title ${isLiveAdmin ? 'editable-active' : ''}" id="livePageTitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(title)}</h1>
          <p class="gallery-description ${isLiveAdmin ? 'editable-active' : ''}" id="livePageDesc" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${description || ''}</p>
          <div class="gallery-tags" id="liveTagsContainer">
            ${tagsHtml}
          </div>
        </section>

        <section class="gallery-grid" id="liveGalleryGrid">
          ${galleryGridHtml}
        </section>

        ${renderSubmenuBigSection([
          { title: 'Portfolio', url: '/' },
          { title: 'Services', url: '/services' },
          { title: 'About', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ])}
      </div>
    `;

    if (isLiveAdmin) {
      setupCardsDragAndDrop('liveGalleryGrid');
    }
  }

  // -------------------------------------------------------------
  // 3. PÁGINA SERVICES
  // -------------------------------------------------------------
  function renderServicesPage() {
    const artistName = siteData.artistName || 'Max Doe';
    if (pageTitle) pageTitle.textContent = `${t('services_title')} — ${artistName}`;

    const services = [
      {
        num: '01',
        title: 'Creative Direction',
        desc: 'Conceptualizing and guiding visual stories across mediums, ensuring cohesive and compelling narratives.'
      },
      {
        num: '02',
        title: 'Illustration & Concept Art',
        desc: 'Creating custom visual worlds, characters, and environments for games, film, and editorial projects.'
      },
      {
        num: '03',
        title: 'Sculpture & Digital 3D',
        desc: 'Translating traditional tactile sculpting into high-resolution digital 3D models and installations.'
      },
      {
        num: '04',
        title: 'Brand Identity & Visuals',
        desc: 'Crafting distinct identities and artistic assets for brands that want to stand out with authentic artistry.'
      }
    ];

    const servicesHtml = services.map(s => `
      <div class="service-card fade-in">
        <span class="service-number">${s.num}</span>
        <h3 class="service-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(s.title)}</h3>
        <p class="service-description ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${s.desc}</p>
      </div>
    `).join('');

    mainApp.innerHTML = `
      <div class="services-container">
        <section class="hero-section">
          <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${t('services_title')}</h1>
        </section>

        <section class="services-grid">
          ${servicesHtml}
        </section>

        <section class="quote-section fade-in">
          <span class="quote-icon"><i class="fa-solid fa-quote-left"></i></span>
          <p class="quote-text ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${t('services_quote')}</p>
          <div class="quote-author">
            <strong class="${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>James Henry</strong>
            <span class="${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>Story Well</span>
          </div>
        </section>

        ${renderSubmenuBigSection([
          { title: 'Portfolio', url: '/' },
          { title: 'About', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ])}
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 4. PÁGINA ABOUT
  // -------------------------------------------------------------
  function renderAboutPage() {
    const artistName = siteData.artistName || 'Max Doe';
    const profession = autoTranslate(siteData.profession || 'Visual Artist');
    if (pageTitle) pageTitle.textContent = `${t('about_title')} — ${artistName}`;

    const recognition = [
      { title: 'Design Week', sub: 'Profiled' },
      { title: 'Awwwards', sub: 'Web design' },
      { title: 'Red Dot Award', sub: 'Product design' }
    ];

    const clients = [
      { title: 'Spotify', sub: '2025' },
      { title: 'IKEA', sub: '2025' },
      { title: 'Portfoliobox', sub: '2024' },
      { title: 'Volvo', sub: '2024' },
      { title: 'ICA', sub: '2024' }
    ];

    const recognitionHtml = recognition.map(r => `
      <li class="about-list-item">
        <span class="item-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${r.title}</span>
        <span class="item-subtitle ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${r.sub}</span>
      </li>
    `).join('');

    const clientsHtml = clients.map(c => `
      <li class="about-list-item">
        <span class="item-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${c.title}</span>
        <span class="item-subtitle ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${c.sub}</span>
      </li>
    `).join('');

    mainApp.innerHTML = `
      <div class="about-container">
        <div class="about-avatar-wrapper fade-in">
          <img src="${siteData.avatar || '/uploads/about.jpg'}" alt="${artistName}" />
        </div>
        
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutArtistName" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${artistName}</h1>
        <span class="hero-subtitle ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutProfession" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${profession}</span>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutBio" style="margin-top: 25px;" ${isLiveAdmin ? 'contenteditable="true"' : ''}>
          ${siteData.aboutLongBio || siteData.bio || 'My work explores the quiet rhythm between light, texture, and human presence.'}
        </p>

        <section class="about-columns-section">
          <div class="about-column fade-in">
            <h2 class="about-col-title">${t('recognition')}</h2>
            <ul class="about-list">
              ${recognitionHtml}
            </ul>
          </div>
          <div class="about-column fade-in">
            <h2 class="about-col-title">${t('selected_clients')}</h2>
            <ul class="about-list">
              ${clientsHtml}
            </ul>
          </div>
        </section>

        ${renderSubmenuBigSection([
          { title: 'Portfolio', url: '/' },
          { title: 'Services', url: '/services' },
          { title: 'Contact', url: '/contact' }
        ])}
      </div>
    `;
  }

  // -------------------------------------------------------------
  // 5. PÁGINA CONTACT
  // -------------------------------------------------------------
  function renderContactPage() {
    const artistName = siteData.artistName || 'Max Doe';
    if (pageTitle) pageTitle.textContent = `${t('contact_title')} — ${artistName}`;

    const socialLinks = siteData.socialLinks || [
      { name: 'Instagram', url: 'https://www.instagram.com/portfoliobox', icon: 'instagram' },
      { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
      { name: 'Facebook', url: '', icon: 'facebook' },
      { name: 'LinkedIn', url: '', icon: 'linkedin' }
    ];

    let socialIconsHtml = socialLinks
      .filter(s => s.url)
      .map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="${s.name}"><i class="fa-brands fa-${s.icon}"></i></a>`)
      .join('');

    mainApp.innerHTML = `
      <div class="contact-container">
        <section class="hero-section">
          <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${t('contact_title')}</h1>
          <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>
            ${t('contact_desc')}
          </p>
        </section>

        <form id="contactForm" class="contact-form fade-in">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">${t('first_name_label')}</label>
              <input type="text" id="firstName" name="firstName" required placeholder="${t('first_name_placeholder')}" />
            </div>
            <div class="form-group">
              <label for="lastName">${t('last_name_label')}</label>
              <input type="text" id="lastName" name="lastName" placeholder="${t('last_name_placeholder')}" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">${t('email_label')}</label>
            <input type="email" id="email" name="email" required placeholder="${t('email_placeholder')}" />
          </div>

          <div class="form-group">
            <label for="message">${t('message_label')}</label>
            <textarea id="message" name="message" rows="5" required placeholder="${t('message_placeholder')}"></textarea>
          </div>

          <button type="submit" class="form-btn" id="contactSubmitBtn">${t('btn_send_message')}</button>
          <div id="contactFormStatus" style="margin-top: 15px; font-weight: 600;"></div>
        </form>

        <div class="contact-info-block fade-in">
          <p><strong class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactName" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${artistName}</strong></p>
          <p class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactAddress" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.address || 'Gustavslundsv 99, 167 51 BROMMA'}</p>
          <p>${t('phone_label')} <span class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactPhone" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.phone || '+46 70 11 22 33'}</span></p>
          <p><span class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactEmail" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.email || 'max.doe@gmail.com'}</span></p>
        </div>

        ${socialIconsHtml ? `<div class="contact-social-icons">${socialIconsHtml}</div>` : ''}
      </div>
    `;

    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactFormStatus');
    const submitBtn = document.getElementById('contactSubmitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = t('sending_message');
      status.textContent = '';

      const payload = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        message: form.message.value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          status.style.color = '#27ae60';
          status.textContent = t('contact_success');
          form.reset();
        } else {
          status.style.color = '#e74c3c';
          status.textContent = result.error || 'Erro ao enviar mensagem.';
        }
      } catch (err) {
        status.style.color = '#e74c3c';
        status.textContent = 'Falha de comunicação com o servidor.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t('btn_send_message');
      }
    });
  }

  // -------------------------------------------------------------
  // 6. PÁGINA 404
  // -------------------------------------------------------------
  function render404Page() {
    mainApp.innerHTML = `
      <div style="text-align: center; padding: 120px 20px;">
        <h1 style="font-size: 3rem; margin-bottom: 20px; font-family: var(--font-heading);">404</h1>
        <p style="color: var(--text-muted); margin-bottom: 30px;">Página não encontrada.</p>
        <a href="/" class="form-btn" style="display: inline-block;">Voltar ao Início</a>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // HELPER SUBMENU BIG (LET'S WORK TOGETHER)
  // -------------------------------------------------------------
  function renderSubmenuBigSection(links) {
    let linksHtml = '';
    links.forEach(l => {
      const title = autoTranslate(l.title);
      linksHtml += `<a href="${l.url}" class="submenu-big-link">${title}</a>`;
    });

    return `
      <section class="submenu-big-section fade-in">
        <span class="submenu-big-title">${t('work_together')}</span>
        <div class="submenu-big-links">
          ${linksHtml}
        </div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // RECURSOS DA BARRA DE EDIÇÃO VISUAL AO VIVO (WIX STYLE)
  // -------------------------------------------------------------
  function attachLiveInlineEditing(path) {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.addEventListener('input', () => {
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${t('btn_save_changes')} *`;

        const field = el.getAttribute('data-field');
        const index = parseInt(el.getAttribute('data-index'), 10);

        if (!isNaN(index) && currentActiveGalleryItems[index]) {
          if (field === 'card-title' || field === 'gallery-title') currentActiveGalleryItems[index].title = el.innerText;
          if (field === 'card-subtitle' || field === 'gallery-sub') currentActiveGalleryItems[index].subtitle = el.innerText;
          if (field === 'card-desc') currentActiveGalleryItems[index].description = el.innerText;
        }
      });
    });

    document.querySelectorAll('.btn-move-left').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-card-index]');
        const idx = parseInt(card.getAttribute('data-card-index'), 10);
        if (idx > 0) {
          const temp = currentActiveGalleryItems[idx];
          currentActiveGalleryItems[idx] = currentActiveGalleryItems[idx - 1];
          currentActiveGalleryItems[idx - 1] = temp;
          hasPendingChanges = true;
          renderCurrentRoute();
        }
      });
    });

    document.querySelectorAll('.btn-move-right').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-card-index]');
        const idx = parseInt(card.getAttribute('data-card-index'), 10);
        if (idx < currentActiveGalleryItems.length - 1) {
          const temp = currentActiveGalleryItems[idx];
          currentActiveGalleryItems[idx] = currentActiveGalleryItems[idx + 1];
          currentActiveGalleryItems[idx + 1] = temp;
          hasPendingChanges = true;
          renderCurrentRoute();
        }
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-card-index]');
        const idx = parseInt(card.getAttribute('data-card-index'), 10);
        if (confirm('Deseja excluir este item?')) {
          currentActiveGalleryItems.splice(idx, 1);
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast('Item removido! Clique em Salvar Alterações para confirmar.', 'success');
        }
      });
    });
  }

  function setupCardsDragAndDrop(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let draggedEl = null;

    container.querySelectorAll('[draggable="true"]').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedEl = item;
        item.classList.add('live-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.getAttribute('data-card-index'));
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('live-dragging');
        container.querySelectorAll('[draggable="true"]').forEach(c => c.classList.remove('live-drag-over'));
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('live-drag-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('live-drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('live-drag-over');
        if (draggedEl && draggedEl !== item) {
          const fromIdx = parseInt(draggedEl.getAttribute('data-card-index'), 10);
          const toIdx = parseInt(item.getAttribute('data-card-index'), 10);

          const movedItem = currentActiveGalleryItems.splice(fromIdx, 1)[0];
          currentActiveGalleryItems.splice(toIdx, 0, movedItem);

          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast('Nova ordem definida! Clique em "Salvar Alterações" para gravar.', 'success');
        }
      });
    });
  }

  function setupLiveModals() {
    if (btnLiveAddPhoto) {
      btnLiveAddPhoto.onclick = () => {
        inlineUploadProgress.textContent = '';
        inlineUploadModal.style.display = 'flex';
      };
    }

    if (closeInlineUploadModal) {
      closeInlineUploadModal.onclick = () => inlineUploadModal.style.display = 'none';
    }

    if (inlineUploadDropzone) {
      inlineUploadDropzone.onclick = () => inlineFileInput.click();
      inlineFileInput.onchange = () => {
        if (inlineFileInput.files.length > 0) handleInlineFiles(inlineFileInput.files);
      };
      inlineUploadDropzone.ondragover = (e) => {
        e.preventDefault();
        inlineUploadDropzone.style.borderColor = 'var(--accent-color)';
      };
      inlineUploadDropzone.ondragleave = () => {
        inlineUploadDropzone.style.borderColor = '#475569';
      };
      inlineUploadDropzone.ondrop = (e) => {
        e.preventDefault();
        inlineUploadDropzone.style.borderColor = '#475569';
        if (e.dataTransfer.files.length > 0) handleInlineFiles(e.dataTransfer.files);
      };
    }

    if (btnLiveManageMenu) {
      btnLiveManageMenu.onclick = () => openInlineMenuModal();
    }
    if (closeInlineMenuModal) {
      closeInlineMenuModal.onclick = () => inlineMenuModal.style.display = 'none';
    }

    if (btnLiveAddPage) {
      btnLiveAddPage.onclick = () => {
        const title = prompt('Título da nova galeria / página:');
        if (!title) return;
        const urlSlug = prompt('URL amigável (ex: /esculturas):', '/' + title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        if (!urlSlug) return;
        createNewPageLive(title, urlSlug);
      };
    }

    if (btnLiveEditProfile) {
      btnLiveEditProfile.onclick = () => {
        const newArtistName = prompt('Nome do Artista:', siteData.artistName || 'Max Doe');
        if (newArtistName === null) return;
        const newProfession = prompt('Profissão / Título (ex: Visual Artist):', siteData.profession || 'Visual Artist');
        if (newProfession === null) return;
        const newBio = prompt('Mini Bio do cabeçalho:', siteData.bio || '');
        if (newBio === null) return;

        saveProfileDataLive(newArtistName, newProfession, newBio);
      };
    }

    if (btnLiveSaveAll) {
      btnLiveSaveAll.onclick = async () => {
        await saveLiveChanges();
      };
    }
  }

  async function createNewPageLive(title, url) {
    const token = localStorage.getItem('adm_token');
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, url })
      });
      const data = await res.json();
      if (data.success) {
        showLiveToast(`Galeria "${title}" criada com sucesso!`, 'success');
        await fetchSiteData();
        navigateTo(url);
      } else {
        showLiveToast(data.error || 'Erro ao criar página.', 'error');
      }
    } catch (e) {
      showLiveToast('Falha na comunicação com o servidor.', 'error');
    }
  }

  async function saveProfileDataLive(artistName, profession, bio) {
    const token = localStorage.getItem('adm_token');
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ artistName, profession, bio })
      });
      const data = await res.json();
      if (data.success) {
        siteData.artistName = artistName;
        siteData.profession = profession;
        siteData.bio = bio;
        updateGlobalInfo();
        renderCurrentRoute();
        showLiveToast('Perfil e Nome do Artista atualizados com sucesso!', 'success');
      } else {
        showLiveToast(data.error || 'Erro ao atualizar perfil.', 'error');
      }
    } catch (e) {
      showLiveToast('Erro ao conectar com o servidor.', 'error');
    }
  }

  async function handleInlineFiles(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('photos', files[i]);

    const token = localStorage.getItem('adm_token');
    if (!token) {
      inlineUploadProgress.style.color = '#f87171';
      inlineUploadProgress.textContent = 'Você precisa estar logado como administrador para enviar fotos.';
      return;
    }

    inlineUploadProgress.style.color = '#38bdf8';
    inlineUploadProgress.textContent = `Enviando ${files.length} foto(s)...`;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        data = { error: `Erro HTTP ${res.status}: ${res.statusText}` };
      }

      if (res.ok && data.success && data.files) {
        data.files.forEach(f => {
          currentActiveGalleryItems.push({
            id: f.id,
            src: f.src,
            title: '',
            subtitle: 'Gallery',
            description: ''
          });
        });
        inlineUploadModal.style.display = 'none';
        hasPendingChanges = true;
        renderCurrentRoute();
        showLiveToast(`${data.files.length} foto(s) adicionada(s)! Clique em "Salvar Alterações" no topo.`, 'success');
      } else {
        inlineUploadProgress.style.color = '#f87171';
        inlineUploadProgress.textContent = data.error || data.message || `Erro ${res.status}: Falha no upload.`;
        if (res.status === 401) {
          showLiveToast('Sessão expirada. Faça login novamente no cadeado.', 'error');
        }
      }
    } catch (e) {
      inlineUploadProgress.style.color = '#f87171';
      inlineUploadProgress.textContent = `Erro de conexão: ${e.message || 'Verifique a rede'}`;
    } finally {
      inlineFileInput.value = '';
    }
  }

  function openInlineMenuModal() {
    inlineMenuList.innerHTML = '';
    const menu = siteData.menu || [];

    menu.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155;';
      row.innerHTML = `
        <input type="text" class="menu-title-input" value="${item.title}" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <input type="text" class="menu-url-input" value="${item.url}" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <button type="button" class="btn-del-menu" style="background: #ef4444; color: #fff; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector('.btn-del-menu').onclick = () => row.remove();
      inlineMenuList.appendChild(row);
    });

    btnInlineAddMenuItem.onclick = () => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155;';
      row.innerHTML = `
        <input type="text" class="menu-title-input" placeholder="Título do Menu" value="Nova Galeria" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <input type="text" class="menu-url-input" placeholder="/url-da-galeria" value="/nova-galeria" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <button type="button" class="btn-del-menu" style="background: #ef4444; color: #fff; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector('.btn-del-menu').onclick = () => row.remove();
      inlineMenuList.appendChild(row);
    };

    btnInlineSaveMenu.onclick = async () => {
      const rows = inlineMenuList.querySelectorAll('div');
      const newMenu = [];
      rows.forEach(r => {
        const title = r.querySelector('.menu-title-input')?.value?.trim();
        const url = r.querySelector('.menu-url-input')?.value?.trim();
        if (title && url) newMenu.push({ title, url });
      });

      const token = localStorage.getItem('adm_token');
      try {
        const res = await fetch('/api/site', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ menu: newMenu })
        });
        const data = await res.json();
        if (data.success) {
          showLiveToast('Menu e galerias atualizados com sucesso!', 'success');
          inlineMenuModal.style.display = 'none';
          await fetchSiteData();
        }
      } catch (e) {
        showLiveToast('Erro ao salvar menu.', 'error');
      }
    };

    inlineMenuModal.style.display = 'flex';
  }

  // -------------------------------------------------------------
  // SALVAR ALTERAÇÕES VISUAIS DA PÁGINA ATUAL
  // -------------------------------------------------------------
  async function saveLiveChanges() {
    const token = localStorage.getItem('adm_token');
    const path = window.location.pathname;
    btnLiveSaveAll.disabled = true;
    btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('btn_saving')}`;

    try {
      // 1. Se estiver na Home
      if (path === '/' || path === '/portfolio') {
        const heroTitle = document.getElementById('liveHeroTitle')?.innerText || siteData.artistName;
        const heroSubtitle = document.getElementById('liveHeroSubtitle')?.innerText || siteData.profession;
        const heroDesc = document.getElementById('liveHeroDesc')?.innerText || siteData.bio;

        siteData.artistName = heroTitle;
        siteData.profession = heroSubtitle;
        siteData.bio = heroDesc;

        // Atualiza textos gerais do perfil
        await fetch('/api/site', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            artistName: heroTitle,
            profession: heroSubtitle,
            bio: heroDesc
          })
        });

        // Atualiza itens do grid da Home
        await fetch('/api/pages/home/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ items: currentActiveGalleryItems })
        });
      }
      // 2. Se estiver no About
      else if (path === '/about') {
        const artistName = document.getElementById('liveAboutArtistName')?.innerText || siteData.artistName;
        const profession = document.getElementById('liveAboutProfession')?.innerText || siteData.profession;
        const aboutBio = document.getElementById('liveAboutBio')?.innerText || siteData.aboutLongBio;

        siteData.artistName = artistName;
        siteData.profession = profession;
        siteData.aboutLongBio = aboutBio;

        await fetch('/api/site', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            artistName,
            profession,
            aboutLongBio: aboutBio
          })
        });
      }
      // 3. Se estiver no Contact
      else if (path === '/contact') {
        const name = document.getElementById('liveContactName')?.innerText || siteData.artistName;
        const address = document.getElementById('liveContactAddress')?.innerText || siteData.address;
        const phone = document.getElementById('liveContactPhone')?.innerText || siteData.phone;
        const email = document.getElementById('liveContactEmail')?.innerText || siteData.email;

        siteData.artistName = name;
        siteData.address = address;
        siteData.phone = phone;
        siteData.email = email;

        await fetch('/api/site', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ artistName: name, address, phone, email })
        });
      }
      // 4. Se for uma Galeria de Projeto
      else {
        const cleanUrl = path.replace('/', '');
        const pageTitle = document.getElementById('livePageTitle')?.innerText;
        const pageDesc = document.getElementById('livePageDesc')?.innerText;
        const tags = Array.from(document.querySelectorAll('#liveTagsContainer .tag-badge')).map(t => t.innerText.trim()).filter(Boolean);

        // Atualiza textos da galeria
        await fetch(`/api/pages/${cleanUrl}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            title: pageTitle,
            description: pageDesc,
            tags: tags
          })
        });

        // Atualiza fotos da galeria
        await fetch(`/api/pages/${cleanUrl}/items`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ items: currentActiveGalleryItems })
        });
      }

      hasPendingChanges = false;
      showLiveToast('Todas as alterações visuais foram salvas com sucesso!', 'success');
      updateGlobalInfo();
      await fetchSiteData();
    } catch (e) {
      showLiveToast('Erro ao salvar alterações.', 'error');
    } finally {
      btnLiveSaveAll.disabled = false;
      btnLiveSaveAll.style.background = '#10b981';
      btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-check"></i> ${t('btn_save_changes')}`;
    }
  }

  // -------------------------------------------------------------
  // TOAST FEEDBACK VISUAL
  // -------------------------------------------------------------
  function showLiveToast(msg, type = 'success') {
    if (!liveToast) return;
    liveToast.textContent = msg;
    liveToast.className = `live-toast show ${type}`;
    setTimeout(() => {
      liveToast.classList.remove('show');
    }, 4000);
  }

  window.addEventListener('DOMContentLoaded', init);
})();

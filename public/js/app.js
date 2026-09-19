/* ==========================================================================
   APP.JS - CLIENT-SIDE SPA ROUTING & WIX-STYLE LIVE VISUAL CMS
   ========================================================================== */

(function () {
  let siteData = null;
  let isLiveAdmin = false;
  let hasPendingChanges = false;
  let currentActiveGalleryItems = [];

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
    setupMobileMenu();
    setupSecretLock();
    setupLiveModals();
    await fetchSiteData();
    await checkAdminAuth();
    setupRouter();
    renderCurrentRoute();
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
    if (liveAdminToolbar) liveAdminToolbar.style.display = 'flex';
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
    if (siteBrandLogo) siteBrandLogo.textContent = siteData.artistName || siteData.title || 'Max Doe';
    if (footerCopyright) footerCopyright.innerHTML = `&copy; ${siteData.artistName || 'Max Doe'}. Todos os direitos reservados.`;
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
      navHtml += `<a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" data-nav>${item.title}</a>`;
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
      // Se clicou em botão ou elemento com contenteditable ou modal, não interfere
      if (e.target.closest('.live-action-btn') || e.target.closest('.admin-modal-backdrop') || e.target.closest('#liveAdminToolbar') || e.target.hasAttribute('contenteditable')) {
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
    if (window.location.pathname === url) return;
    window.history.pushState(null, '', url);
    renderCurrentRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO DA ROTA ATUAL
  // -------------------------------------------------------------
  function renderCurrentRoute() {
    if (!siteData) return;
    const path = window.location.pathname;

    renderNavigation();

    if (livePageIndicator) {
      livePageIndicator.textContent = `Página: ${path === '/' ? 'Portfolio (Home)' : path}`;
    }

    mainApp.classList.add('page-loading');

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

      // Se estiver no modo admin, torna elementos editáveis ao vivo
      if (isLiveAdmin) {
        attachLiveInlineEditing(path);
      }

      mainApp.classList.remove('page-loading');
    }, 120);
  }

  // -------------------------------------------------------------
  // 1. PÁGINA HOME (PORTFOLIO)
  // -------------------------------------------------------------
  function renderHomePage() {
    if (pageTitle) pageTitle.textContent = `${siteData.artistName || 'Max Doe'} — ${siteData.profession || 'Visual Artist'}`;

    const homePageData = siteData.pages.find(p => p.url === '/' || p.url === '/portfolio' || p.isStartPage);
    let heroTitle = siteData.artistName || 'Max Doe';
    let heroSubtitle = siteData.profession || 'Visual Artist';
    let heroDesc = siteData.bio || 'I believe in design that feels, not just functions.';
    let portfolioItems = [];

    if (homePageData && homePageData.sections) {
      const textSec = homePageData.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const tEl = textSec.elements.find(e => e.view === 'header-view');
        const subEl = textSec.elements.find(e => e.view === 'shorttext-view');
        const descEl = textSec.elements.find(e => e.view === 'longtext-view');
        if (tEl) heroTitle = tEl.content;
        if (subEl) heroSubtitle = subEl.content;
        if (descEl) heroDesc = descEl.content;
      }

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
            <img src="${item.src}" alt="${item.title || 'Projeto'}" class="card-img" loading="lazy" />
          </a>
          <div class="card-caption">
            <h3 class="card-title ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-title" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${item.title || 'Projeto'}</h3>
            ${item.subtitle || isLiveAdmin ? `<div class="card-subtitle ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-subtitle" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${item.subtitle || 'Gallery'}</div>` : ''}
            ${item.description || isLiveAdmin ? `<p class="card-description ${isLiveAdmin ? 'editable-active' : ''}" data-field="card-desc" data-index="${index}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${item.description || ''}</p>` : ''}
          </div>
        </div>
      `;
    });

    mainApp.innerHTML = `
      <section class="hero-section">
        <span class="hero-subtitle ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroSubtitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${heroSubtitle}</span>
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroTitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${heroTitle}</h1>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="liveHeroDesc" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${heroDesc}</p>
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
    if (pageTitle) pageTitle.textContent = `${page.title} — ${siteData.artistName || 'Max Doe'}`;

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

    let tagsHtml = tags.map(tag => `<span class="tag-badge ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${tag}</span>`).join('');
    
    let galleryHtml = '';
    galleryItems.forEach((item, index) => {
      galleryHtml += `
        <div class="gallery-item fade-in" data-gallery-index="${index}" data-gallery-id="${item.id || ''}" ${isLiveAdmin ? 'draggable="true"' : ''}>
          ${isLiveAdmin ? `
            <div class="live-item-controls">
              <button class="live-action-btn btn-move-left" title="Mover para trás"><i class="fa-solid fa-arrow-left"></i></button>
              <button class="live-action-btn btn-move-right" title="Mover para frente"><i class="fa-solid fa-arrow-right"></i></button>
              <button class="live-action-btn btn-delete" title="Excluir foto"><i class="fa-solid fa-trash"></i></button>
            </div>
          ` : ''}
          <img src="${item.src}" alt="${item.title || title}" loading="lazy" />
          <div class="overlay-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
        </div>
      `;
    });

    mainApp.innerHTML = `
      <section class="hero-section">
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="livePageTitle" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${title}</h1>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="livePageDesc" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${description ? description.replace(/\n/g, '<br>') : (isLiveAdmin ? 'Clique aqui para adicionar uma descrição à galeria...' : '')}</p>
        <div class="tags-container" id="liveTagsContainer">${tagsHtml}</div>
      </section>

      <section class="gallery-grid" id="projectGalleryGrid">
        ${galleryHtml}
      </section>

      ${renderSubmenuBigSection([
        { title: 'Portfolio', url: '/' },
        { title: 'Services', url: '/services' },
        { title: 'About', url: '/about' }
      ])}
    `;

    // Vincular Lightbox aos itens da galeria (se não estiver em modo edição)
    const itemsDom = mainApp.querySelectorAll('#projectGalleryGrid .gallery-item');
    itemsDom.forEach(el => {
      el.addEventListener('click', (e) => {
        if (isLiveAdmin && e.target.closest('.live-item-controls')) return;
        const idx = parseInt(el.getAttribute('data-gallery-index'), 10);
        if (window.lightboxInstance) {
          window.lightboxInstance.open(galleryItems, idx);
        }
      });
    });

    if (isLiveAdmin) {
      setupCardsDragAndDrop('projectGalleryGrid');
    }
  }

  // -------------------------------------------------------------
  // 3. PÁGINA SERVICES
  // -------------------------------------------------------------
  function renderServicesPage() {
    if (pageTitle) pageTitle.textContent = `Services — ${siteData.artistName || 'Max Doe'}`;

    const services = [
      {
        src: '/uploads/dreamlike-walkers.jpg',
        title: 'Commissioned Paintings',
        subtitle: 'Private & Public Collections',
        desc: 'Bespoke works developed through conversation and site context. Each painting is an exploration of space, light, and emotion tailored to the environment it will inhabit.'
      },
      {
        src: '/uploads/no-print-simplifi-465099.jpg',
        title: 'Limited Edition Prints',
        subtitle: 'Studios & Collectors',
        desc: 'A curated selection of hand-printed and mixed-media works produced in small runs, signed and numbered. Each print carries the trace of process — ink, pressure, and imperfection.'
      },
      {
        src: '/uploads/layered-floral-design.jpg',
        title: 'Collaborative Projects',
        subtitle: 'Architects & Designers',
        desc: 'Custom artworks and visual concepts developed for spatial or design contexts — murals, large-scale prints, and series responding to architecture and material environments.'
      }
    ];

    let servicesHtml = services.map(s => `
      <div class="service-card fade-in">
        <div class="card-img-wrapper">
          <img src="${s.src}" alt="${s.title}" class="card-img" />
        </div>
        <h3 class="service-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${s.title}</h3>
        <div class="service-subtitle ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${s.subtitle}</div>
        <p class="service-desc ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${s.desc}</p>
      </div>
    `).join('');

    mainApp.innerHTML = `
      <div class="services-container">
        <section class="hero-section">
          <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>Services</h1>
        </section>

        <section class="services-grid">
          ${servicesHtml}
        </section>

        <section class="quote-section fade-in">
          <span class="quote-icon"><i class="fa-solid fa-quote-left"></i></span>
          <p class="quote-text ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>“A smooth and professional experience from start to finish. Clear communication, strong ideas, and a result that exceeded expectations.”</p>
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
    if (pageTitle) pageTitle.textContent = `About — ${siteData.artistName || 'Max Doe'}`;

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
          <img src="${siteData.avatar || '/uploads/about.jpg'}" alt="${siteData.artistName || 'Max Doe'}" />
        </div>
        
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutArtistName" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.artistName || 'Max Doe'}</h1>
        <span class="hero-subtitle ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutProfession" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.profession || 'Visual Artist'}</span>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutBio" style="margin-top: 25px;" ${isLiveAdmin ? 'contenteditable="true"' : ''}>
          ${siteData.aboutLongBio || siteData.bio || 'My work explores the quiet rhythm between light, texture, and human presence.'}
        </p>

        <section class="about-columns-section">
          <div class="about-column fade-in">
            <h2 class="about-col-title">Recognition</h2>
            <ul class="about-list">
              ${recognitionHtml}
            </ul>
          </div>
          <div class="about-column fade-in">
            <h2 class="about-col-title">Selected Clients</h2>
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
    if (pageTitle) pageTitle.textContent = `Contact — ${siteData.artistName || 'Max Doe'}`;

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
          <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>Contact</h1>
          <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>
            I’m always happy to connect. Reach out with questions, ideas, or project inquiries, and I’ll get back to you as soon as possible.
          </p>
        </section>

        <form id="contactForm" class="contact-form fade-in">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" required placeholder="Seu nome" />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" placeholder="Sobrenome" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Your Email</label>
            <input type="email" id="email" name="email" required placeholder="exemplo@email.com" />
          </div>

          <div class="form-group">
            <label for="message">Your Message</label>
            <textarea id="message" name="message" rows="5" required placeholder="Como posso te ajudar?"></textarea>
          </div>

          <button type="submit" class="form-btn" id="contactSubmitBtn">Submit</button>
          <div id="contactFormStatus" style="margin-top: 15px; font-weight: 600;"></div>
        </form>

        <div class="contact-info-block fade-in">
          <p><strong class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactName" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.artistName || 'Max Doe'}</strong></p>
          <p class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactAddress" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.address || 'Gustavslundsv 99, 167 51 BROMMA'}</p>
          <p>Phone: <span class="${isLiveAdmin ? 'editable-active' : ''}" id="liveContactPhone" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${siteData.phone || '+46 70 11 22 33'}</span></p>
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
      submitBtn.textContent = 'Enviando...';
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
          status.textContent = result.message || 'Mensagem enviada com sucesso!';
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
        submitBtn.textContent = 'Submit';
      }
    });
  }

  function renderSubmenuBigSection(links) {
    const linksHtml = links.map(l => `
      <a href="${l.url}" class="submenu-big-link">${l.title}</a>
    `).join('');

    return `
      <section class="submenu-big-section fade-in">
        <div class="submenu-big-subtitle">Let's work together</div>
        <div class="submenu-big-links">
          ${linksHtml}
        </div>
      </section>
    `;
  }

  function render404Page() {
    mainApp.innerHTML = `
      <section class="hero-section">
        <h1 class="hero-title">404</h1>
        <p class="hero-desc">Página não encontrada.</p>
        <a href="/" style="margin-top: 30px;" class="form-btn">Voltar para o Início</a>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // WIX-STYLE LIVE EDITING & DRAG & DROP LOGIC
  // -------------------------------------------------------------
  function attachLiveInlineEditing(currentPath) {
    // Monitora alterações em elementos editáveis
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.addEventListener('input', () => {
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        btnLiveSaveAll.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alterações *';
      });
    });

    // Botões de ação nos itens (Mover / Excluir)
    document.querySelectorAll('.live-item-controls .btn-move-left').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-card-index], [data-gallery-index]');
        const idx = parseInt(card.getAttribute('data-card-index') || card.getAttribute('data-gallery-index'), 10);
        if (idx > 0) {
          const temp = currentActiveGalleryItems[idx];
          currentActiveGalleryItems[idx] = currentActiveGalleryItems[idx - 1];
          currentActiveGalleryItems[idx - 1] = temp;
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast('Item movido para trás. Clique em "Salvar Alterações" para confirmar.', 'success');
        }
      };
    });

    document.querySelectorAll('.live-item-controls .btn-move-right').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-card-index], [data-gallery-index]');
        const idx = parseInt(card.getAttribute('data-card-index') || card.getAttribute('data-gallery-index'), 10);
        if (idx < currentActiveGalleryItems.length - 1) {
          const temp = currentActiveGalleryItems[idx];
          currentActiveGalleryItems[idx] = currentActiveGalleryItems[idx + 1];
          currentActiveGalleryItems[idx + 1] = temp;
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast('Item movido para frente. Clique em "Salvar Alterações" para confirmar.', 'success');
        }
      };
    });

    document.querySelectorAll('.live-item-controls .btn-delete').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Deseja realmente remover esta foto da exibição?')) {
          const card = btn.closest('[data-card-index], [data-gallery-index]');
          const idx = parseInt(card.getAttribute('data-card-index') || card.getAttribute('data-gallery-index'), 10);
          currentActiveGalleryItems.splice(idx, 1);
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast('Foto removida visualmente. Clique em "Salvar Alterações" para gravar.', 'success');
        }
      };
    });
  }

  function setupCardsDragAndDrop(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let draggedEl = null;

    container.querySelectorAll('.project-card, .gallery-item').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedEl = card;
        card.classList.add('live-dragging');
        const fromIdx = card.getAttribute('data-card-index') || card.getAttribute('data-gallery-index');
        e.dataTransfer.setData('text/plain', fromIdx);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('live-dragging');
        container.querySelectorAll('.project-card, .gallery-item').forEach(c => c.classList.remove('live-drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('live-drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('live-drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('live-drag-over');
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIdx = parseInt(card.getAttribute('data-card-index') || card.getAttribute('data-gallery-index'), 10);

        if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
          const item = currentActiveGalleryItems.splice(fromIdx, 1)[0];
          currentActiveGalleryItems.splice(toIdx, 0, item);
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast(`Item reposicionado para #${toIdx + 1}! Clique em "Salvar Alterações" para fixar.`, 'success');
        }
      });
    });
  }

  // -------------------------------------------------------------
  // MODAIS & BOTÕES DA TOOLBAR
  // -------------------------------------------------------------
  function setupLiveModals() {
    // 1. Botão Salvar Todas as Alterações
    if (btnLiveSaveAll) {
      btnLiveSaveAll.onclick = async () => {
        await saveLiveChanges();
      };
    }

    // 2. Botão Adicionar Fotos
    if (btnLiveAddPhoto) {
      btnLiveAddPhoto.onclick = () => {
        inlineUploadModal.style.display = 'flex';
        inlineUploadProgress.textContent = '';
      };
    }
    if (closeInlineUploadModal) {
      closeInlineUploadModal.onclick = () => inlineUploadModal.style.display = 'none';
    }
    if (inlineUploadDropzone) {
      inlineUploadDropzone.onclick = () => inlineFileInput.click();
      inlineUploadDropzone.ondragover = (e) => { e.preventDefault(); inlineUploadDropzone.classList.add('dragover'); };
      inlineUploadDropzone.ondragleave = () => inlineUploadDropzone.classList.remove('dragover');
      inlineUploadDropzone.ondrop = (e) => {
        e.preventDefault();
        inlineUploadDropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleInlineFiles(e.dataTransfer.files);
      };
      inlineFileInput.onchange = () => {
        if (inlineFileInput.files.length > 0) handleInlineFiles(inlineFileInput.files);
      };
    }

    // 3. Botão Nova Galeria
    if (btnLiveAddPage) {
      btnLiveAddPage.onclick = async () => {
        const title = prompt('Digite o título da nova galeria (Ex: "Urban Reflections"):');
        if (!title) return;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const url = prompt('Digite a URL da página:', `/${slug}`);
        if (!url) return;
        const desc = prompt('Digite uma descrição para a nova galeria:', 'Série de obras e estudos visuais.');

        const token = localStorage.getItem('adm_token');
        try {
          const res = await fetch('/api/pages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, url, description: desc, tags: ['Visuals', 'Storytelling', 'Brand'] })
          });
          const data = await res.json();
          if (data.success) {
            showLiveToast(`Galeria "${title}" criada com sucesso!`, 'success');
            await fetchSiteData();
            navigateTo(url);
          } else {
            showLiveToast(data.error || 'Erro ao criar galeria.', 'error');
          }
        } catch (e) {
          showLiveToast('Erro ao criar galeria.', 'error');
        }
      };
    }

    // 4. Botão Gerenciar Menus
    if (btnLiveManageMenu) {
      btnLiveManageMenu.onclick = () => {
        openInlineMenuModal();
      };
    }
    if (closeInlineMenuModal) {
      closeInlineMenuModal.onclick = () => inlineMenuModal.style.display = 'none';
    }

    // 5. Botão Perfil & Bio
    if (btnLiveEditProfile) {
      btnLiveEditProfile.onclick = () => {
        navigateTo('/about');
        showLiveToast('Edite seu nome, slogan ou biografia clicando diretamente nos textos!', 'success');
      };
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
        <input type="text" class="menu-title-input" value="Novo Link" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <input type="text" class="menu-url-input" value="/" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
        <button type="button" class="btn-del-menu" style="background: #ef4444; color: #fff; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector('.btn-del-menu').onclick = () => row.remove();
      inlineMenuList.appendChild(row);
    };

    btnInlineSaveMenu.onclick = async () => {
      const rows = inlineMenuList.querySelectorAll('div');
      const newMenu = [];
      rows.forEach(r => {
        const title = r.querySelector('.menu-title-input').value.trim();
        const url = r.querySelector('.menu-url-input').value.trim();
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
          showLiveToast('Menu atualizado com sucesso!', 'success');
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
    btnLiveSaveAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gravando...';

    try {
      // 1. Se estiver na Home
      if (path === '/' || path === '/portfolio') {
        const heroTitle = document.getElementById('liveHeroTitle')?.innerText || siteData.artistName;
        const heroSubtitle = document.getElementById('liveHeroSubtitle')?.innerText || siteData.profession;
        const heroDesc = document.getElementById('liveHeroDesc')?.innerText || siteData.bio;

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
      await fetchSiteData();
    } catch (e) {
      showLiveToast('Erro ao salvar alterações.', 'error');
    } finally {
      btnLiveSaveAll.disabled = false;
      btnLiveSaveAll.style.background = '#10b981';
      btnLiveSaveAll.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Alterações';
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

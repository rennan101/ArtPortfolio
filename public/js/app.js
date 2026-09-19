/* ==========================================================================
   APP.JS - CLIENT-SIDE SPA ROUTING & RENDERING
   ========================================================================== */

(function () {
  let siteData = null;
  const mainApp = document.getElementById('mainApp');
  const mainNav = document.getElementById('mainNav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteBrandLogo = document.getElementById('siteBrandLogo');
  const pageTitle = document.getElementById('pageTitle');
  const footerCopyright = document.getElementById('footerCopyright');
  const adminQuickBar = document.getElementById('adminQuickBar');
  const adminQuickPage = document.getElementById('adminQuickPage');
  const btnAdminLogout = document.getElementById('btnAdminLogout');

  // Inicialização
  async function init() {
    setupMobileMenu();
    setupAdminBar();
    await fetchSiteData();
    setupRouter();
    renderCurrentRoute();
  }

  // Verificar se o usuário está logado como admin
  async function setupAdminBar() {
    const token = localStorage.getItem('adm_token');
    if (!token) {
      if (adminQuickBar) adminQuickBar.style.display = 'none';
      return;
    }

    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        if (adminQuickBar) adminQuickBar.style.display = 'flex';
        if (btnAdminLogout) {
          btnAdminLogout.addEventListener('click', () => {
            localStorage.removeItem('adm_token');
            window.location.reload();
          });
        }
      } else {
        localStorage.removeItem('adm_token');
        if (adminQuickBar) adminQuickBar.style.display = 'none';
      }
    } catch (e) {
      console.warn('Erro ao verificar sessão admin:', e);
    }
  }

  // Menu Mobile Toggle
  function setupMobileMenu() {
    if (mobileMenuBtn && mainNav) {
      mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const isOpen = mainNav.classList.contains('open');
        mobileMenuBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
      });
    }
  }

  // Buscar dados da API
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

  // Atualizar dados globais (Logo, Título, Rodapé)
  function updateGlobalInfo() {
    if (!siteData) return;
    if (siteBrandLogo) siteBrandLogo.textContent = siteData.artistName || siteData.title || 'Max Doe';
    if (footerCopyright) footerCopyright.innerHTML = `&copy; ${siteData.artistName || 'Max Doe'}. Todos os direitos reservados.`;
  }

  // Renderizar itens de navegação do menu
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

    // Vincular cliques para navegação SPA
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

  // Configuração do roteador client-side SPA
  function setupRouter() {
    window.addEventListener('popstate', () => {
      renderCurrentRoute();
    });

    document.body.addEventListener('click', (e) => {
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

  // Renderizar a página da rota atual
  function renderCurrentRoute() {
    if (!siteData) return;
    const path = window.location.pathname;

    // Atualizar menu ativo
    renderNavigation();

    // Atualizar barra admin rápida
    if (adminQuickPage) {
      adminQuickPage.textContent = `Página: ${path === '/' ? 'Portfolio (Home)' : path}`;
    }

    mainApp.classList.add('page-loading');

    setTimeout(() => {
      // 1. Rota Home / Portfolio
      if (path === '/' || path === '/portfolio') {
        renderHomePage();
      }
      // 2. Rota Services
      else if (path === '/services') {
        renderServicesPage();
      }
      // 3. Rota About
      else if (path === '/about') {
        renderAboutPage();
      }
      // 4. Rota Contact
      else if (path === '/contact') {
        renderContactPage();
      }
      // 5. Rota de Galeria de Projeto Individual
      else {
        const page = siteData.pages.find(p => p.url === path);
        if (page) {
          renderGalleryPage(page);
        } else {
          render404Page();
        }
      }

      mainApp.classList.remove('page-loading');
    }, 150);
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
      // Procura seção de texto
      const textSec = homePageData.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const tEl = textSec.elements.find(e => e.view === 'header-view');
        const subEl = textSec.elements.find(e => e.view === 'shorttext-view');
        const descEl = textSec.elements.find(e => e.view === 'longtext-view');
        if (tEl) heroTitle = tEl.content;
        if (subEl) heroSubtitle = subEl.content;
        if (descEl) heroDesc = descEl.content;
      }

      // Procura grid do portfolio
      const gridSec = homePageData.sections.find(s => s.gallery);
      if (gridSec && gridSec.gallery && gridSec.gallery.items) {
        portfolioItems = gridSec.gallery.items;
      }
    }

    // Se não tiver items explícitos no grid do portfolio, lista as páginas de galeria
    if (portfolioItems.length === 0) {
      siteData.pages
        .filter(p => !p.isStartPage && p.url !== '/' && p.url !== '/services' && p.url !== '/about' && p.url !== '/contact')
        .forEach(p => {
          const galSec = p.sections.find(s => s.gallery);
          const firstImg = (galSec && galSec.gallery.items && galSec.gallery.items[0]) ? galSec.gallery.items[0].src : '/uploads/about.jpg';
          portfolioItems.push({
            link: p.url,
            src: firstImg,
            title: p.title,
            subtitle: 'Gallery',
            description: ''
          });
        });
    }

    let cardsHtml = '';
    portfolioItems.forEach(item => {
      cardsHtml += `
        <a href="${item.link || '#'}" class="project-card fade-in">
          <div class="card-img-wrapper">
            <img src="${item.src}" alt="${item.title || 'Projeto'}" class="card-img" loading="lazy" />
          </div>
          <div class="card-caption">
            <h3 class="card-title">${item.title || 'Projeto'}</h3>
            ${item.subtitle ? `<div class="card-subtitle">${item.subtitle}</div>` : ''}
            ${item.description ? `<p class="card-description">${item.description}</p>` : ''}
          </div>
        </a>
      `;
    });

    mainApp.innerHTML = `
      <section class="hero-section">
        <span class="hero-subtitle">${heroSubtitle}</span>
        <h1 class="hero-title">${heroTitle}</h1>
        <p class="hero-desc">${heroDesc}</p>
      </section>

      <section class="portfolio-grid">
        ${cardsHtml}
      </section>

      ${renderSubmenuBigSection([
        { title: 'Services', url: '/services' },
        { title: 'About', url: '/about' },
        { title: 'Contact', url: '/contact' }
      ])}
    `;
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

    let tagsHtml = tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('');
    
    let galleryHtml = '';
    galleryItems.forEach((item, index) => {
      galleryHtml += `
        <div class="gallery-item fade-in" data-gallery-index="${index}">
          <img src="${item.src}" alt="${item.title || title}" loading="lazy" />
          <div class="overlay-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
        </div>
      `;
    });

    mainApp.innerHTML = `
      <section class="hero-section">
        <h1 class="hero-title">${title}</h1>
        ${description ? `<p class="hero-desc">${description.replace(/\n/g, '<br>')}</p>` : ''}
        ${tags.length > 0 ? `<div class="tags-container">${tagsHtml}</div>` : ''}
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

    // Vincular Lightbox aos itens da galeria
    const itemsDom = mainApp.querySelectorAll('#projectGalleryGrid .gallery-item');
    itemsDom.forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-gallery-index'), 10);
        if (window.lightboxInstance) {
          window.lightboxInstance.open(galleryItems, idx);
        }
      });
    });
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
        <h3 class="service-title">${s.title}</h3>
        <div class="service-subtitle">${s.subtitle}</div>
        <p class="service-desc">${s.desc}</p>
      </div>
    `).join('');

    mainApp.innerHTML = `
      <div class="services-container">
        <section class="hero-section">
          <h1 class="hero-title">Services</h1>
        </section>

        <section class="services-grid">
          ${servicesHtml}
        </section>

        <section class="quote-section fade-in">
          <span class="quote-icon"><i class="fa-solid fa-quote-left"></i></span>
          <p class="quote-text">“A smooth and professional experience from start to finish. Clear communication, strong ideas, and a result that exceeded expectations.”</p>
          <div class="quote-author">
            <strong>James Henry</strong>
            <span>Story Well</span>
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
        <span class="item-title">${r.title}</span>
        <span class="item-subtitle">${r.sub}</span>
      </li>
    `).join('');

    const clientsHtml = clients.map(c => `
      <li class="about-list-item">
        <span class="item-title">${c.title}</span>
        <span class="item-subtitle">${c.sub}</span>
      </li>
    `).join('');

    mainApp.innerHTML = `
      <div class="about-container">
        <div class="about-avatar-wrapper fade-in">
          <img src="${siteData.avatar || '/uploads/about.jpg'}" alt="${siteData.artistName || 'Max Doe'}" />
        </div>
        
        <h1 class="hero-title">${siteData.artistName || 'Max Doe'}</h1>
        <span class="hero-subtitle">${siteData.profession || 'Visual Artist'}</span>
        <p class="hero-desc" style="margin-top: 25px;">
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
          <h1 class="hero-title">Contact</h1>
          <p class="hero-desc">
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
          <p><strong>${siteData.artistName || 'Max Doe'}</strong></p>
          <p>${siteData.address || 'Gustavslundsv 99, 167 51 BROMMA'}</p>
          <p>Phone: ${siteData.phone || '+46 70 11 22 33'}</p>
          <p><a href="mailto:${siteData.email || 'max.doe@gmail.com'}">${siteData.email || 'max.doe@gmail.com'}</a></p>
        </div>

        ${socialIconsHtml ? `<div class="contact-social-icons">${socialIconsHtml}</div>` : ''}
      </div>
    `;

    // Formulário de contato AJAX
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactFormStatus');
    const submitBtn = document.getElementById('contactSubmitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      status.textContent = '';
      status.style.color = '#333333';

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

  // -------------------------------------------------------------
  // 6. SEÇÃO LET'S WORK TOGETHER (SUBMENU BIG)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 7. PÁGINA 404
  // -------------------------------------------------------------
  function render404Page() {
    mainApp.innerHTML = `
      <section class="hero-section">
        <h1 class="hero-title">404</h1>
        <p class="hero-desc">Página não encontrada.</p>
        <a href="/" style="margin-top: 30px;" class="form-btn">Voltar para o Início</a>
      </section>
    `;
  }

  // Inicia a aplicação
  window.addEventListener('DOMContentLoaded', init);
})();

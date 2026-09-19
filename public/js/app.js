/* ==========================================================================
   APP.JS - CLIENT-SIDE SPA ROUTING, MULTI-LANGUAGE (PT-BR, PT-PT, EN),
   SOCIAL LINKS MANAGEMENT & WIX-STYLE LIVE VISUAL CMS
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
      btn_socials: 'Redes Sociais',
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
      btn_socials: 'Redes Sociais',
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
      btn_socials: 'Social Networks',
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

  // Cache local em memória e localStorage para traduções dinâmicas
  const dynamicTranslationCache = {};

  function autoTranslate(text) {
    if (!text || typeof text !== 'string') return text;
    const clean = text.trim().toLowerCase();
    if (lexicon[clean] && lexicon[clean][currentLang]) {
      return lexicon[clean][currentLang];
    }
    // Verifica se já temos tradução em cache local
    const cacheKey = `${currentLang}_${text.trim()}`;
    if (dynamicTranslationCache[cacheKey]) {
      return dynamicTranslationCache[cacheKey];
    }
    const stored = localStorage.getItem(`tr_${cacheKey}`);
    if (stored) {
      dynamicTranslationCache[cacheKey] = stored;
      return stored;
    }
    return text;
  }

  // Função para traduzir elementos de texto arbitrário do usuário em segundo plano
  async function translateDynamicElement(el, originalText) {
    if (!el || !originalText || typeof originalText !== 'string' || originalText.trim().length < 2) return;
    const clean = originalText.trim();
    if (lexicon[clean.toLowerCase()]) return; // Já tratado pelo léxico instantâneo

    const targetLang = currentLang;
    const cacheKey = `${targetLang}_${clean}`;

    if (dynamicTranslationCache[cacheKey]) {
      el.textContent = dynamicTranslationCache[cacheKey];
      return;
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clean,
          target: targetLang
        })
      });
      const data = await res.json();
      const translated = data.translation || data.translatedText;
      if (translated && translated !== clean) {
        dynamicTranslationCache[cacheKey] = translated;
        try { localStorage.setItem(`tr_${cacheKey}`, translated); } catch (e) {}
        if (currentLang === targetLang) {
          el.textContent = translated;
        }
        return;
      }
    } catch (e) {
      // Falha de rede para /api/translate, tenta fallback direto do navegador
    }

    // Fallback direto via cliente caso a API backend esteja indisponível
    try {
      const cleanTarget = targetLang.toLowerCase().startsWith('pt') ? 'pt' : targetLang.toLowerCase();
      const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${cleanTarget}&dt=t&q=${encodeURIComponent(clean)}`;
      const directRes = await fetch(directUrl);
      const directData = await directRes.json();
      if (directData && directData[0]) {
        let directTranslated = directData[0].map(item => item[0]).join('');
        if (targetLang === 'pt-pt') {
          directTranslated = directTranslated
            .replace(/\bcontato\b/gi, 'contacto')
            .replace(/\bcontatos\b/gi, 'contactos')
            .replace(/\bfato\b/gi, 'facto')
            .replace(/\bfatos\b/gi, 'factos')
            .replace(/\bprojeto\b/gi, 'projecto')
            .replace(/\bprojetos\b/gi, 'projectos')
            .replace(/\bequipe\b/gi, 'equipa')
            .replace(/\bequipes\b/gi, 'equipas');
        }
        if (directTranslated && directTranslated !== clean) {
          dynamicTranslationCache[cacheKey] = directTranslated;
          try { localStorage.setItem(`tr_${cacheKey}`, directTranslated); } catch (e) {}
          if (currentLang === targetLang) {
            el.textContent = directTranslated;
          }
        }
      }
    } catch (e2) {}
  }

  // -------------------------------------------------------------
  // SUPORTE E NORMALIZAÇÃO DE REDES SOCIAIS & PLATAFORMAS ACADÊMICAS
  // -------------------------------------------------------------
  const SVG_ICONS = {
    orcid: `<svg viewBox="0 0 256 256" width="1em" height="1em" fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M128 0C57.308 0 0 57.308 0 128c0 70.693 57.308 128 128 128 70.693 0 128-57.307 128-128C256 57.308 198.693 0 128 0zm-41.52 186.2H66.2V73.8h20.28v112.4zm-10.14-128.4c-6.84 0-12.36-5.52-12.36-12.36s5.52-12.36 12.36-12.36c6.84 0 12.36 5.52 12.36 12.36s-5.52 12.36-12.36 12.36zm114.72 65.76c0 35.04-24.96 52.68-54.84 52.68H106.8V73.8h30.84c30.12 0 49.32 17.52 49.32 49.68zm-20.64 0c0-22.92-12.72-33.36-30.84-33.36h-8.88v66.72h8.88c18.12 0 30.84-10.44 30.84-33.36z"/></svg>`,
    cienciavitae: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -0.125em;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 10l2 2 4-4"></path><path d="M9 6h6"></path></svg>`
  };

  const SOCIAL_PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', prefix: 'https://instagram.com/' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', prefix: 'https://wa.me/' },
    { id: 'orcid', name: 'ORCID', icon: 'orcid', prefix: 'https://orcid.org/' },
    { id: 'cienciavitae', name: 'Ciência Vitae', icon: 'cienciavitae', prefix: 'https://cienciavitae.pt/portal/id/' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', prefix: 'https://linkedin.com/in/' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', prefix: 'https://facebook.com/' },
    { id: 'x-twitter', name: 'Twitter / X', icon: 'x-twitter', prefix: 'https://x.com/' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', prefix: 'https://youtube.com/@' },
    { id: 'tiktok', name: 'TikTok', icon: 'tiktok', prefix: 'https://tiktok.com/@' },
    { id: 'behance', name: 'Behance', icon: 'behance', prefix: 'https://behance.net/' },
    { id: 'artstation', name: 'ArtStation', icon: 'artstation', prefix: 'https://artstation.com/' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', prefix: 'https://pinterest.com/' },
    { id: 'github', name: 'GitHub', icon: 'github', prefix: 'https://github.com/' }
  ];

  function formatSocialUrl(network, url) {
    if (!url) return '';
    let clean = url.trim();
    const netLower = (network || '').toLowerCase();
    if (netLower === 'whatsapp') {
      if (!clean.startsWith('http')) {
        const digits = clean.replace(/[^0-9]/g, '');
        return digits ? `https://wa.me/${digits}` : clean;
      }
      return clean;
    }
    if (netLower === 'instagram') {
      if (clean.startsWith('@')) return `https://instagram.com/${clean.replace('@', '')}`;
      if (!clean.startsWith('http') && !clean.includes('/')) return `https://instagram.com/${clean}`;
    }
    if (netLower === 'orcid') {
      if (!clean.startsWith('http')) {
        const cleanId = clean.replace(/^orcid\.org\//i, '').trim();
        return `https://orcid.org/${cleanId}`;
      }
      return clean;
    }
    if (netLower === 'cienciavitae' || netLower === 'ciencia vitae') {
      if (!clean.startsWith('http')) {
        return `https://cienciavitae.pt/portal/id/${clean}`;
      }
      return clean;
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      return `https://${clean}`;
    }
    return clean;
  }

  function getSocialIconMarkup(iconName) {
    if (!iconName) return '<i class="fa-solid fa-link"></i>';
    const lower = iconName.toLowerCase();
    if (lower === 'orcid' && SVG_ICONS.orcid) return SVG_ICONS.orcid;
    if ((lower === 'cienciavitae' || lower === 'ciencia vitae') && SVG_ICONS.cienciavitae) return SVG_ICONS.cienciavitae;
    if (lower === 'twitter' || lower === 'x' || lower === 'x-twitter') return '<i class="fa-brands fa-x-twitter"></i>';
    if (lower === 'facebook') return '<i class="fa-brands fa-facebook"></i>';
    return `<i class="fa-brands fa-${lower}"></i>`;
  }

  // Elementos Principais do DOM
  const mainApp = document.getElementById('mainApp');
  const mainNav = document.getElementById('mainNav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteBrandLogo = document.getElementById('siteBrandLogo');
  const pageTitle = document.getElementById('pageTitle');
  const footerCopyright = document.getElementById('footerCopyright');
  const footerSocialIcons = document.getElementById('footerSocialIcons');
  
  // Toolbar de Edição Visual (Wix-Style)
  const liveAdminToolbar = document.getElementById('liveAdminToolbar');
  const livePageIndicator = document.getElementById('livePageIndicator');
  const btnLiveAddPhoto = document.getElementById('btnLiveAddPhoto');
  const btnLiveAddPage = document.getElementById('btnLiveAddPage');
  const btnLiveManageMenu = document.getElementById('btnLiveManageMenu');
  const btnLiveManageSocial = document.getElementById('btnLiveManageSocial');
  const btnLiveEditProfile = document.getElementById('btnLiveEditProfile');
  const btnLiveOpenDrawer = document.getElementById('btnLiveOpenDrawer');
  const btnLiveAddSectionAbout = document.getElementById('btnLiveAddSectionAbout');
  const btnLiveSaveAll = document.getElementById('btnLiveSaveAll');
  const btnLiveLogout = document.getElementById('btnLiveLogout');
  const liveToast = document.getElementById('liveToast');

  // Drawer Lateral de Texto e Tipografia
  const liveTextDrawer = document.getElementById('liveTextDrawer');
  const closeLiveTextDrawer = document.getElementById('closeLiveTextDrawer');
  const drawerTargetIndicator = document.getElementById('drawerTargetIndicator');
  const drawerFontFamily = document.getElementById('drawerFontFamily');
  const drawerFontSizeRange = document.getElementById('drawerFontSizeRange');
  const drawerFontSizeValue = document.getElementById('drawerFontSizeValue');
  const btnToggleBold = document.getElementById('btnToggleBold');
  const btnToggleItalic = document.getElementById('btnToggleItalic');
  const btnToggleUnderline = document.getElementById('btnToggleUnderline');
  const btnToggleUppercase = document.getElementById('btnToggleUppercase');
  const btnAlignLeft = document.getElementById('btnAlignLeft');
  const btnAlignCenter = document.getElementById('btnAlignCenter');
  const btnAlignRight = document.getElementById('btnAlignRight');
  const drawerTextColor = document.getElementById('drawerTextColor');
  const drawerTextColorLabel = document.getElementById('drawerTextColorLabel');
  const btnInsertBigTitle = document.getElementById('btnInsertBigTitle');
  const btnInsertSubTitle = document.getElementById('btnInsertSubTitle');
  const btnInsertLongText = document.getElementById('btnInsertLongText');
  const btnInsertSmallText = document.getElementById('btnInsertSmallText');
  const btnInsertDividerLine = document.getElementById('btnInsertDividerLine');
  const btnInsertAccentDivider = document.getElementById('btnInsertAccentDivider');
  const btnInsertGridSpacer = document.getElementById('btnInsertGridSpacer');
  const gridColumnsSelect = document.getElementById('gridColumnsSelect');
  const gridGapRange = document.getElementById('gridGapRange');
  const gridGapValue = document.getElementById('gridGapValue');
  const contactReceiverEmailInput = document.getElementById('contactReceiverEmailInput');
  const btnSaveReceiverEmail = document.getElementById('btnSaveReceiverEmail');
  const globalHeadingFont = document.getElementById('globalHeadingFont');
  const globalBodyFont = document.getElementById('globalBodyFont');
  const drawerSelectedActions = document.getElementById('drawerSelectedActions');
  const btnDeleteSelectedBlock = document.getElementById('btnDeleteSelectedBlock');

  // Elemento de texto atualmente em foco/seleção para o Drawer
  let currentSelectedTextEl = null;

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

  // Modal Redes Sociais Inline
  const inlineSocialModal = document.getElementById('inlineSocialModal');
  const closeInlineSocialModal = document.getElementById('closeInlineSocialModal');
  const inlineSocialList = document.getElementById('inlineSocialList');
  const btnInlineAddSocialItem = document.getElementById('btnInlineAddSocialItem');
  const btnInlineSaveSocial = document.getElementById('btnInlineSaveSocial');

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
      if (btnLiveManageSocial) btnLiveManageSocial.innerHTML = `<i class="fa-solid fa-share-nodes"></i> ${t('btn_socials')}`;
      if (btnLiveEditProfile) btnLiveEditProfile.innerHTML = `<i class="fa-solid fa-user-gear"></i> ${t('btn_profile_bio')}`;
      if (btnLiveSaveAll) {
        btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-check"></i>`;
        btnLiveSaveAll.title = t('btn_save_changes');
      }
      if (btnLiveLogout) {
        btnLiveLogout.innerHTML = `<i class="fa-solid fa-lock"></i>`;
        btnLiveLogout.title = t('btn_logout');
      }
    }
  }

  function disableLiveEditorUI() {
    if (liveAdminToolbar) liveAdminToolbar.style.display = 'none';
  }

  function applyCustomStyles() {
    if (!siteData || !siteData.customStyles) return;
    const styles = siteData.customStyles;
    if (styles.headingFont) {
      document.documentElement.style.setProperty('--font-heading', styles.headingFont);
      if (globalHeadingFont) globalHeadingFont.value = styles.headingFont;
    }
    if (styles.bodyFont) {
      document.documentElement.style.setProperty('--font-body', styles.bodyFont);
      if (globalBodyFont) globalBodyFont.value = styles.bodyFont;
    }
    if (styles.gridColumns) {
      document.documentElement.style.setProperty('--gallery-grid-cols', styles.gridColumns === 'auto' ? 'repeat(auto-fill, minmax(340px, 1fr))' : `repeat(${styles.gridColumns}, 1fr)`);
      if (gridColumnsSelect) gridColumnsSelect.value = styles.gridColumns;
    }
    if (styles.gridGap !== undefined) {
      document.documentElement.style.setProperty('--gallery-grid-gap', `${styles.gridGap}px`);
      if (gridGapRange) gridGapRange.value = styles.gridGap;
      if (gridGapValue) gridGapValue.textContent = `${styles.gridGap}px`;
    }
    if (contactReceiverEmailInput) {
      contactReceiverEmailInput.value = siteData.contactReceiverEmail || siteData.email || '';
    }
  }

  // -------------------------------------------------------------
  // BUSCA DE DADOS & NAVEGAÇÃO
  // -------------------------------------------------------------
  async function fetchSiteData() {
    try {
      const res = await fetch('/api/site');
      siteData = await res.json();
      applyCustomStyles();
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
    applyCustomStyles();
    const name = siteData.artistName || siteData.title || '';
    if (siteBrandLogo) siteBrandLogo.textContent = name;
    if (footerCopyright) {
      footerCopyright.innerHTML = `&copy; ${name}. ${t('all_rights_reserved')}`;
    }

    // Renderiza ícones de redes sociais no rodapé
    if (footerSocialIcons) {
      const socialList = siteData.socialLinks || [];
      const activeSocials = socialList.filter(s => s.url && s.url.trim());
      if (activeSocials.length > 0) {
        footerSocialIcons.innerHTML = activeSocials.map(s => {
          const iconMarkup = getSocialIconMarkup(s.icon || s.name);
          const url = formatSocialUrl(s.icon || s.name, s.url);
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon-link" aria-label="${s.name}" title="${s.name}">${iconMarkup}</a>`;
        }).join('');
        footerSocialIcons.style.display = 'flex';
      } else {
        footerSocialIcons.innerHTML = '';
        footerSocialIcons.style.display = 'none';
      }
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
      navHtml += `<a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}" data-original-text="${item.title}" data-nav>${translatedTitle}</a>`;
    });

    mainNav.innerHTML = navHtml;

    // Traduz itens de menu personalizados que não estejam no léxico
    mainNav.querySelectorAll('a[data-nav]').forEach(link => {
      const orig = link.getAttribute('data-original-text');
      if (orig) translateDynamicElement(link, orig);
    });

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

      // Dispara tradução automática de conteúdos dinâmicos / novos inseridos pelo usuário
      triggerDynamicPageTranslations();

      mainApp.classList.remove('page-loading');
    }, 100);
  }

  function triggerDynamicPageTranslations() {
    if (!siteData) return;
    
    // 1. Traduz bio principal da Home
    const heroDesc = document.getElementById('liveHeroDesc');
    if (heroDesc && siteData.bio) {
      translateDynamicElement(heroDesc, siteData.bio);
    }

    // 2. Traduz bio da página About
    const aboutBio = document.getElementById('liveAboutBio');
    if (aboutBio && (siteData.aboutLongBio || siteData.bio)) {
      translateDynamicElement(aboutBio, siteData.aboutLongBio || siteData.bio);
    }

    // 3. Traduz título e descrição de páginas de galeria
    const pageTitleEl = document.getElementById('livePageTitle');
    if (pageTitleEl) {
      const orig = pageTitleEl.getAttribute('data-original-text') || pageTitleEl.textContent.trim();
      if (!pageTitleEl.hasAttribute('data-original-text')) pageTitleEl.setAttribute('data-original-text', orig);
      if (orig) translateDynamicElement(pageTitleEl, orig);
    }

    const pageDesc = document.getElementById('livePageDesc');
    if (pageDesc) {
      const orig = pageDesc.getAttribute('data-original-text') || pageDesc.textContent.trim();
      if (!pageDesc.hasAttribute('data-original-text')) pageDesc.setAttribute('data-original-text', orig);
      if (orig) translateDynamicElement(pageDesc, orig);
    }

    // 4. Traduz todas as tags da galeria
    document.querySelectorAll('.tag-badge').forEach(el => {
      const orig = el.getAttribute('data-original-text') || el.textContent.trim();
      if (!el.hasAttribute('data-original-text')) el.setAttribute('data-original-text', orig);
      if (orig) translateDynamicElement(el, orig);
    });

    // 5. Traduz títulos e descrições de cartões/itens do grid
    document.querySelectorAll('.card-description, .card-title, .card-subtitle, .item-title, .item-subtitle, .service-title, .service-description').forEach(el => {
      const orig = el.getAttribute('data-original-text') || el.textContent.trim();
      if (orig && !el.hasAttribute('data-original-text')) {
        el.setAttribute('data-original-text', orig);
      }
      if (orig) {
        translateDynamicElement(el, orig);
      }
    });
  }

  // -------------------------------------------------------------
  // 1. PÁGINA HOME (PORTFOLIO)
  // -------------------------------------------------------------
  function renderHomePage() {
    const artistName = siteData.artistName || siteData.title || '';
    const profession = autoTranslate(siteData.profession || 'Visual Artist');
    const bio = siteData.bio || t('default_bio');

    if (pageTitle) pageTitle.textContent = artistName ? `${artistName} — ${profession}` : `Portfolio — ${profession}`;

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
    const artistName = siteData.artistName || siteData.title || '';
    const translatedPageTitle = autoTranslate(page.title);
    if (pageTitle) pageTitle.textContent = artistName ? `${translatedPageTitle} — ${artistName}` : `${translatedPageTitle} — Portfolio`;

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
    const artistName = siteData.artistName || siteData.title || '';
    if (pageTitle) pageTitle.textContent = artistName ? `${t('services_title')} — ${artistName}` : `${t('services_title')} — Portfolio`;

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
    const artistName = siteData.artistName || siteData.title || '';
    const profession = autoTranslate(siteData.profession || 'Visual Artist');
    if (pageTitle) pageTitle.textContent = artistName ? `${t('about_title')} — ${artistName}` : `${t('about_title')} — Portfolio`;

    // Suporte a Múltiplas Seções no Sobre (ex: Recognition, Selected Clients, Exibições, etc.)
    const defaultSections = [
      {
        id: 'sec_recog',
        title: 'Recognition',
        items: [
          { title: 'Design Week', sub: 'Profiled' },
          { title: 'Awwwards', sub: 'Web design' },
          { title: 'Red Dot Award', sub: 'Product design' }
        ]
      },
      {
        id: 'sec_clients',
        title: 'Selected Clients',
        items: [
          { title: 'Spotify', sub: '2025' },
          { title: 'IKEA', sub: '2025' },
          { title: 'Portfoliobox', sub: '2024' },
          { title: 'Volvo', sub: '2024' },
          { title: 'ICA', sub: '2024' }
        ]
      }
    ];

    const currentAboutSections = siteData.aboutSections && Array.isArray(siteData.aboutSections) && siteData.aboutSections.length > 0
      ? siteData.aboutSections
      : defaultSections;

    const sectionsHtml = currentAboutSections.map((sec, secIdx) => {
      const itemsHtml = (sec.items || []).map((item, itemIdx) => `
        <li class="about-list-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}">
          <span class="item-title ${isLiveAdmin ? 'editable-active' : ''}" data-field="about-item-title" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(item.title)}</span>
          <span class="item-subtitle ${isLiveAdmin ? 'editable-active' : ''}" data-field="about-item-sub" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(item.sub || '')}</span>
          ${isLiveAdmin ? `<button type="button" class="btn-del-about-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}" style="background:none; border:none; color:#ef4444; margin-left:8px; cursor:pointer;" title="Excluir item"><i class="fa-solid fa-xmark"></i></button>` : ''}
        </li>
      `).join('');

      return `
        <div class="about-column fade-in" data-sec-idx="${secIdx}">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h2 class="about-col-title ${isLiveAdmin ? 'editable-active' : ''}" data-field="about-sec-title" data-sec-idx="${secIdx}" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${autoTranslate(sec.title || 'Nova Seção')}</h2>
            ${isLiveAdmin ? `<button type="button" class="section-delete-btn btn-del-about-sec" data-sec-idx="${secIdx}" title="Excluir Seção"><i class="fa-solid fa-trash"></i> Excluir</button>` : ''}
          </div>
          <ul class="about-list">
            ${itemsHtml}
          </ul>
          ${isLiveAdmin ? `<button type="button" class="about-item-add-btn btn-add-about-item" data-sec-idx="${secIdx}"><i class="fa-solid fa-plus"></i> Adicionar Item</button>` : ''}
        </div>
      `;
    }).join('');

    mainApp.innerHTML = `
      <div class="about-container">
        <div class="about-avatar-wrapper fade-in" id="liveAboutAvatarWrapper" style="${isLiveAdmin ? 'cursor: pointer;' : ''}">
          <img src="${siteData.avatar || '/uploads/about.jpg'}" alt="${artistName}" id="liveAboutAvatarImg" />
          ${isLiveAdmin ? `
            <div class="avatar-upload-overlay" id="btnLiveUploadAvatar" title="Clique para trocar a foto de perfil">
              <i class="fa-solid fa-camera"></i>
              <span>Trocar Foto</span>
            </div>
          ` : ''}
        </div>
        
        <h1 class="hero-title ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutArtistName" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${artistName}</h1>
        <span class="hero-subtitle ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutProfession" ${isLiveAdmin ? 'contenteditable="true"' : ''}>${profession}</span>
        <p class="hero-desc ${isLiveAdmin ? 'editable-active' : ''}" id="liveAboutBio" style="margin-top: 25px;" ${isLiveAdmin ? 'contenteditable="true"' : ''}>
          ${siteData.aboutLongBio || siteData.bio || 'My work explores the quiet rhythm between light, texture, and human presence.'}
        </p>

        <section class="about-columns-section" id="liveAboutColumnsSection">
          ${sectionsHtml}
        </section>

        ${isLiveAdmin ? `
          <div class="about-section-controls">
            <button type="button" class="btn-add-about-sec" id="btnAddNewAboutSection"><i class="fa-solid fa-plus"></i> Adicionar Nova Seção (ex: Exposições, Prêmios, Bio...)</button>
          </div>
        ` : ''}

        ${renderSubmenuBigSection([
          { title: 'Portfolio', url: '/' },
          { title: 'Services', url: '/services' },
          { title: 'Contact', url: '/contact' }
        ])}
      </div>
    `;

    if (isLiveAdmin) {
      const avatarBtn = document.getElementById('btnLiveUploadAvatar');
      const avatarWrapper = document.getElementById('liveAboutAvatarWrapper');
      if (avatarBtn || avatarWrapper) {
        (avatarBtn || avatarWrapper).addEventListener('click', () => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = async () => {
            if (fileInput.files.length === 0) return;
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('photos', file);

            const token = localStorage.getItem('adm_token');
            showLiveToast('Enviando nova foto de perfil...', 'info');

            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
              });
              const data = await res.json();
              if (data.success && data.files && data.files[0]) {
                const newAvatarUrl = data.files[0].src;
                
                // Salva no perfil
                const saveRes = await fetch('/api/site', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ avatar: newAvatarUrl })
                });
                const saveData = await saveRes.json();
                if (saveData.success) {
                  siteData.avatar = newAvatarUrl;
                  const img = document.getElementById('liveAboutAvatarImg');
                  if (img) img.src = newAvatarUrl;
                  showLiveToast('Foto de perfil atualizada com sucesso!', 'success');
                }
              } else {
                showLiveToast(data.error || 'Erro no upload da foto.', 'error');
              }
            } catch (e) {
              showLiveToast('Erro ao conectar com o servidor.', 'error');
            }
          };
          fileInput.click();
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 5. PÁGINA CONTACT
  // -------------------------------------------------------------
  function renderContactPage() {
    const artistName = siteData.artistName || siteData.title || '';
    if (pageTitle) pageTitle.textContent = artistName ? `${t('contact_title')} — ${artistName}` : `${t('contact_title')} — Portfolio`;

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
  // RECURSOS DA BARRA DE EDIÇÃO VISUAL AO VIVO (WIX STYLE) & DRAWER
  // -------------------------------------------------------------
  function selectEditableElement(el) {
    if (!el || !isLiveAdmin) return;
    
    // Remove borda de foco do anterior
    if (currentSelectedTextEl && currentSelectedTextEl !== el) {
      currentSelectedTextEl.style.outline = '';
    }

    currentSelectedTextEl = el;
    currentSelectedTextEl.style.outline = '2px dashed var(--accent-color)';

    // Exibe botão de excluir o bloco selecionado no Drawer
    if (drawerSelectedActions) {
      drawerSelectedActions.style.display = 'block';
    }

    // Atualiza o Drawer
    if (drawerTargetIndicator) {
      const tagName = el.tagName.toLowerCase();
      const snippet = el.innerText.trim().slice(0, 30) || '(Vazio)';
      drawerTargetIndicator.innerHTML = `<strong>Selecionado:</strong> &lt;${tagName}&gt; "${snippet}..."`;
    }

    // Lê estilos computados do elemento para preencher os seletores do Drawer
    const computed = window.getComputedStyle(el);
    if (drawerFontSizeRange && drawerFontSizeValue) {
      const pxVal = parseInt(computed.fontSize, 10) || 16;
      drawerFontSizeRange.value = pxVal;
      drawerFontSizeValue.textContent = `${pxVal}px`;
    }

    if (drawerTextColor && drawerTextColorLabel) {
      // Converte rgb para hex se necessário
      const rgb = computed.color;
      let hex = rgbToHex(rgb);
      if (hex) {
        drawerTextColor.value = hex;
        drawerTextColorLabel.textContent = hex;
      }
    }

    // Status dos botões de estilo
    updateStyleButtonStates(computed);
  }

  function deleteSelectedTextBlock() {
    if (!currentSelectedTextEl) {
      showLiveToast('Selecione ou clique no bloco de texto que deseja excluir primeiro.', 'info');
      return;
    }

    const tagName = currentSelectedTextEl.tagName.toLowerCase();
    const snippet = currentSelectedTextEl.innerText.trim().slice(0, 25) || 'este bloco';

    if (!confirm(`Deseja realmente excluir <${tagName}> "${snippet}"?`)) {
      return;
    }

    const el = currentSelectedTextEl;
    const field = el.getAttribute('data-field');
    const secIdx = parseInt(el.getAttribute('data-sec-idx'), 10);
    const itemIdx = parseInt(el.getAttribute('data-item-idx'), 10);

    // 1. Trata se for item da Seção Sobre
    if (!isNaN(secIdx) && siteData.aboutSections && siteData.aboutSections[secIdx]) {
      if (field === 'about-sec-title') {
        siteData.aboutSections.splice(secIdx, 1);
        renderCurrentRoute();
      } else if (!isNaN(itemIdx) && siteData.aboutSections[secIdx].items) {
        siteData.aboutSections[secIdx].items.splice(itemIdx, 1);
        renderCurrentRoute();
      } else {
        el.remove();
      }
    }
    // 2. Trata se for título, subtítulo ou bio principal do Header
    else if (el.id === 'liveHeroTitle' || el.id === 'liveAboutArtistName') {
      siteData.artistName = '';
      el.innerText = '';
      el.remove();
    } else if (el.id === 'liveHeroSubtitle' || el.id === 'liveAboutProfession') {
      siteData.profession = '';
      el.innerText = '';
      el.remove();
    } else if (el.id === 'liveHeroDesc' || el.id === 'liveAboutBio') {
      siteData.bio = '';
      siteData.aboutLongBio = '';
      el.innerText = '';
      el.remove();
    } else if (el.id === 'livePageTitle') {
      el.innerText = '';
      el.remove();
    } else if (el.id === 'livePageDesc') {
      el.innerText = '';
      el.remove();
    }
    // 3. Bloco customizado ou qualquer outro elemento de texto
    else {
      el.remove();
    }

    currentSelectedTextEl = null;
    if (drawerSelectedActions) drawerSelectedActions.style.display = 'none';
    if (drawerTargetIndicator) drawerTargetIndicator.innerHTML = 'Nenhum texto selecionado. Selecione ou clique em qualquer texto para formatar.';

    hasPendingChanges = true;
    if (btnLiveSaveAll) {
      btnLiveSaveAll.style.background = '#f59e0b';
      btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-floppy-disk"></i>`;
      btnLiveSaveAll.title = `${t('btn_save_changes')} *`;
    }
    showLiveToast('Bloco de texto excluído com sucesso! Clique no botão de Salvar para gravar.', 'success');
  }

  function rgbToHex(rgbStr) {
    if (!rgbStr || !rgbStr.startsWith('rgb')) return '#000000';
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return '#000000';
    const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  function updateStyleButtonStates(computed) {
    if (btnToggleBold) {
      const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight, 10) >= 600;
      btnToggleBold.classList.toggle('active', isBold);
    }
    if (btnToggleItalic) {
      const isItalic = computed.fontStyle === 'italic';
      btnToggleItalic.classList.toggle('active', isItalic);
    }
    if (btnToggleUnderline) {
      const isUnder = (computed.textDecorationLine || computed.textDecoration || '').includes('underline');
      btnToggleUnderline.classList.toggle('active', isUnder);
    }
    if (btnToggleUppercase) {
      const isUpper = computed.textTransform === 'uppercase';
      btnToggleUppercase.classList.toggle('active', isUpper);
    }
    if (btnAlignLeft && btnAlignCenter && btnAlignRight) {
      btnAlignLeft.classList.toggle('active', computed.textAlign === 'left' || computed.textAlign === 'start');
      btnAlignCenter.classList.toggle('active', computed.textAlign === 'center');
      btnAlignRight.classList.toggle('active', computed.textAlign === 'right' || computed.textAlign === 'end');
    }
  }

  function attachLiveInlineEditing(path) {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      // Foco e seleção para o Drawer
      el.addEventListener('focus', () => selectEditableElement(el));
      el.addEventListener('click', (e) => {
        if (isLiveAdmin) {
          selectEditableElement(el);
        }
      });

      el.addEventListener('input', () => {
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-floppy-disk"></i>`;
        btnLiveSaveAll.title = `${t('btn_save_changes')} *`;

        const field = el.getAttribute('data-field');
        const index = parseInt(el.getAttribute('data-index'), 10);

        if (!isNaN(index) && currentActiveGalleryItems[index]) {
          if (field === 'card-title' || field === 'gallery-title') currentActiveGalleryItems[index].title = el.innerText;
          if (field === 'card-subtitle' || field === 'gallery-sub') currentActiveGalleryItems[index].subtitle = el.innerText;
          if (field === 'card-desc') currentActiveGalleryItems[index].description = el.innerText;
        }

        // About Sections
        const secIdx = parseInt(el.getAttribute('data-sec-idx'), 10);
        const itemIdx = parseInt(el.getAttribute('data-item-idx'), 10);
        if (!isNaN(secIdx) && siteData.aboutSections && siteData.aboutSections[secIdx]) {
          if (field === 'about-sec-title') {
            siteData.aboutSections[secIdx].title = el.innerText.trim();
          } else if (field === 'about-item-title' && !isNaN(itemIdx) && siteData.aboutSections[secIdx].items[itemIdx]) {
            siteData.aboutSections[secIdx].items[itemIdx].title = el.innerText.trim();
          } else if (field === 'about-item-sub' && !isNaN(itemIdx) && siteData.aboutSections[secIdx].items[itemIdx]) {
            siteData.aboutSections[secIdx].items[itemIdx].sub = el.innerText.trim();
          }
        }
      });
    });

    // Se estiver na página About, conecta os botões de adicionar e excluir seções/itens
    if (path === '/about' && isLiveAdmin) {
      document.querySelectorAll('.btn-del-about-sec').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const secIdx = parseInt(btn.getAttribute('data-sec-idx'), 10);
          if (confirm('Deseja excluir esta seção do Sobre?')) {
            if (siteData.aboutSections && siteData.aboutSections[secIdx]) {
              siteData.aboutSections.splice(secIdx, 1);
              hasPendingChanges = true;
              renderCurrentRoute();
              showLiveToast('Seção removida! Clique em Salvar Alterações para gravar.', 'success');
            }
          }
        };
      });

      document.querySelectorAll('.btn-add-about-item').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const secIdx = parseInt(btn.getAttribute('data-sec-idx'), 10);
          if (siteData.aboutSections && siteData.aboutSections[secIdx]) {
            if (!Array.isArray(siteData.aboutSections[secIdx].items)) {
              siteData.aboutSections[secIdx].items = [];
            }
            siteData.aboutSections[secIdx].items.push({
              title: 'Novo Item',
              sub: '2026'
            });
            hasPendingChanges = true;
            renderCurrentRoute();
            showLiveToast('Novo item adicionado! Edite os textos diretamente.', 'success');
          }
        };
      });

      document.querySelectorAll('.btn-del-about-item').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const secIdx = parseInt(btn.getAttribute('data-sec-idx'), 10);
          const itemIdx = parseInt(btn.getAttribute('data-item-idx'), 10);
          if (siteData.aboutSections && siteData.aboutSections[secIdx] && siteData.aboutSections[secIdx].items) {
            siteData.aboutSections[secIdx].items.splice(itemIdx, 1);
            hasPendingChanges = true;
            renderCurrentRoute();
            showLiveToast('Item removido!', 'success');
          }
        };
      });

      const btnAddNewSection = document.getElementById('btnAddNewAboutSection');
      if (btnAddNewSection) {
        btnAddNewSection.onclick = () => {
          const secTitle = prompt('Título da nova seção (ex: Exposições, Prêmios, Bio, Clientes):', 'Nova Seção');
          if (!secTitle) return;
          if (!Array.isArray(siteData.aboutSections)) {
            siteData.aboutSections = [];
          }
          siteData.aboutSections.push({
            id: 'sec_' + Date.now(),
            title: secTitle,
            items: [
              { title: 'Item Exemplo 1', sub: '2026' },
              { title: 'Item Exemplo 2', sub: '2025' }
            ]
          });
          hasPendingChanges = true;
          renderCurrentRoute();
          showLiveToast(`Seção "${secTitle}" adicionada com sucesso!`, 'success');
        };
      }
    }

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

  // -------------------------------------------------------------
  // CONTROLES DO DRAWER LATERAL DE TEXTOS E TIPOGRAFIA
  // -------------------------------------------------------------
  function setupLiveDrawer() {
    if (btnLiveOpenDrawer && liveTextDrawer) {
      btnLiveOpenDrawer.onclick = () => {
        liveTextDrawer.classList.toggle('open');
      };
    }

    if (closeLiveTextDrawer && liveTextDrawer) {
      closeLiveTextDrawer.onclick = () => {
        liveTextDrawer.classList.remove('open');
      };
    }

    // Botão na barra de ferramentas para Adicionar Seção Sobre
    if (btnLiveAddSectionAbout) {
      btnLiveAddSectionAbout.onclick = () => {
        if (window.location.pathname !== '/about') {
          navigateTo('/about');
          setTimeout(() => {
            const btn = document.getElementById('btnAddNewAboutSection');
            if (btn) btn.click();
          }, 300);
        } else {
          const btn = document.getElementById('btnAddNewAboutSection');
          if (btn) btn.click();
        }
      };
    }

    // 1. Mudança de Família da Fonte do elemento selecionado ou seleção interna
    if (drawerFontFamily) {
      drawerFontFamily.onchange = () => {
        const val = drawerFontFamily.value;
        const fontVal = val === 'inherit' ? '' : val;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          document.execCommand('fontName', false, fontVal || 'inherit');
        } else if (currentSelectedTextEl) {
          currentSelectedTextEl.style.fontFamily = fontVal;
        } else {
          showLiveToast('Selecione uma parte do texto ou clique em uma caixa de texto primeiro!', 'info');
          return;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 2. Mudança de Tamanho da Fonte
    if (drawerFontSizeRange && drawerFontSizeValue) {
      drawerFontSizeRange.oninput = () => {
        const val = drawerFontSizeRange.value;
        drawerFontSizeValue.textContent = `${val}px`;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          // Aplica span estilizado na seleção interna
          const span = document.createElement('span');
          span.style.fontSize = `${val}px`;
          const range = sel.getRangeAt(0);
          span.appendChild(range.extractContents());
          range.insertNode(span);
        } else if (currentSelectedTextEl) {
          currentSelectedTextEl.style.fontSize = `${val}px`;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 3. Negrito (com suporte a seleção individual de texto interno)
    if (btnToggleBold) {
      btnToggleBold.onclick = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          document.execCommand('bold', false, null);
        } else if (currentSelectedTextEl) {
          const currentWeight = currentSelectedTextEl.style.fontWeight;
          const isBold = currentWeight === 'bold' || parseInt(currentWeight, 10) >= 600;
          currentSelectedTextEl.style.fontWeight = isBold ? 'normal' : 'bold';
          btnToggleBold.classList.toggle('active', !isBold);
        } else {
          showLiveToast('Selecione um trecho de texto ou clique em uma caixa!', 'info');
          return;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 4. Itálico (com suporte a seleção individual de texto interno)
    if (btnToggleItalic) {
      btnToggleItalic.onclick = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          document.execCommand('italic', false, null);
        } else if (currentSelectedTextEl) {
          const isItalic = currentSelectedTextEl.style.fontStyle === 'italic';
          currentSelectedTextEl.style.fontStyle = isItalic ? 'normal' : 'italic';
          btnToggleItalic.classList.toggle('active', !isItalic);
        } else {
          showLiveToast('Selecione um trecho de texto ou clique em uma caixa!', 'info');
          return;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 5. Sublinhado (com suporte a seleção individual de texto interno)
    if (btnToggleUnderline) {
      btnToggleUnderline.onclick = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          document.execCommand('underline', false, null);
        } else if (currentSelectedTextEl) {
          const isUnder = (currentSelectedTextEl.style.textDecoration || '').includes('underline');
          currentSelectedTextEl.style.textDecoration = isUnder ? 'none' : 'underline';
          btnToggleUnderline.classList.toggle('active', !isUnder);
        } else {
          showLiveToast('Selecione um trecho de texto ou clique em uma caixa!', 'info');
          return;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 6. Maiúsculas (Uppercase)
    if (btnToggleUppercase) {
      btnToggleUppercase.onclick = () => {
        if (!currentSelectedTextEl) {
          showLiveToast('Clique em um texto na página primeiro!', 'info');
          return;
        }
        const isUpper = currentSelectedTextEl.style.textTransform === 'uppercase';
        currentSelectedTextEl.style.textTransform = isUpper ? 'none' : 'uppercase';
        btnToggleUppercase.classList.toggle('active', !isUpper);
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 7. Alinhamento (Left, Center, Right)
    if (btnAlignLeft) {
      btnAlignLeft.onclick = () => {
        if (!currentSelectedTextEl) return;
        currentSelectedTextEl.style.textAlign = 'left';
        btnAlignLeft.classList.add('active');
        btnAlignCenter.classList.remove('active');
        btnAlignRight.classList.remove('active');
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }
    if (btnAlignCenter) {
      btnAlignCenter.onclick = () => {
        if (!currentSelectedTextEl) return;
        currentSelectedTextEl.style.textAlign = 'center';
        btnAlignCenter.classList.add('active');
        btnAlignLeft.classList.remove('active');
        btnAlignRight.classList.remove('active');
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }
    if (btnAlignRight) {
      btnAlignRight.onclick = () => {
        if (!currentSelectedTextEl) return;
        currentSelectedTextEl.style.textAlign = 'right';
        btnAlignRight.classList.add('active');
        btnAlignLeft.classList.remove('active');
        btnAlignCenter.classList.remove('active');
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 8. Cor do Texto (com suporte a seleção individual de texto interno)
    if (drawerTextColor && drawerTextColorLabel) {
      drawerTextColor.oninput = () => {
        const val = drawerTextColor.value;
        drawerTextColorLabel.textContent = val;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          document.execCommand('foreColor', false, val);
        } else if (currentSelectedTextEl) {
          currentSelectedTextEl.style.color = val;
        }
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 9. Inserção de Novos Blocos de Texto
    function insertCustomTextBlock(tag, defaultText, defaultStyle = '') {
      const container = mainApp.querySelector('.hero-section') || mainApp.querySelector('.about-container') || mainApp.querySelector('.gallery-header') || mainApp;
      if (!container) return;

      const newEl = document.createElement(tag);
      newEl.className = 'editable-active custom-inserted-text';
      newEl.setAttribute('contenteditable', 'true');
      newEl.textContent = defaultText;
      newEl.style.cssText = defaultStyle + '; margin: 15px 0; outline: 2px dashed var(--accent-color);';

      const ref = container.querySelector('.about-columns-section') || container.querySelector('.submenu-big-section') || null;
      if (ref) {
        container.insertBefore(newEl, ref);
      } else {
        container.appendChild(newEl);
      }

      selectEditableElement(newEl);
      newEl.focus();
      hasPendingChanges = true;
      btnLiveSaveAll.style.background = '#f59e0b';
      showLiveToast('Novo bloco de texto inserido! Digite e customize no painel.', 'success');
    }

    if (btnInsertBigTitle) {
      btnInsertBigTitle.onclick = () => insertCustomTextBlock('h1', 'Novo Título Principal', 'font-size: 2.4rem; font-weight: 700; line-height: 1.2;');
    }
    if (btnInsertSubTitle) {
      btnInsertSubTitle.onclick = () => insertCustomTextBlock('h2', 'Novo Subtítulo da Seção', 'font-size: 1.5rem; font-weight: 600; line-height: 1.3; color: #475569;');
    }
    if (btnInsertLongText) {
      btnInsertLongText.onclick = () => insertCustomTextBlock('p', 'Digite aqui o seu parágrafo completo de texto...', 'font-size: 1.05rem; line-height: 1.8; color: #334155; max-width: 780px;');
    }
    if (btnInsertSmallText) {
      btnInsertSmallText.onclick = () => insertCustomTextBlock('span', 'Texto curto ou legenda informativa', 'font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b;');
    }

    // 9.1 Inserção de Linhas e Separadores Visuais
    function insertCustomVisualElement(htmlStr) {
      const container = mainApp.querySelector('.hero-section') || mainApp.querySelector('.about-container') || mainApp.querySelector('.gallery-header') || mainApp.querySelector('.gallery-page-container') || mainApp;
      if (!container) return;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlStr.trim();
      const el = tempDiv.firstChild;

      const ref = container.querySelector('.about-columns-section') || container.querySelector('.submenu-big-section') || container.querySelector('.gallery-grid') || null;
      if (ref) {
        container.insertBefore(el, ref);
      } else {
        container.appendChild(el);
      }

      hasPendingChanges = true;
      btnLiveSaveAll.style.background = '#f59e0b';
      showLiveToast('Elemento visual inserido com sucesso!', 'success');
    }

    if (btnInsertDividerLine) {
      btnInsertDividerLine.onclick = () => insertCustomVisualElement('<hr class="custom-divider-line" />');
    }
    if (btnInsertAccentDivider) {
      btnInsertAccentDivider.onclick = () => insertCustomVisualElement('<div class="custom-accent-divider"></div>');
    }
    if (btnInsertGridSpacer) {
      btnInsertGridSpacer.onclick = () => insertCustomVisualElement('<div class="custom-grid-spacer editable-active"></div>');
    }

    // 9.2 Formatação de Grid das Galerias (Colunas & Espaçamento)
    if (gridColumnsSelect) {
      gridColumnsSelect.onchange = () => {
        const val = gridColumnsSelect.value;
        const colVal = val === 'auto' ? 'repeat(auto-fill, minmax(340px, 1fr))' : `repeat(${val}, 1fr)`;
        document.documentElement.style.setProperty('--gallery-grid-cols', colVal);
        if (!siteData.customStyles) siteData.customStyles = {};
        siteData.customStyles.gridColumns = val;
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        showLiveToast(`Grid configurada para ${val === 'auto' ? 'modo automático' : val + ' coluna(s)'}!`, 'info');
      };
    }

    if (gridGapRange && gridGapValue) {
      gridGapRange.oninput = () => {
        const val = gridGapRange.value;
        gridGapValue.textContent = `${val}px`;
        document.documentElement.style.setProperty('--gallery-grid-gap', `${val}px`);
        if (!siteData.customStyles) siteData.customStyles = {};
        siteData.customStyles.gridGap = parseInt(val, 10);
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
      };
    }

    // 9.3 Configuração e Salvamento do E-mail Destinatário de Contato
    if (btnSaveReceiverEmail && contactReceiverEmailInput) {
      btnSaveReceiverEmail.onclick = async () => {
        const newEmail = contactReceiverEmailInput.value.trim();
        if (!newEmail || !newEmail.includes('@')) {
          showLiveToast('Por favor, informe um e-mail válido.', 'error');
          return;
        }

        const token = localStorage.getItem('adm_token');
        try {
          const res = await fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ contactReceiverEmail: newEmail })
          });
          const data = await res.json();
          if (data.success) {
            siteData.contactReceiverEmail = newEmail;
            showLiveToast(`E-mail de destino atualizado para: ${newEmail}`, 'success');
          } else {
            showLiveToast('Erro ao salvar e-mail.', 'error');
          }
        } catch (e) {
          showLiveToast('Falha na comunicação com o servidor.', 'error');
        }
      };
    }

    // 10. Tipografia Global do Site
    if (globalHeadingFont) {
      globalHeadingFont.onchange = () => {
        const font = globalHeadingFont.value;
        document.documentElement.style.setProperty('--font-heading', font);
        if (!siteData.customStyles) siteData.customStyles = {};
        siteData.customStyles.headingFont = font;
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        showLiveToast(`Fonte de títulos alterada para ${font.split(',')[0]}!`, 'info');
      };
    }

    if (globalBodyFont) {
      globalBodyFont.onchange = () => {
        const font = globalBodyFont.value;
        document.documentElement.style.setProperty('--font-body', font);
        if (!siteData.customStyles) siteData.customStyles = {};
        siteData.customStyles.bodyFont = font;
        hasPendingChanges = true;
        btnLiveSaveAll.style.background = '#f59e0b';
        showLiveToast(`Fonte de textos alterada para ${font.split(',')[0]}!`, 'info');
      };
    }

    // 11. Exclusão do Bloco / Texto Selecionado
    if (btnDeleteSelectedBlock) {
      btnDeleteSelectedBlock.onclick = () => {
        deleteSelectedTextBlock();
      };
    }
  }

  function setupLiveModals() {
    setupLiveDrawer();

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

    // Modal de Redes Sociais
    if (btnLiveManageSocial) {
      btnLiveManageSocial.onclick = () => openInlineSocialModal();
    }
    if (closeInlineSocialModal) {
      closeInlineSocialModal.onclick = () => inlineSocialModal.style.display = 'none';
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
        const newArtistName = prompt('Nome do Artista:', siteData.artistName || siteData.title || '');
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

  // -------------------------------------------------------------
  // MODAL DE GERENCIAMENTO DE REDES SOCIAIS (INLINE LIVE CMS)
  // -------------------------------------------------------------
  function openInlineSocialModal() {
    inlineSocialList.innerHTML = '';
    const socialList = siteData.socialLinks && siteData.socialLinks.length > 0 ? siteData.socialLinks : [
      { name: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram' },
      { name: 'WhatsApp', url: '', icon: 'whatsapp' },
      { name: 'Facebook', url: '', icon: 'facebook' },
      { name: 'LinkedIn', url: '', icon: 'linkedin' }
    ];

    socialList.forEach(item => {
      inlineSocialList.appendChild(createInlineSocialRow(item));
    });

    btnInlineAddSocialItem.onclick = () => {
      inlineSocialList.appendChild(createInlineSocialRow({ name: 'Instagram', url: '', icon: 'instagram' }));
    };

    btnInlineSaveSocial.onclick = async () => {
      const rows = inlineSocialList.querySelectorAll('.inline-social-row');
      const newSocialLinks = [];

      rows.forEach(r => {
        const select = r.querySelector('.social-select');
        const opt = select.options[select.selectedIndex];
        const name = opt.getAttribute('data-name') || select.value;
        const icon = opt.getAttribute('data-icon') || select.value;
        const rawUrl = r.querySelector('.social-url-input').value.trim();
        const url = formatSocialUrl(icon, rawUrl);

        if (url) {
          newSocialLinks.push({ name, url, icon });
        }
      });

      const token = localStorage.getItem('adm_token');
      try {
        const res = await fetch('/api/site', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ socialLinks: newSocialLinks })
        });
        const data = await res.json();
        if (data.success) {
          siteData.socialLinks = newSocialLinks;
          showLiveToast('Redes sociais atualizadas com sucesso!', 'success');
          inlineSocialModal.style.display = 'none';
          updateGlobalInfo();
          renderCurrentRoute();
        }
      } catch (e) {
        showLiveToast('Erro ao salvar redes sociais.', 'error');
      }
    };

    inlineSocialModal.style.display = 'flex';
  }

  function createInlineSocialRow(socialItem) {
    const row = document.createElement('div');
    row.className = 'inline-social-row';
    row.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155;';

    let selectOptions = SOCIAL_PLATFORMS.map(net => {
      const selected = (net.name.toLowerCase() === (socialItem.name || '').toLowerCase() || net.icon === socialItem.icon) ? 'selected' : '';
      return `<option value="${net.id}" data-name="${net.name}" data-icon="${net.icon}" ${selected}>${net.name}</option>`;
    }).join('');

    row.innerHTML = `
      <select class="social-select" style="padding: 8px 10px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px; font-weight: 600; width: 140px;">
        ${selectOptions}
      </select>
      <input type="text" class="social-url-input" value="${socialItem.url || ''}" placeholder="Link / Usuário / WhatsApp" style="flex: 1; padding: 8px 12px; background: #1e293b; color: #fff; border: 1px solid #475569; border-radius: 4px;" />
      <button type="button" class="btn-del-social" style="background: #ef4444; color: #fff; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
    `;

    row.querySelector('.btn-del-social').onclick = () => row.remove();
    return row;
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
            bio: heroDesc,
            customStyles: siteData.customStyles || {}
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
            aboutLongBio: aboutBio,
            aboutSections: siteData.aboutSections || [],
            customStyles: siteData.customStyles || {}
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
          body: JSON.stringify({
            artistName: name,
            address,
            phone,
            email,
            customStyles: siteData.customStyles || {}
          })
        });
      }
      // 4. Se for uma Galeria de Projeto
      else {
        const cleanUrl = path.replace('/', '');
        const pageTitle = document.getElementById('livePageTitle')?.innerText;
        const pageDesc = document.getElementById('livePageDesc')?.innerText;
        const tags = Array.from(document.querySelectorAll('#liveTagsContainer .tag-badge')).map(t => t.innerText.trim()).filter(Boolean);

        // Salva customStyles caso tenha mudado
        if (siteData.customStyles) {
          await fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ customStyles: siteData.customStyles })
          });
        }

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
      btnLiveSaveAll.innerHTML = `<i class="fa-solid fa-check"></i>`;
      btnLiveSaveAll.title = t('btn_save_changes');
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

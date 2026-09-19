/* ==========================================================================
   ADMIN.JS - CMS CLIENT-SIDE LOGIC (DRAG & DROP, UPLOADS, CRUD)
   ========================================================================== */

(function () {
  let siteData = null;
  let activeGalleryItems = [];
  let currentSelectedPageUrl = '/creatures';
  let draggedCard = null;

  // Elementos DOM
  const loginScreen = document.getElementById('loginScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const loginForm = document.getElementById('loginForm');
  const adminPassword = document.getElementById('adminPassword');
  const btnLogout = document.getElementById('btnLogout');
  const adminToast = document.getElementById('adminToast');
  
  // Abas
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Galeria & Upload
  const gallerySelect = document.getElementById('gallerySelect');
  const adminGalleryGrid = document.getElementById('adminGalleryGrid');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileInput');
  const btnSaveGalleryOrder = document.getElementById('btnSaveGalleryOrder');

  // Páginas
  const pagesListContainer = document.getElementById('pagesListContainer');
  const btnOpenNewPageModal = document.getElementById('btnOpenNewPageModal');

  // Perfil
  const siteInfoForm = document.getElementById('siteInfoForm');
  const btnSaveSiteInfo = document.getElementById('btnSaveSiteInfo');
  const infoArtistName = document.getElementById('infoArtistName');
  const infoProfession = document.getElementById('infoProfession');
  const infoBio = document.getElementById('infoBio');
  const infoAboutLongBio = document.getElementById('infoAboutLongBio');
  const infoEmail = document.getElementById('infoEmail');
  const infoPhone = document.getElementById('infoPhone');
  const infoAddress = document.getElementById('infoAddress');

  // Menu
  const menuItemsContainer = document.getElementById('menuItemsContainer');
  const btnAddMenuItem = document.getElementById('btnAddMenuItem');
  const btnSaveMenu = document.getElementById('btnSaveMenu');

  // Segurança
  const changePasswordForm = document.getElementById('changePasswordForm');

  // Inicialização
  async function init() {
    setupAuth();
    setupTabs();
    setupUpload();
    setupGalleryControls();
    setupProfileControls();
    setupMenuControls();
    setupSecurityControls();
  }

  // ----------------------------------------------------------------
  // 1. AUTENTICAÇÃO
  // ----------------------------------------------------------------
  async function setupAuth() {
    const token = localStorage.getItem('adm_token');
    if (token) {
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.authenticated) {
          showDashboard();
          return;
        }
      } catch (e) {}
    }
    showLogin();

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = adminPassword.value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (data.success && data.token) {
          localStorage.setItem('adm_token', data.token);
          showDashboard();
          showToast('Login realizado com sucesso!', 'success');
        } else {
          showToast(data.message || 'Senha inválida.', 'error');
        }
      } catch (err) {
        showToast('Erro ao conectar ao servidor.', 'error');
      }
    });

    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('adm_token');
      showLogin();
      showToast('Sessão encerrada.', 'success');
    });
  }

  function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
  }

  async function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    await loadSiteData();
  }

  // ----------------------------------------------------------------
  // 2. ABAS
  // ----------------------------------------------------------------
  function setupTabs() {
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');

        navItems.forEach(n => n.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  // ----------------------------------------------------------------
  // 3. CARREGAR DADOS
  // ----------------------------------------------------------------
  async function loadSiteData() {
    try {
      const res = await fetch('/api/site');
      siteData = await res.json();

      populateGallerySelect();
      loadGalleryItems(currentSelectedPageUrl);
      populatePagesTab();
      populateProfileTab();
      populateMenuTab();
    } catch (err) {
      showToast('Falha ao carregar dados do site.', 'error');
    }
  }

  // ----------------------------------------------------------------
  // 4. GALERIAS & FOTOS (DRAG & DROP REORDER)
  // ----------------------------------------------------------------
  function populateGallerySelect() {
    gallerySelect.innerHTML = '';
    const galleryPages = siteData.pages.filter(p => p.url !== '/services' && p.url !== '/about' && p.url !== '/contact');

    galleryPages.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.url;
      opt.textContent = p.isStartPage || p.url === '/' ? 'Home (Portfolio Principal)' : p.title;
      if (p.url === currentSelectedPageUrl) opt.selected = true;
      gallerySelect.appendChild(opt);
    });

    gallerySelect.addEventListener('change', () => {
      currentSelectedPageUrl = gallerySelect.value;
      loadGalleryItems(currentSelectedPageUrl);
    });
  }

  function loadGalleryItems(pageUrl) {
    const page = siteData.pages.find(p => p.url === pageUrl || (pageUrl === '/' && p.isStartPage));
    if (!page) return;

    activeGalleryItems = [];
    const galSec = page.sections.find(s => s.gallery);
    if (galSec && galSec.gallery && Array.isArray(galSec.gallery.items)) {
      activeGalleryItems = JSON.parse(JSON.stringify(galSec.gallery.items));
    }

    renderGalleryGrid();
  }

  function renderGalleryGrid() {
    adminGalleryGrid.innerHTML = '';

    if (activeGalleryItems.length === 0) {
      adminGalleryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-text-muted);">
          <i class="fa-regular fa-image" style="font-size: 2.5rem; margin-bottom: 10px; display: block;"></i>
          Nenhuma foto nesta galeria. Envie fotos usando a caixa acima!
        </div>
      `;
      return;
    }

    activeGalleryItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'admin-photo-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-index', index);

      card.innerHTML = `
        <div class="photo-thumb-wrapper">
          <img src="${item.src}" alt="${item.title || 'Foto'}" />
          <span class="photo-badge-order">#${index + 1}</span>
          <div class="photo-card-actions">
            <button class="photo-action-btn btn-move-up" title="Mover para cima" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''}>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button class="photo-action-btn btn-move-down" title="Mover para baixo" ${index === activeGalleryItems.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>
              <i class="fa-solid fa-arrow-down"></i>
            </button>
            <button class="photo-action-btn btn-delete-photo" title="Excluir foto" style="color: #ef4444;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="photo-card-body">
          <input type="text" class="admin-input item-title-input" placeholder="Título da obra" value="${item.title || ''}" />
          <input type="text" class="admin-input item-sub-input" placeholder="Legenda/Categoria" value="${item.subtitle || ''}" />
        </div>
      `;

      // Eventos Drag & Drop
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.admin-photo-card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIndex = index;

        if (fromIndex !== toIndex) {
          // Reordena o array
          const movedItem = activeGalleryItems.splice(fromIndex, 1)[0];
          activeGalleryItems.splice(toIndex, 0, movedItem);
          renderGalleryGrid();
          showToast(`Foto movida para a posição #${toIndex + 1}. Lembre-se de salvar!`, 'success');
        }
      });

      // Botões de subir/descer
      const btnUp = card.querySelector('.btn-move-up');
      const btnDown = card.querySelector('.btn-move-down');
      const btnDel = card.querySelector('.btn-delete-photo');
      const titleInput = card.querySelector('.item-title-input');
      const subInput = card.querySelector('.item-sub-input');

      if (btnUp) {
        btnUp.addEventListener('click', () => {
          if (index > 0) {
            const temp = activeGalleryItems[index];
            activeGalleryItems[index] = activeGalleryItems[index - 1];
            activeGalleryItems[index - 1] = temp;
            renderGalleryGrid();
          }
        });
      }

      if (btnDown) {
        btnDown.addEventListener('click', () => {
          if (index < activeGalleryItems.length - 1) {
            const temp = activeGalleryItems[index];
            activeGalleryItems[index] = activeGalleryItems[index + 1];
            activeGalleryItems[index + 1] = temp;
            renderGalleryGrid();
          }
        });
      }

      if (btnDel) {
        btnDel.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja excluir esta foto da galeria?')) {
            activeGalleryItems.splice(index, 1);
            renderGalleryGrid();
            showToast('Foto removida da galeria.', 'success');
          }
        });
      }

      titleInput.addEventListener('input', (e) => {
        item.title = e.target.value;
      });

      subInput.addEventListener('input', (e) => {
        item.subtitle = e.target.value;
      });

      adminGalleryGrid.appendChild(card);
    });
  }

  function setupGalleryControls() {
    btnSaveGalleryOrder.addEventListener('click', async () => {
      btnSaveGalleryOrder.disabled = true;
      btnSaveGalleryOrder.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

      const token = localStorage.getItem('adm_token');
      const pageUrl = currentSelectedPageUrl.replace('/', '');

      try {
        const res = await fetch(`/api/pages/${pageUrl || 'home'}/items`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: activeGalleryItems })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Ordem e fotos salvas com sucesso no site!', 'success');
          await loadSiteData();
        } else {
          showToast(data.error || 'Erro ao salvar.', 'error');
        }
      } catch (e) {
        showToast('Erro de comunicação com o servidor.', 'error');
      } finally {
        btnSaveGalleryOrder.disabled = false;
        btnSaveGalleryOrder.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Ordem';
      }
    });
  }

  // ----------------------------------------------------------------
  // 5. UPLOAD DE FOTOS (DRAG & DROP ZONE)
  // ----------------------------------------------------------------
  function setupUpload() {
    uploadDropzone.addEventListener('click', () => fileInput.click());

    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('dragover');
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('dragover');
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesUpload(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFilesUpload(fileInput.files);
      }
    });
  }

  async function handleFilesUpload(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    const token = localStorage.getItem('adm_token');
    if (!token) {
      showToast('Sessão expirada. Faça login novamente.', 'error');
      showLogin();
      return;
    }

    showToast(`Enviando ${files.length} foto(s)...`, 'info');

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
        // Adiciona as fotos na galeria atual
        data.files.forEach(f => {
          activeGalleryItems.push({
            id: f.id,
            src: f.src,
            title: '',
            subtitle: 'Gallery',
            description: ''
          });
        });
        renderGalleryGrid();
        showToast(`${data.files.length} foto(s) enviada(s)! Clique em "Salvar Ordem" para confirmar.`, 'success');
      } else {
        showToast(data.error || data.message || `Erro ${res.status} no upload.`, 'error');
        if (res.status === 401) {
          showLogin();
        }
      }
    } catch (e) {
      showToast(`Erro ao conectar com o servidor: ${e.message}`, 'error');
    } finally {
      fileInput.value = '';
    }
  }

  // ----------------------------------------------------------------
  // 6. PÁGINAS & TEXTOS
  // ----------------------------------------------------------------
  function populatePagesTab() {
    pagesListContainer.innerHTML = '';

    siteData.pages.forEach(p => {
      let title = p.title;
      let desc = '';
      let tags = '';

      p.sections.forEach(s => {
        if (s.viewType === 'Text' && s.elements) {
          const t = s.elements.find(e => e.view === 'header-view');
          const d = s.elements.find(e => e.view === 'longtext-view');
          const l = s.elements.find(e => e.view === 'list-view');
          if (t) title = t.content;
          if (d) desc = d.content;
          if (l && Array.isArray(l.content)) {
            tags = l.content.map(x => x.Title || x).join(', ');
          }
        }
      });

      const pageCard = document.createElement('div');
      pageCard.style.cssText = 'background: var(--admin-card); padding: 20px; border-radius: 6px; margin-bottom: 20px; border: 1px solid var(--admin-border);';
      pageCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">${p.title}</h3>
            <span style="color: var(--admin-text-muted); font-size: 0.85rem;">Rota: <code>${p.url}</code></span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="admin-btn small success btn-save-page">Salvar Alterações</button>
            ${!p.isStartPage && p.url !== '/' ? '<button class="admin-btn small btn-delete-page" style="background: #ef4444;"><i class="fa-solid fa-trash"></i></button>' : ''}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="admin-form-group">
            <label>Título da Página</label>
            <input type="text" class="admin-input page-title-inp" value="${title || ''}" />
          </div>
          <div class="admin-form-group">
            <label>Tags (separadas por vírgula)</label>
            <input type="text" class="admin-input page-tags-inp" value="${tags || ''}" placeholder="Ex: Visuals, Storytelling, Brand" />
          </div>
          <div class="admin-form-group" style="grid-column: span 2;">
            <label>Texto Descritivo</label>
            <textarea class="admin-input page-desc-inp" rows="3">${desc || ''}</textarea>
          </div>
        </div>
      `;

      const btnSave = pageCard.querySelector('.btn-save-page');
      const btnDel = pageCard.querySelector('.btn-delete-page');

      btnSave.addEventListener('click', async () => {
        const newTitle = pageCard.querySelector('.page-title-inp').value;
        const newDesc = pageCard.querySelector('.page-desc-inp').value;
        const newTags = pageCard.querySelector('.page-tags-inp').value.split(',').map(t => t.trim()).filter(Boolean);

        const token = localStorage.getItem('adm_token');
        const cleanUrl = p.url.replace('/', '');

        try {
          const res = await fetch(`/api/pages/${cleanUrl || 'home'}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: newTitle,
              description: newDesc,
              tags: newTags
            })
          });
          const result = await res.json();
          if (result.success) {
            showToast(`Página "${newTitle}" atualizada com sucesso!`, 'success');
            await loadSiteData();
          } else {
            showToast(result.error || 'Erro ao atualizar.', 'error');
          }
        } catch (e) {
          showToast('Erro de comunicação.', 'error');
        }
      });

      if (btnDel) {
        btnDel.addEventListener('click', async () => {
          if (confirm(`Tem certeza que deseja excluir permanentemente a página/galeria "${p.title}"?`)) {
            const token = localStorage.getItem('adm_token');
            const cleanUrl = p.url.replace('/', '');

            try {
              const res = await fetch(`/api/pages/${cleanUrl}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const result = await res.json();
              if (result.success) {
                showToast(`Página "${p.title}" excluída com sucesso!`, 'success');
                await loadSiteData();
              } else {
                showToast(result.error || 'Erro ao excluir.', 'error');
              }
            } catch (e) {
              showToast('Erro de comunicação.', 'error');
            }
          }
        });
      }

      pagesListContainer.appendChild(pageCard);
    });

    // Botão Criar Nova Galeria
    btnOpenNewPageModal.onclick = () => {
      const title = prompt('Digite o Título do Novo Projeto / Galeria (Ex: "Urban Landscapes"):');
      if (!title) return;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const url = prompt('Digite a URL da página:', `/${slug}`);
      if (!url) return;
      const desc = prompt('Digite uma breve descrição:', 'Uma série fotográfica explorando formas e luz.');

      createNewPage(title, url, desc);
    };
  }

  async function createNewPage(title, url, description) {
    const token = localStorage.getItem('adm_token');
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, url, description, tags: ['Visuals', 'Storytelling', 'Brand'] })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Galeria "${title}" criada com sucesso!`, 'success');
        currentSelectedPageUrl = url;
        await loadSiteData();
      } else {
        showToast(data.error || 'Erro ao criar página.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  }

  // ----------------------------------------------------------------
  // 7. PERFIL & BIO
  // ----------------------------------------------------------------
  const SOCIAL_NETWORKS = [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/usuario ou @usuario' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', placeholder: 'https://wa.me/5511999999999 ou +55 11 99999-9999' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', placeholder: 'https://facebook.com/pagina' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/in/perfil' },
    { id: 'x-twitter', name: 'Twitter / X', icon: 'x-twitter', placeholder: 'https://x.com/usuario' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/@canal' },
    { id: 'tiktok', name: 'TikTok', icon: 'tiktok', placeholder: 'https://tiktok.com/@usuario' },
    { id: 'behance', name: 'Behance', icon: 'behance', placeholder: 'https://behance.net/usuario' },
    { id: 'artstation', name: 'ArtStation', icon: 'artstation', placeholder: 'https://artstation.com/usuario' },
    { id: 'pinterest', name: 'Pinterest', icon: 'pinterest', placeholder: 'https://pinterest.com/usuario' },
    { id: 'github', name: 'GitHub', icon: 'github', placeholder: 'https://github.com/usuario' }
  ];

  function formatSocialUrl(network, url) {
    if (!url) return '';
    let clean = url.trim();
    if (network === 'whatsapp') {
      if (!clean.startsWith('http')) {
        const digits = clean.replace(/[^0-9]/g, '');
        return digits ? `https://wa.me/${digits}` : clean;
      }
      return clean;
    }
    if (network === 'instagram') {
      if (clean.startsWith('@')) return `https://instagram.com/${clean.replace('@', '')}`;
      if (!clean.startsWith('http') && !clean.includes('/')) return `https://instagram.com/${clean}`;
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      return `https://${clean}`;
    }
    return clean;
  }

  function createSocialRow(socialItem = { name: 'Instagram', url: '', icon: 'instagram' }) {
    const row = document.createElement('div');
    row.className = 'admin-social-row';
    row.style.cssText = 'display: flex; gap: 10px; align-items: center; background: var(--admin-card); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--admin-border);';

    let selectOptions = SOCIAL_NETWORKS.map(net => {
      const selected = (net.name.toLowerCase() === (socialItem.name || '').toLowerCase() || net.icon === socialItem.icon) ? 'selected' : '';
      return `<option value="${net.id}" data-name="${net.name}" data-icon="${net.icon}" ${selected}>${net.name}</option>`;
    }).join('');

    row.innerHTML = `
      <select class="admin-input social-type-select" style="width: 160px;">
        ${selectOptions}
      </select>
      <input type="text" class="admin-input social-url-input" value="${socialItem.url || ''}" placeholder="Link do perfil (ex: https://...)" style="flex: 1;" />
      <button type="button" class="admin-btn small btn-del-social" style="background: #ef4444;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
    `;

    row.querySelector('.btn-del-social').addEventListener('click', () => row.remove());
    return row;
  }

  // ----------------------------------------------------------------
  // 7. PERFIL & BIO
  // ----------------------------------------------------------------
  function populateProfileTab() {
    if (!siteData) return;
    infoArtistName.value = siteData.artistName || '';
    infoProfession.value = siteData.profession || '';
    infoBio.value = siteData.bio || '';
    infoAboutLongBio.value = siteData.aboutLongBio || '';
    infoEmail.value = siteData.email || '';
    infoPhone.value = siteData.phone || '';
    infoAddress.value = siteData.address || '';

    // Preenche redes sociais
    const adminSocialListContainer = document.getElementById('adminSocialListContainer');
    if (adminSocialListContainer) {
      adminSocialListContainer.innerHTML = '';
      const list = siteData.socialLinks && siteData.socialLinks.length > 0 ? siteData.socialLinks : [
        { name: 'Instagram', url: 'https://www.instagram.com', icon: 'instagram' },
        { name: 'WhatsApp', url: '', icon: 'whatsapp' },
        { name: 'Facebook', url: '', icon: 'facebook' },
        { name: 'LinkedIn', url: '', icon: 'linkedin' }
      ];

      list.forEach(item => {
        adminSocialListContainer.appendChild(createSocialRow(item));
      });
    }
  }

  function setupProfileControls() {
    const btnAdminAddSocial = document.getElementById('btnAdminAddSocial');
    const adminSocialListContainer = document.getElementById('adminSocialListContainer');

    if (btnAdminAddSocial && adminSocialListContainer) {
      btnAdminAddSocial.addEventListener('click', () => {
        adminSocialListContainer.appendChild(createSocialRow());
      });
    }

    btnSaveSiteInfo.addEventListener('click', async () => {
      btnSaveSiteInfo.disabled = true;
      const token = localStorage.getItem('adm_token');

      // Coleta redes sociais
      const socialLinks = [];
      if (adminSocialListContainer) {
        adminSocialListContainer.querySelectorAll('.admin-social-row').forEach(row => {
          const select = row.querySelector('.social-type-select');
          const opt = select.options[select.selectedIndex];
          const name = opt.getAttribute('data-name') || select.value;
          const icon = opt.getAttribute('data-icon') || select.value;
          const rawUrl = row.querySelector('.social-url-input').value.trim();
          const url = formatSocialUrl(icon, rawUrl);

          if (url) {
            socialLinks.push({ name, url, icon });
          }
        });
      }

      const payload = {
        artistName: infoArtistName.value,
        profession: infoProfession.value,
        bio: infoBio.value,
        aboutLongBio: infoAboutLongBio.value,
        email: infoEmail.value,
        phone: infoPhone.value,
        address: infoAddress.value,
        socialLinks
      };

      try {
        const res = await fetch('/api/site', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Perfil, biografia e redes sociais salvos com sucesso!', 'success');
          await loadSiteData();
        } else {
          showToast(data.error || 'Erro ao salvar perfil.', 'error');
        }
      } catch (e) {
        showToast('Erro de conexão com o servidor.', 'error');
      } finally {
        btnSaveSiteInfo.disabled = false;
      }
    });
  }

  // ----------------------------------------------------------------
  // 8. MENUS & LINKS
  // ----------------------------------------------------------------
  function populateMenuTab() {
    menuItemsContainer.innerHTML = '';
    const menuList = siteData.menu || [
      { title: 'Portfolio', url: '/' },
      { title: 'Services', url: '/services' },
      { title: 'About', url: '/about' },
      { title: 'Contact', url: '/contact' }
    ];

    menuList.forEach((m, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 10px; align-items: center; background: var(--admin-card); padding: 10px 14px; border-radius: 6px;';
      row.innerHTML = `
        <input type="text" class="admin-input menu-title-inp" value="${m.title}" style="flex: 1;" placeholder="Nome do link" />
        <input type="text" class="admin-input menu-url-inp" value="${m.url}" style="flex: 1;" placeholder="URL (ex: /about)" />
        <button class="admin-btn small btn-del-menu" style="background: #ef4444;"><i class="fa-solid fa-trash"></i></button>
      `;

      row.querySelector('.btn-del-menu').addEventListener('click', () => {
        row.remove();
      });

      menuItemsContainer.appendChild(row);
    });
  }

  function setupMenuControls() {
    btnAddMenuItem.addEventListener('click', () => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 10px; align-items: center; background: var(--admin-card); padding: 10px 14px; border-radius: 6px;';
      row.innerHTML = `
        <input type="text" class="admin-input menu-title-inp" value="Novo Link" style="flex: 1;" placeholder="Nome do link" />
        <input type="text" class="admin-input menu-url-inp" value="/" style="flex: 1;" placeholder="URL (ex: /about)" />
        <button class="admin-btn small btn-del-menu" style="background: #ef4444;"><i class="fa-solid fa-trash"></i></button>
      `;
      row.querySelector('.btn-del-menu').addEventListener('click', () => row.remove());
      menuItemsContainer.appendChild(row);
    });

    btnSaveMenu.addEventListener('click', async () => {
      const rows = menuItemsContainer.querySelectorAll('div');
      const newMenu = [];
      rows.forEach(r => {
        const title = r.querySelector('.menu-title-inp').value.trim();
        const url = r.querySelector('.menu-url-inp').value.trim();
        if (title && url) {
          newMenu.push({ title, url });
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
          body: JSON.stringify({ menu: newMenu })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Menu de navegação salvo com sucesso!', 'success');
          await loadSiteData();
        }
      } catch (e) {
        showToast('Erro ao salvar menu.', 'error');
      }
    });
  }

  // ----------------------------------------------------------------
  // 9. SEGURANÇA / SENHA
  // ----------------------------------------------------------------
  function setupSecurityControls() {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const token = localStorage.getItem('adm_token');

      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Senha alterada com sucesso!', 'success');
          changePasswordForm.reset();
        } else {
          showToast(data.error || 'Erro ao alterar senha.', 'error');
        }
      } catch (err) {
        showToast('Erro de comunicação.', 'error');
      }
    });
  }

  // ----------------------------------------------------------------
  // TOAST FEEDBACK
  // ----------------------------------------------------------------
  function showToast(message, type = 'success') {
    adminToast.textContent = message;
    adminToast.className = `show ${type}`;
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3500);
  }

  // Inicia
  window.addEventListener('DOMContentLoaded', init);
})();

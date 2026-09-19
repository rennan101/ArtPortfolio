const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do JSON e CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Armazenamento de uploads com Multer
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Somente arquivos de imagem são permitidos!'), false);
    }
  }
});

// Caminho do banco de dados JSON
const dbPath = path.join(__dirname, 'data', 'site-data.json');

// Helper para ler dados
function readData() {
  if (!fs.existsSync(dbPath)) {
    return {
      title: "Max Doe",
      artistName: "Max Doe",
      profession: "Visual Artist",
      bio: "",
      aboutLongBio: "",
      avatar: "/uploads/about.jpg",
      email: "max.doe@gmail.com",
      phone: "+46 70 11 22 33",
      address: "Gustavslundsv 99, 167 51 BROMMA",
      socialLinks: [],
      menu: [],
      adminPasswordHash: "admin123",
      pages: []
    };
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw);
}

// Helper para salvar dados
function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

/* ============================================================
   ROTAS DE AUTENTICAÇÃO
   ============================================================ */
// Token simples para sessão admin
let currentAdminToken = null;

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const data = readData();

  if (password === data.adminPasswordHash) {
    currentAdminToken = 'adm_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    return res.json({ success: true, token: currentAdminToken });
  }

  return res.status(401).json({ success: false, message: 'Senha incorreta.' });
});

app.post('/api/admin/verify', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token && token === currentAdminToken) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

app.post('/api/admin/change-password', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const { currentPassword, newPassword } = req.body;
  const data = readData();

  if (currentPassword !== data.adminPasswordHash) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 4 caracteres.' });
  }

  data.adminPasswordHash = newPassword;
  saveData(data);
  return res.json({ success: true, message: 'Senha atualizada com sucesso!' });
});

/* ============================================================
   ROTAS PÚBLICAS E ADMINISTRATIVAS DE DADOS
   ============================================================ */

// 1. Obter dados completos do site
app.get('/api/site', (req, res) => {
  const data = readData();
  // Não envia a senha pro público
  const safeData = { ...data };
  delete safeData.adminPasswordHash;
  res.json(safeData);
});

// 2. Atualizar informações gerais do site (perfil, bio, redes, footer, menu)
app.put('/api/site', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const data = readData();
  const { title, artistName, profession, bio, aboutLongBio, avatar, email, phone, address, socialLinks, menu } = req.body;

  if (title !== undefined) data.title = title;
  if (artistName !== undefined) data.artistName = artistName;
  if (profession !== undefined) data.profession = profession;
  if (bio !== undefined) data.bio = bio;
  if (aboutLongBio !== undefined) data.aboutLongBio = aboutLongBio;
  if (avatar !== undefined) data.avatar = avatar;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (address !== undefined) data.address = address;
  if (socialLinks !== undefined) data.socialLinks = socialLinks;
  if (menu !== undefined) data.menu = menu;

  saveData(data);
  res.json({ success: true, message: 'Dados do site atualizados com sucesso!', data });
});

// 3. Obter dados de uma página específica
app.get('/api/pages/:url', (req, res) => {
  const pageUrl = req.params.url === 'home' ? '/' : '/' + req.params.url;
  const data = readData();
  const page = data.pages.find(p => p.url === pageUrl || p.url === '/' + req.params.url || (pageUrl === '/' && p.isStartPage));

  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  res.json(page);
});

// 4. Criar nova página/galeria
app.post('/api/pages', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const { title, url, description, tags, coverImage } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Título e URL são obrigatórios.' });
  }

  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  const data = readData();

  if (data.pages.some(p => p.url === cleanUrl)) {
    return res.status(400).json({ error: 'Uma página com esta URL já existe.' });
  }

  const newPageId = 'page_' + Date.now();
  const newPage = {
    id: newPageId,
    url: cleanUrl,
    title,
    isStartPage: false,
    sections: [
      {
        id: 'sec_head_' + Date.now(),
        viewType: 'Text',
        viewId: 'text2',
        elements: [
          {
            id: 'el_title_' + Date.now(),
            view: 'header-view',
            content: title,
            style: { "margin-bottom": "0.7em", "max-width": "800px" }
          },
          {
            id: 'el_desc_' + Date.now(),
            view: 'longtext-view',
            content: description || '',
            style: { "margin-bottom": "3em", "max-width": "800px", "text-align": "center" }
          },
          {
            id: 'el_tags_' + Date.now(),
            view: 'list-view',
            content: (tags || ['Visuals', 'Storytelling', 'Brand']).map(t => ({ Title: t })),
            style: { "flex-direction": "row", "align-items": "center", "max-width": "800px", "background-color": "#efefef", "justify-content": "center" }
          }
        ]
      },
      {
        id: 'sec_gallery_' + Date.now(),
        viewType: 'Gallery',
        viewId: 'evenrows',
        gallery: {
          id: 'gal_' + Date.now(),
          items: coverImage ? [{
            id: 'item_' + Date.now(),
            src: coverImage,
            width: 1024,
            height: 1024,
            title: title,
            subtitle: 'Gallery',
            description: ''
          }] : []
        }
      },
      {
        id: 'sec_footer_' + Date.now(),
        viewType: 'Text',
        viewId: 'submenubig',
        elements: [
          {
            id: 'el_sub_title_' + Date.now(),
            view: 'shorttext-view',
            content: "Let's work together",
            style: { "margin-bottom": "1.75em" }
          },
          {
            id: 'el_sub_links_' + Date.now(),
            view: 'links-view',
            content: [
              { Title: "Portfolio", Link: "/" },
              { Title: "Services", Link: "/services" },
              { Title: "About", Link: "/about" }
            ],
            style: { "font-size": "4em", "text-transform": "uppercase", "line-height": "125%", "flex-direction": "column" }
          }
        ]
      }
    ]
  };

  data.pages.push(newPage);

  // Também adiciona no grid do Portfolio se for uma galeria de projeto
  const homePage = data.pages.find(p => p.isStartPage || p.url === '/');
  if (homePage) {
    const portfolioGrid = homePage.sections.find(s => s.gallery || (s.viewType === 'LinkPage' && s.gallery));
    if (portfolioGrid && portfolioGrid.gallery) {
      portfolioGrid.gallery.items.push({
        id: 'card_' + Date.now(),
        link: cleanUrl,
        src: coverImage || '/uploads/about.jpg',
        title: title,
        subtitle: 'Gallery',
        description: description || ''
      });
    }
  }

  saveData(data);
  res.json({ success: true, page: newPage });
});

// 5. Atualizar detalhes de uma página (título, descrição, tags)
app.put('/api/pages/:url', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url === 'home' ? '/' : (req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url);
  const { title, description, tags } = req.body;
  const data = readData();

  const page = data.pages.find(p => p.url === pageUrl || (pageUrl === '/' && p.isStartPage));
  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  if (title) page.title = title;

  // Atualiza seção de texto
  const textSec = page.sections.find(s => s.viewType === 'Text' && s.elements && s.elements.length > 0);
  if (textSec) {
    const titleEl = textSec.elements.find(e => e.view === 'header-view');
    if (titleEl && title) titleEl.content = title;

    const descEl = textSec.elements.find(e => e.view === 'longtext-view');
    if (descEl && description !== undefined) descEl.content = description;

    const tagsEl = textSec.elements.find(e => e.view === 'list-view');
    if (tagsEl && Array.isArray(tags)) {
      tagsEl.content = tags.map(t => (typeof t === 'string' ? { Title: t } : t));
    }
  }

  saveData(data);
  res.json({ success: true, page });
});

// 6. Atualizar itens/fotos de uma galeria (adicionar, reordenar, apagar)
app.put('/api/pages/:url/items', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url === 'home' ? '/' : (req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url);
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de itens inválida.' });
  }

  const data = readData();
  const page = data.pages.find(p => p.url === pageUrl || (pageUrl === '/' && p.isStartPage));
  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  // Acha a seção de galeria
  let gallerySec = page.sections.find(s => s.gallery);
  if (!gallerySec) {
    gallerySec = {
      id: 'sec_gallery_' + Date.now(),
      viewType: 'Gallery',
      viewId: 'evenrows',
      gallery: {
        id: 'gal_' + Date.now(),
        items: []
      }
    };
    page.sections.splice(1, 0, gallerySec);
  }

  gallerySec.gallery.items = items;
  saveData(data);
  res.json({ success: true, items });
});

// 7. Excluir uma página
app.delete('/api/pages/:url', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url;
  if (pageUrl === '/' || pageUrl === '/portfolio') {
    return res.status(400).json({ error: 'A página inicial não pode ser excluída.' });
  }

  const data = readData();
  const initialLength = data.pages.length;
  data.pages = data.pages.filter(p => p.url !== pageUrl);

  if (data.pages.length === initialLength) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  // Remove do menu se estiver lá
  data.menu = data.menu.filter(m => m.url !== pageUrl);

  // Remove do grid do portfolio se estiver lá
  const homePage = data.pages.find(p => p.isStartPage || p.url === '/');
  if (homePage) {
    const portfolioGrid = homePage.sections.find(s => s.gallery);
    if (portfolioGrid && portfolioGrid.gallery) {
      portfolioGrid.gallery.items = portfolioGrid.gallery.items.filter(item => item.link !== pageUrl);
    }
  }

  saveData(data);
  res.json({ success: true, message: 'Página removida com sucesso!' });
});

// 8. Rota de upload de fotos (Multer)
app.post('/api/upload', upload.array('photos', 20), (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== currentAdminToken) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const uploadedFiles = req.files.map(file => ({
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    src: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    title: '',
    subtitle: '',
    description: ''
  }));

  res.json({ success: true, files: uploadedFiles });
});

// 9. Envio do formulário de contato
app.post('/api/contact', (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  console.log(`[Mensagem de Contato Recebida] De: ${firstName} ${lastName} <${email}>\nMensagem: ${message}`);
  
  // Salvar mensagem recebida em arquivo de log/leads
  const leadsPath = path.join(__dirname, 'data', 'messages.json');
  let messages = [];
  if (fs.existsSync(leadsPath)) {
    try { messages = JSON.parse(fs.readFileSync(leadsPath, 'utf-8')); } catch (e) {}
  }
  messages.push({
    id: 'msg_' + Date.now(),
    date: new Date().toISOString(),
    firstName,
    lastName,
    email,
    message
  });
  fs.writeFileSync(leadsPath, JSON.stringify(messages, null, 2), 'utf-8');

  res.json({ success: true, message: 'Obrigado pelo contato! Sua mensagem foi enviada com sucesso.' });
});

// 10. Fallback para o SPA e rotas diretas
app.use((req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🚀 Art Portfolio Server rodando na porta ${PORT}`);
  console.log(` 👉 Site Público: http://localhost:${PORT}`);
  console.log(` 🔑 Painel ADM:   http://localhost:${PORT}/admin.html`);
  console.log(` 🔐 Senha Padrão: admin123`);
  console.log(`====================================================`);
});

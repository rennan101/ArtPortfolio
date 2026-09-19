const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'art_portfolio_secret_jwt_key_2026_@rennansite';

// Configuração do JSON e CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Armazenamento de uploads com Multer em Memória (Essencial para Vercel Serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Somente arquivos de imagem são permitidos!'), false);
    }
  }
});

// Diretório local para uploads quando rodando fora do serverless
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {}
}

// Configuração do Cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isCloudinaryConfigured = false;
if (cloudinaryUrl) {
  cloudinary.config({ url: cloudinaryUrl });
  isCloudinaryConfigured = true;
  console.log('☁️ Cloudinary configurado via CLOUDINARY_URL.');
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  isCloudinaryConfigured = true;
  console.log('☁️ Cloudinary configurado com sucesso via credenciais separadas.');
} else {
  console.log('ℹ️ Cloudinary não configurado. Usando fallback de armazenamento local / Base64.');
}

// Armazenamento em Nuvem / Local Híbrido (Upstash Redis / Vercel KV)
const dbPath = path.join(__dirname, 'data', 'site-data.json');
let inMemoryCache = null;

let redisClient = null;
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('⚡ Upstash Redis / Vercel KV conectado para persistência em nuvem.');
  } catch (e) {
    console.error('Erro ao instanciar Redis:', e.message);
  }
}

// Helper síncrono para leitura inicial
function getInitialLocalData() {
  if (fs.existsSync(dbPath)) {
    try {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (e) {}
  }
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
    adminPasswordHash: "$2b$10$8Oy52wLdi4ZwUOTna.1/1ugK0jwPg.y3rSj5ODWnn8etOsIDjbtaO",
    pages: []
  };
}

// Leitura assíncrona com suporte a Nuvem (Redis/KV) + Cache + Arquivo
async function readData() {
  if (redisClient) {
    try {
      const cloudData = await redisClient.get('site_data');
      if (cloudData) {
        inMemoryCache = typeof cloudData === 'string' ? JSON.parse(cloudData) : cloudData;
        return inMemoryCache;
      }
    } catch (err) {
      console.warn('Aviso: Falha ao ler do Redis, usando fallback local/cache:', err.message);
    }
  }

  if (inMemoryCache) {
    return inMemoryCache;
  }

  inMemoryCache = getInitialLocalData();
  return inMemoryCache;
}

// Gravação assíncrona com suporte a Nuvem (Redis/KV) + Cache + Arquivo
async function saveData(data) {
  inMemoryCache = data;

  if (redisClient) {
    try {
      await redisClient.set('site_data', JSON.stringify(data));
      console.log('✅ Dados salvos na nuvem (Upstash Redis) com sucesso!');
    } catch (err) {
      console.error('Erro ao gravar no Redis:', err.message);
    }
  }

  // Grava no disco local quando suportado
  try {
    if (fs.existsSync(path.dirname(dbPath))) {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (e) {}
}

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

/* ============================================================
   AUTENTICAÇÃO STATELESS (JWT)
   ============================================================ */
function isAuthenticated(req) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return false;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'admin';
  } catch (err) {
    return false;
  }
}

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  const data = await readData();

  if (!password) {
    return res.status(400).json({ success: false, message: 'Senha é obrigatória.' });
  }

  // Verifica se a senha confere com o hash bcrypt ou fallback padrão
  const defaultHash = "$2b$10$8Oy52wLdi4ZwUOTna.1/1ugK0jwPg.y3rSj5ODWnn8etOsIDjbtaO"; // Rennan0712@
  const currentHash = data.adminPasswordHash || defaultHash;

  const isMatch = (
    (currentHash.startsWith('$2b$') || currentHash.startsWith('$2a$'))
      ? bcrypt.compareSync(password, currentHash)
      : password === currentHash || password === 'Rennan0712@'
  );

  if (isMatch) {
    const token = jwt.sign({ role: 'admin', time: Date.now() }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Senha incorreta.' });
});

app.post('/api/admin/verify', (req, res) => {
  if (isAuthenticated(req)) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

app.post('/api/admin/change-password', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const { currentPassword, newPassword } = req.body;
  const data = await readData();
  const currentHash = data.adminPasswordHash || "$2b$10$8Oy52wLdi4ZwUOTna.1/1ugK0jwPg.y3rSj5ODWnn8etOsIDjbtaO";

  const isCurrentMatch = (
    (currentHash.startsWith('$2b$') || currentHash.startsWith('$2a$'))
      ? bcrypt.compareSync(currentPassword, currentHash)
      : currentPassword === currentHash
  );

  if (!isCurrentMatch) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres.' });
  }

  data.adminPasswordHash = bcrypt.hashSync(newPassword, 10);
  await saveData(data);
  return res.json({ success: true, message: 'Senha atualizada com sucesso!' });
});

/* ============================================================
   ROTAS PÚBLICAS E ADMINISTRATIVAS DE DADOS
   ============================================================ */

// 1. Obter dados completos do site
app.get('/api/site', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const data = await readData();
  const safeData = { ...data };
  delete safeData.adminPasswordHash;
  res.json(safeData);
});

// Helper para criar estrutura padrão de página com galeria
function createDefaultGalleryPage(title, cleanUrl, coverImage = '', description = '', tags = ['Visuals', 'Storytelling', 'Brand']) {
  return {
    id: 'page_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
            content: tags.map(t => ({ Title: typeof t === 'string' ? t : (t.Title || '') })),
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
              { Title: "About", Link: "/about" },
              { Title: "Contact", Link: "/contact" }
            ],
            style: { "font-size": "4em", "text-transform": "uppercase", "line-height": "125%", "flex-direction": "column" }
          }
        ]
      }
    ]
  };
}

// 2. Atualizar informações gerais do site (perfil, bio, redes, footer, menu)
app.put('/api/site', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const data = await readData();
  const { title, artistName, profession, bio, aboutLongBio, avatar, email, phone, address, socialLinks, menu } = req.body;

  if (title !== undefined) data.title = title;

  if (artistName !== undefined) {
    data.artistName = artistName;
    if (!data.title || data.title === 'Max Doe') data.title = artistName;

    // Atualiza na página Home
    const homePage = data.pages.find(p => p.isStartPage || p.url === '/' || p.url === '/portfolio');
    if (homePage && homePage.sections) {
      const textSec = homePage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const tEl = textSec.elements.find(e => e.view === 'header-view');
        if (tEl) tEl.content = artistName;
      }
    }

    // Atualiza na página About
    const aboutPage = data.pages.find(p => p.url === '/about');
    if (aboutPage && aboutPage.sections) {
      const textSec = aboutPage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const tEl = textSec.elements.find(e => e.view === 'header-view');
        if (tEl) tEl.content = artistName;
      }
    }
  }

  if (profession !== undefined) {
    data.profession = profession;
    const homePage = data.pages.find(p => p.isStartPage || p.url === '/' || p.url === '/portfolio');
    if (homePage && homePage.sections) {
      const textSec = homePage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const subEl = textSec.elements.find(e => e.view === 'shorttext-view');
        if (subEl) subEl.content = profession;
      }
    }
    const aboutPage = data.pages.find(p => p.url === '/about');
    if (aboutPage && aboutPage.sections) {
      const textSec = aboutPage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const subEl = textSec.elements.find(e => e.view === 'shorttext-view');
        if (subEl) subEl.content = profession;
      }
    }
  }

  if (bio !== undefined) {
    data.bio = bio;
    const homePage = data.pages.find(p => p.isStartPage || p.url === '/' || p.url === '/portfolio');
    if (homePage && homePage.sections) {
      const textSec = homePage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const descEl = textSec.elements.find(e => e.view === 'longtext-view');
        if (descEl) descEl.content = bio;
      }
    }
  }

  if (aboutLongBio !== undefined) {
    data.aboutLongBio = aboutLongBio;
    const aboutPage = data.pages.find(p => p.url === '/about');
    if (aboutPage && aboutPage.sections) {
      const textSec = aboutPage.sections.find(s => s.viewType === 'Text');
      if (textSec && textSec.elements) {
        const descEl = textSec.elements.find(e => e.view === 'longtext-view');
        if (descEl) descEl.content = aboutLongBio;
      }
    }
  }

  if (avatar !== undefined) data.avatar = avatar;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (address !== undefined) data.address = address;
  if (socialLinks !== undefined) data.socialLinks = socialLinks;

  // Atualização do menu com criação automática de página/galeria para qualquer novo menu
  if (menu !== undefined && Array.isArray(menu)) {
    data.menu = menu;

    const homePage = data.pages.find(p => p.isStartPage || p.url === '/' || p.url === '/portfolio');
    const homeGrid = homePage?.sections?.find(s => s.gallery);

    menu.forEach(item => {
      if (item.url && item.url.startsWith('/') && item.url !== '/' && item.url !== '/portfolio' && item.url !== '/services' && item.url !== '/about' && item.url !== '/contact') {
        const pageExists = data.pages.some(p => p.url === item.url);
        if (!pageExists) {
          const newGalleryPage = createDefaultGalleryPage(item.title || item.url.replace('/', ''), item.url);
          data.pages.push(newGalleryPage);

          if (homeGrid && homeGrid.gallery && homeGrid.gallery.items) {
            homeGrid.gallery.items.push({
              id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
              link: item.url,
              src: '/uploads/about.jpg',
              title: item.title,
              subtitle: 'Gallery',
              description: ''
            });
          }
        }
      }
    });
  }

  await saveData(data);
  res.json({ success: true, message: 'Dados do site atualizados com sucesso!', data });
});

// 3. Obter dados de uma página específica
app.get('/api/pages/:url', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const pageUrl = req.params.url === 'home' ? '/' : '/' + req.params.url;
  const data = await readData();
  const page = data.pages.find(p => p.url === pageUrl || p.url === '/' + req.params.url || (pageUrl === '/' && p.isStartPage));

  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  res.json(page);
});

// 4. Criar nova página/galeria
app.post('/api/pages', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const { title, url, description, tags, coverImage } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Título e URL são obrigatórios.' });
  }

  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  const data = await readData();

  if (data.pages.some(p => p.url === cleanUrl)) {
    return res.status(400).json({ error: 'Uma página com esta URL já existe.' });
  }

  const newPage = createDefaultGalleryPage(title, cleanUrl, coverImage, description, tags || ['Visuals', 'Storytelling', 'Brand']);
  data.pages.push(newPage);

  // Garante que a nova página também entra no menu de navegação automaticamente
  if (!data.menu) data.menu = [];
  if (!data.menu.some(m => m.url === cleanUrl)) {
    data.menu.push({ title, url: cleanUrl });
  }

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

  await saveData(data);
  res.json({ success: true, page: newPage });
});

// 5. Atualizar detalhes de uma página
app.put('/api/pages/:url', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url === 'home' ? '/' : (req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url);
  const { title, description, tags } = req.body;
  const data = await readData();

  const page = data.pages.find(p => p.url === pageUrl || (pageUrl === '/' && p.isStartPage));
  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  if (title) page.title = title;

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

  await saveData(data);
  res.json({ success: true, page });
});

// 6. Atualizar itens/fotos de uma galeria
app.put('/api/pages/:url/items', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url === 'home' ? '/' : (req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url);
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de itens inválida.' });
  }

  const data = await readData();
  const page = data.pages.find(p => p.url === pageUrl || (pageUrl === '/' && p.isStartPage));
  if (!page) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

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
  await saveData(data);
  res.json({ success: true, items });
});

// 7. Excluir uma página
app.delete('/api/pages/:url', async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const pageUrl = req.params.url.startsWith('/') ? req.params.url : '/' + req.params.url;
  if (pageUrl === '/' || pageUrl === '/portfolio') {
    return res.status(400).json({ error: 'A página inicial não pode ser excluída.' });
  }

  const data = await readData();
  const initialLength = data.pages.length;
  data.pages = data.pages.filter(p => p.url !== pageUrl);

  if (data.pages.length === initialLength) {
    return res.status(404).json({ error: 'Página não encontrada.' });
  }

  data.menu = data.menu.filter(m => m.url !== pageUrl);

  const homePage = data.pages.find(p => p.isStartPage || p.url === '/');
  if (homePage) {
    const portfolioGrid = homePage.sections.find(s => s.gallery);
    if (portfolioGrid && portfolioGrid.gallery) {
      portfolioGrid.gallery.items = portfolioGrid.gallery.items.filter(item => item.link !== pageUrl);
    }
  }

  await saveData(data);
  res.json({ success: true, message: 'Página removida com sucesso!' });
});

// Helper para upload de buffer para o Cloudinary via Stream
function uploadBufferToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'art_portfolio',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// 8. Rota de upload de fotos resiliente (Cloudinary / Local / Base64 fallback)
app.post('/api/upload', upload.array('photos', 20), async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Sessão expirada ou não autorizada. Faça login novamente.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileId = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      if (isCloudinaryConfigured) {
        try {
          const result = await uploadBufferToCloudinary(file.buffer, file.originalname);
          uploadedFiles.push({
            id: fileId,
            src: result.secure_url,
            filename: result.public_id,
            originalName: file.originalname,
            size: result.bytes,
            title: '',
            subtitle: 'Gallery',
            description: ''
          });
          continue;
        } catch (cloudErr) {
          console.error('Erro no upload do Cloudinary:', cloudErr.message);
          // Continua para o fallback
        }
      }

      // Se não estiver no Vercel (rodando localmente com permissão de escrita)
      if (!process.env.VERCEL) {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          const localFileName = `${cleanBase}-${uniqueSuffix}${ext}`;
          const localFilePath = path.join(uploadsDir, localFileName);
          
          fs.writeFileSync(localFilePath, file.buffer);
          
          uploadedFiles.push({
            id: fileId,
            src: `/uploads/${localFileName}`,
            filename: localFileName,
            originalName: file.originalname,
            size: file.size,
            title: '',
            subtitle: 'Gallery',
            description: ''
          });
          continue;
        } catch (localWriteErr) {
          console.warn('Fallback local falhou:', localWriteErr.message);
        }
      }

      // Fallback supremo: Base64 Data URI (nunca falha, persiste no Redis e no navegador)
      const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      uploadedFiles.push({
        id: fileId,
        src: base64Data,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        title: '',
        subtitle: 'Gallery',
        description: ''
      });
    }

    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    console.error('Erro no processamento do upload:', err);
    res.status(500).json({ error: 'Falha no processamento do upload: ' + (err.message || 'Erro desconhecido') });
  }
});

// 9. Envio do formulário de contato
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  console.log(`[Mensagem de Contato] De: ${firstName} ${lastName} <${email}>\nMensagem: ${message}`);
  
  const newMsg = {
    id: 'msg_' + Date.now(),
    date: new Date().toISOString(),
    firstName,
    lastName,
    email,
    message
  };

  if (redisClient) {
    try {
      const existing = await redisClient.get('contact_messages') || [];
      const msgList = typeof existing === 'string' ? JSON.parse(existing) : existing;
      msgList.push(newMsg);
      await redisClient.set('contact_messages', JSON.stringify(msgList));
    } catch (e) {}
  }

  if (!process.env.VERCEL) {
    try {
      const leadsPath = path.join(__dirname, 'data', 'messages.json');
      let messages = [];
      if (fs.existsSync(leadsPath)) {
        try { messages = JSON.parse(fs.readFileSync(leadsPath, 'utf-8')); } catch (e) {}
      }
      messages.push(newMsg);
      fs.writeFileSync(leadsPath, JSON.stringify(messages, null, 2), 'utf-8');
    } catch (e) {}
  }

  res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
});

// 10. Rota de Tradução Automática em Tempo Real (Google Translate Engine + Cache Redis)
async function performTranslate(text, targetLang) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  
  const cleanTarget = targetLang.toLowerCase().startsWith('pt') ? 'pt' : targetLang.toLowerCase();
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${cleanTarget}&dt=t&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(url);
    const data = await response.json();
    let translated = text;
    if (data && data[0]) {
      translated = data[0].map(item => item[0]).join('');
    }

    // Se o destino for PT-PT, aplica adaptações ortográficas
    if (targetLang === 'pt-pt') {
      translated = translated
        .replace(/\bcontato\b/gi, 'contacto')
        .replace(/\bcontatos\b/gi, 'contactos')
        .replace(/\bfato\b/gi, 'facto')
        .replace(/\bfatos\b/gi, 'factos')
        .replace(/\bprojeto\b/gi, 'projecto')
        .replace(/\bprojetos\b/gi, 'projectos')
        .replace(/\bequipe\b/gi, 'equipa')
        .replace(/\bequipes\b/gi, 'equipas')
        .replace(/\bconosco\b/gi, 'connosco')
        .replace(/\bvocê\b/gi, 'consigo')
        .replace(/\bcelular\b/gi, 'telemóvel');
    }

    return translated;
  } catch (err) {
    console.warn('Falha na API de tradução:', err.message);
    return text;
  }
}

app.post('/api/translate', async (req, res) => {
  const { text, texts, target } = req.body;
  const targetLang = target || 'en';

  try {
    if (Array.isArray(texts)) {
      const results = [];
      for (const t of texts) {
        if (!t) {
          results.push('');
          continue;
        }
        const cacheKey = `trans_${targetLang}_${Buffer.from(t).toString('base64').substring(0, 40)}`;
        if (redisClient) {
          try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
              results.push(cached);
              continue;
            }
          } catch (e) {}
        }
        const translated = await performTranslate(t, targetLang);
        if (redisClient) {
          try { await redisClient.set(cacheKey, translated); } catch (e) {}
        }
        results.push(translated);
      }
      return res.json({ success: true, translations: results });
    }

    if (text) {
      const cacheKey = `trans_${targetLang}_${Buffer.from(text).toString('base64').substring(0, 40)}`;
      if (redisClient) {
        try {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            return res.json({ success: true, translation: cached, cached: true });
          }
        } catch (e) {}
      }
      const translated = await performTranslate(text, targetLang);
      if (redisClient) {
        try { await redisClient.set(cacheKey, translated); } catch (e) {}
      }
      return res.json({ success: true, translation: translated });
    }

    return res.status(400).json({ error: 'Nenhum texto informado para tradução.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar tradução: ' + err.message });
  }
});

// 11. Fallback para o SPA e rotas diretas
app.use((req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` 🚀 Art Portfolio Server rodando na porta ${PORT}`);
    console.log(` 👉 Site Público: http://localhost:${PORT}`);
    console.log(` 🔑 Painel ADM:   http://localhost:${PORT}/admin.html`);
    console.log(` 🔐 Senha ADM:    Rennan0712@`);
    console.log(`====================================================`);
  });
}

module.exports = app;

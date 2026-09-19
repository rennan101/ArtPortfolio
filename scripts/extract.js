const fs = require('fs');
const path = require('path');
const https = require('https');

// Cria pastas
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Lê os dados brutos salvos da extração
const contentMdPath = '/Users/rennan/.gemini/antigravity-ide/brain/f720e60f-27d0-4ee3-9a3d-4317e2dd30c8/.system_generated/steps/7/content.md';
const content = fs.readFileSync(contentMdPath, 'utf-8');

// Encontra o json de serverPages
const serverPagesMatch = content.match(/pages\.actions\.init\.serverPages\(([\s\S]*?)\);\s*\n\s*site\.actions\.init\.site\(([\s\S]*?)\);/);

if (!serverPagesMatch) {
  console.error('Could not find serverPages or site data in content.md');
  process.exit(1);
}

const rawPages = JSON.parse(serverPagesMatch[1]);
const rawSite = JSON.parse(serverPagesMatch[2]);

console.log(`Found ${rawPages.length} pages in original data.`);

// Função para baixar arquivo
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Server responded with ${response.statusCode}: ${url}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Processar páginas para nosso formato simplificado e limpo
async function processData() {
  const imagesToDownload = new Set();

  // Processa as páginas
  const cleanPages = rawPages.map((page) => {
    const cleanPage = {
      id: page.Guid,
      url: page.Url === '/portfolio' ? '/' : page.Url,
      title: page.Title,
      isStartPage: page.IsStartPage === 1 || page.Url === '/portfolio' || page.Url === '/',
      sections: []
    };

    page.Sections.forEach((section) => {
      const cleanSec = {
        id: section.Guid,
        viewType: section.ViewType,
        viewId: section.ViewId,
        elements: []
      };

      if (section.ElementsTop && section.ElementsTop.length > 0) {
        section.ElementsTop.forEach(el => {
          cleanSec.elements.push({
            id: el.Guid,
            view: el.View,
            content: el.Content,
            style: el.Style,
            settings: el.Settings
          });
          if (el.Content && el.Content.Src) {
            imagesToDownload.add(el.Content.Src);
          }
        });
      }

      if (section.ElementsFixed && section.ElementsFixed.Items1) {
        const items = section.ElementsFixed.Items1;
        const galleryItems = [];

        if (items.Content && Array.isArray(items.Content)) {
          items.Content.forEach(item => {
            if (item.Content && item.Content.Src) {
              imagesToDownload.add(item.Content.Src);
              galleryItems.push({
                id: item.Guid,
                src: item.Content.Src,
                width: item.Content.Width,
                height: item.Content.Height,
                alt: item.Content.Alt || '',
                link: item.Content.Link || null,
                title: (item.Content.FigCaptions && item.Content.FigCaptions[0]) ? item.Content.FigCaptions[0].Content : '',
                subtitle: (item.Content.FigCaptions && item.Content.FigCaptions[1]) ? item.Content.FigCaptions[1].Content : '',
                description: (item.Content.FigCaptions && item.Content.FigCaptions[2]) ? item.Content.FigCaptions[2].Content : ''
              });
            }
          });
        }

        cleanSec.gallery = {
          id: items.Guid,
          settings: items.Settings,
          items: galleryItems
        };
      }

      cleanPage.sections.push(cleanSec);
    });

    return cleanPage;
  });

  console.log(`Identified ${imagesToDownload.size} images to download.`);

  // Baixar imagens
  const baseUrl = 'https://cdn.portfolioboxdns.com';
  let downloadedCount = 0;
  let failedCount = 0;

  for (const src of imagesToDownload) {
    const filename = path.basename(src);
    const destPath = path.join(uploadsDir, filename);
    const downloadUrl = baseUrl + src;

    if (!fs.existsSync(destPath)) {
      try {
        await downloadFile(downloadUrl, destPath);
        downloadedCount++;
      } catch (err) {
        // Tentar direto no domínio principal se falhar
        try {
          await downloadFile('https://artisttemplate3.portfoliobox.net' + src, destPath);
          downloadedCount++;
        } catch (err2) {
          console.warn(`Failed to download ${src}: ${err2.message}`);
          failedCount++;
        }
      }
    }
  }

  console.log(`Download complete: ${downloadedCount} downloaded, ${failedCount} failed.`);

  // Atualizar caminhos das imagens para /uploads/[filename]
  cleanPages.forEach(p => {
    p.sections.forEach(s => {
      s.elements.forEach(e => {
        if (e.content && e.content.Src) {
          e.content.Src = '/uploads/' + path.basename(e.content.Src);
        }
      });
      if (s.gallery && s.gallery.items) {
        s.gallery.items.forEach(item => {
          if (item.src) {
            item.src = '/uploads/' + path.basename(item.src);
          }
        });
      }
    });
  });

  const siteConfig = {
    title: rawSite.Title || "Max Doe",
    artistName: "Max Doe",
    profession: "Visual Artist",
    bio: "I believe in design that feels, not just functions. Built on curiosity, dialogue, and craft, my work explores how form and message shape experience. Every project is a collaboration, grounded in clarity and made to last.",
    aboutLongBio: "My work explores the quiet rhythm between light, texture, and human presence. I move between painting, printmaking, and mixed media — always drawn to subtle tension and stillness. Each piece begins with observation and becomes a search for balance between control and chance.",
    avatar: "/uploads/about.jpg",
    email: "max.doe@gmail.com",
    phone: "+46 70 11 22 33",
    address: "Gustavslundsv 99, 167 51 BROMMA",
    socialLinks: [
      { name: "Instagram", url: "https://www.instagram.com/portfoliobox", icon: "instagram" },
      { name: "Twitter", url: "https://twitter.com", icon: "twitter" },
      { name: "Facebook", url: "", icon: "facebook" },
      { name: "LinkedIn", url: "", icon: "linkedin" }
    ],
    menu: [
      { title: "Portfolio", url: "/" },
      { title: "Services", url: "/services" },
      { title: "About", url: "/about" },
      { title: "Contact", url: "/contact" }
    ],
    adminPasswordHash: "admin123", // Senha inicial padrão
    pages: cleanPages
  };

  fs.writeFileSync(path.join(dataDir, 'site-data.json'), JSON.stringify(siteConfig, null, 2), 'utf-8');
  console.log('Successfully written data/site-data.json');
}

processData().catch(console.error);
